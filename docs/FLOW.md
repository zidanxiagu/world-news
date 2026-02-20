# 每日调用、执行到部署 GitHub 流程图

---

## 总览：两条主路径

```mermaid
flowchart LR
  subgraph 路径A["路径 A：GitHub 每日自动"]
    A1[定时 08:00 北京] --> A2[Daily build workflow]
    A2 --> A3[拉取数据 无LLM]
    A3 --> A4[构建 + 部署 Pages]
  end

  subgraph 路径B["路径 B：本地/OpenClaw + 仅部署"]
    B1[本地/OpenClaw 定时] --> B2[trending-analysis]
    B2 --> B3[抓取 + Top10 LLM 摘要]
    B3 --> B4[写 data/*.json]
    B4 --> B5[git push]
    B5 --> B6[手动 Run Deploy only]
    B6 --> B7[用仓库 data 构建 + 部署]
  end

  A4 --> 站点[world-news 站点]
  B7 --> 站点
```

---

## 路径 A：GitHub 每日自动（无 LLM）

每天 08:00 北京时间（或手动 Run workflow）触发，拉取数据、构建、部署。**不跑大模型**，站点展示的是「无内容摘要」的数据。

```mermaid
flowchart TD
  Start([每天 08:00 北京 / 或手动 Run workflow]) --> Checkout[checkout 仓库]
  Checkout --> Install[安装依赖 npm install]
  Install --> Config[Prepare config<br>cp config.example.js config.js]
  Config --> Crawl[Crawl all<br>YouTube/Reddit/新闻 等]
  Crawl --> Copy[Copy data to public<br>data/ → site/public/data/]
  Copy --> BuildSite[Build site<br>cd site && npm run build]
  BuildSite --> Upload[Upload Pages artifact<br>site/out]
  Upload --> Deploy[Deploy to GitHub Pages<br>deploy-pages]
  Deploy --> End([站点更新<br>zidanxiagu.github.io/world-news])

  style Crawl fill:#e1f5fe
  style Deploy fill:#c8e6c9
```

| 步骤 | 说明 |
|------|------|
| Crawl all | 用仓库 Secrets 的 YOUTUBE_API_KEY 等拉取数据；**无 LLM**，无每条视频 contentSummary |
| Copy data to public | 把本次爬到的 data 拷到 site/public/data，供构建时读 |
| Deploy | 用 GitHub Actions 的 deploy-pages 发布到 Pages |

---

## 路径 B：本地/OpenClaw 抓取 + LLM 分析 → 推送到 GitHub → 仅部署

在本地或 OpenClaw 每日定时跑「热门分析」，再把带摘要的数据推到仓库，最后在 GitHub 上触发「仅部署」，站点就会展示 **Top10 + 内容摘要**。

```mermaid
flowchart TD
  Start([OpenClaw 每日定时 / 或本地手动]) --> Run[运行<br>node scripts/cli.js trending-analysis]
  Run --> Fetch[抓取 YouTube 热门]
  Fetch --> Top10[取 Top 10]
  Top10 --> LLM[每条调 LLM 生成内容摘要<br>snippet / Ollama / Gemini / Grok]
  LLM --> Write[写入 data/trending-videos/YYYY-MM-DD.json<br>含 analysisTop10、contentSummary]
  Write --> GitAdd["git add -f data/trending-videos/*.json"]
  GitAdd --> Commit["git commit + git push origin main"]
  Commit --> Trigger[push 到 main 后<br>自动触发 Deploy only]
  Trigger --> D_Checkout[checkout 仓库<br>含你刚 push 的 data]
  D_Checkout --> D_Copy[Copy data to public]
  D_Copy --> D_Build[Build site]
  D_Build --> D_Deploy[Deploy to GitHub Pages]
  D_Deploy --> End([站点更新<br>带 Top10 与 LLM 摘要])

  style LLM fill:#fff3e0
  style D_Deploy fill:#c8e6c9
```

| 阶段 | 说明 |
|------|------|
| 本地/OpenClaw | `trending-analysis` = 抓热门 + 对 Top10 逐条做摘要（snippet/Ollama/Gemini/Grok），写回 JSON |
| 推送 | 把 `data/trending-videos/YYYY-MM-DD.json` 提交并 push 到 main；**push 后会自动触发 Deploy only**，无需再手动点 Run workflow |
| 仅部署 | **Deploy only (no crawl)** 用仓库里已有 data 构建并部署到 Pages |

### 路径 B 你还缺什么（自检）

| 项 | 说明 | 如何补上 |
|----|------|----------|
| **1. 本地 config.js** | YouTube apiKey + 摘要来源（summaryVideoProvider：snippet/ollama/gemini/grok） | 复制 config.example.js 为 config.js，填密钥；用免费可设 `summaryVideoProvider: 'snippet'` |
| **2. 至少跑通一次** | 本地要有过一条 `data/trending-videos/YYYY-MM-DD.json`（含 analysisTop10） | 执行 `node scripts/cli.js trending-analysis`，看 data 目录是否生成当日 JSON |
| **3. 推送 data** | 仓库里要有 data 文件，Deploy only 才会用到 | `git add -f data/trending-videos/YYYY-MM-DD.json` → commit → push；或用脚本 `./scripts/run-daily-trending-analysis-and-push.sh` 一步完成分析+推送 |
| **4. OpenClaw 定时（可选）** | 每天自动跑分析（+ 可选自动推送） | OpenClaw 里添加定时任务：执行 `run-daily-trending-analysis.sh`（仅分析）或 `run-daily-trending-analysis-and-push.sh`（分析并 push，需本机 git 能 push） |
| **5. 本机 git 能 push** | 若用「分析+推送」脚本或手动推送 | `git remote -v` 确认 origin 指向正确仓库；SSH 或 token 已配置，能 `git push origin main` |

---

## 两个 Workflow 分工

```mermaid
flowchart LR
  subgraph Daily["Daily build and deploy"]
    D1[拉取数据] --> D2[构建] --> D3[部署]
  end

  subgraph DeployOnly["Deploy only (no crawl)"]
    O1[不拉取] --> O2[用仓库 data 构建] --> O3[部署]
  end

  Manual1[手动 Run workflow] --> Daily
  Manual2[手动 Run workflow] --> DeployOnly
  Cron[定时 08:00] --> Daily
```

| Workflow | 触发 | 是否拉取数据 | 是否跑 LLM | 用途 |
|----------|------|--------------|------------|------|
| **Daily build and deploy** | 定时 08:00 / 手动 | ✅ 是（用 Secrets） | ❌ 否 | 每日自动更新站点，数据无摘要 |
| **Deploy only (no crawl)** | 仅手动 | ❌ 否 | ❌ 否 | 你本地跑完 analysis 并 push 后，用仓库 data 重新构建并部署 |

---

## 数据流简图

```mermaid
flowchart TD
  YT[YouTube API] --> Crawl
  Crawl[scripts/cli.js<br>trending-videos / trending-analysis] --> JSON["data/trending-videos/<br>YYYY-MM-DD.json"]
  LLM[snippet / Ollama / Gemini / Grok] --> Crawl
  JSON --> Copy["copy-data-to-public.js"]
  Copy --> Public["site/public/data/"]
  Public --> Build[Next.js build]
  Build --> Out["site/out/"]
  Out --> Pages[GitHub Pages]
```

说明：**Crawl** 产出 JSON 到 `data/`；**Copy** 把 data 拷到 `site/public/data/`；**Build** 把站点（含读 public/data）打成静态 `site/out/`；**Pages** 部署的是 `site/out/`。
