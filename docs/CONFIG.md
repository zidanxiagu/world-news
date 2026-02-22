# 配置教程

本页说明需要配置哪些项、如何获取、以及填在哪里（本地 / GitHub Actions）。

---

## 一、本地运行要配什么

在项目根目录执行 `node scripts/cli.js trending-videos` 或 `node scripts/cli.js all` 时，脚本会读取配置。有两种方式：

1. **推荐**：复制 `scripts/config.example.js` 为 `scripts/config.js`，在 `config.js` 里填入密钥（不要提交到 Git）。
2. 使用**环境变量**，与 `config.js` 中对应项一致（环境变量会覆盖 `config.js` 里的空字符串）。

---

## 二、各项配置说明

### 1. YouTube 热门与趋势（必配才有真实数据）

| 配置项 | 说明 | 如何获取 | 本地填写位置 |
|--------|------|----------|--------------|
| **YOUTUBE_API_KEY** | YouTube Data API v3 密钥（可选） | 见下方「获取 YouTube API Key」 | `config.js` → `youtube.apiKey` 或环境变量 `YOUTUBE_API_KEY` |
| **useScraper** | 无 Key 时是否从官网抓取 | 默认 true：无 Key 或 API 失败时自动用页面抓取 | `config.js` → `youtube.useScraper` 或环境变量 `YOUTUBE_USE_SCRAPER=false` 关闭 |
| **regions** | 抓取哪些地区的热门 | 地区代码，如 US、GB、JP | `config.js` → `youtube.regions` 或环境变量 `YOUTUBE_REGIONS`（逗号分隔，如 `US,GB,JP`） |
| **maxResultsPerRegion** | 每个地区最多取多少条 | 数字，默认 15 | 一般用默认即可，在 `config.js` 里改 |
| **summaryApiUrl** / **summaryApiKey** | 可选：调用外部 API 生成文字摘要 | 你自己的摘要服务（如 LLM 接口） | 不配则用内置简单摘要（前 8 条标题拼接） |

#### 获取 YouTube API Key

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)。
2. 新建或选择一个项目。
3. 左侧 **API 和服务** → **库** → 搜索 **YouTube Data API v3** → 启用。
4. **API 和服务** → **凭据** → **创建凭据** → **API 密钥**。
5. 复制生成的 API 密钥，填入 `config.js` 的 `youtube.apiKey`，或导出环境变量：
   ```bash
   export YOUTUBE_API_KEY="你的密钥"
   ```

**注意**：未配置 API Key 时，若已开启「从官网抓取」（`youtube.useScraper` 默认 true），会尝试从 YouTube 页面 HTML 中的 `ytInitialData` 提取热门列表，无需 Key。若抓取失败或你设了 `useScraper: false`，则会显示占位或拉取失败提示。

---

### 2. Reddit（可选）

用于「极客社区」Reddit 热门。若不配，可改用 RSS 或留空。

| 配置项 | 说明 | 如何获取 |
|--------|------|----------|
| **REDDIT_CLIENT_ID** | Reddit 应用 Client ID | [Reddit Apps](https://www.reddit.com/prefs/apps) 创建 “script” 应用，取 client id（在应用名下面的短字符串） |
| **REDDIT_CLIENT_SECRET** | Reddit 应用 Secret | 同上，创建应用时显示的 secret |
| **REDDIT_USER_AGENT** | 请求头 User-Agent | 任意标识，如 `personal-homepage/1.0`，可不改 |

本地：`config.js` → `reddit.clientId` / `reddit.clientSecret` / `reddit.userAgent`，或环境变量。

---

### 3. 新闻 RSS（无需配置）

`config.js` 里 `news.feeds` 已写默认 RSS 地址，一般不用改。若要加/改源，直接改 `config.js` 中的 `feeds` 数组即可。

---

### 4. 数据与仓库路径（一般不用改）

- **PERSONAL_HOMEPAGE_DATA**：数据目录，默认项目下 `data/`。
- **PERSONAL_HOMEPAGE_REPO**：仓库根目录，默认脚本自动推断。

只有你自定义了目录结构时才需要设这两个环境变量。

---

## 三、GitHub Actions 自动构建要配的

若站点部署在 GitHub Pages，并由 `.github/workflows/daily-build.yml` 每日拉数据并发布，需要在**仓库 Settings → Secrets and variables → Actions** 里添加以下 Secrets（只配你实际用到的即可）：

| Secret 名称 | 说明 | 必填 |
|-------------|------|------|
| **YOUTUBE_API_KEY** | 同上，YouTube Data API v3 密钥 | 想自动抓 YouTube 热门时必填 |
| **YOUTUBE_REGIONS** | 可选，如 `US,GB,JP`，不填则用默认 US,GB | 否 |
| **YOUTUBE_SUMMARY_API_URL** | 可选，摘要 API 地址 | 否 |
| **YOUTUBE_SUMMARY_API_KEY** | 可选，摘要 API 鉴权 | 否 |
| **REDDIT_CLIENT_ID** | Reddit 应用 Client ID | 想抓 Reddit 时填 |
| **REDDIT_CLIENT_SECRET** | Reddit 应用 Secret | 想抓 Reddit 时填 |

Workflow 会把上述环境变量传给 `node scripts/cli.js all`，因此只需在 GitHub 配好 Secrets，无需在仓库里提交 `config.js`。

---

## 四、配置检查清单

**最少配置（只看 YouTube 热门）：**

- [ ] 在 Google Cloud 启用 YouTube Data API v3 并创建 API Key
- [ ] 本地：复制 `config.example.js` 为 `config.js`，填入 `youtube.apiKey`
- [ ] 若用 GitHub 自动部署：在仓库 Secrets 里添加 `YOUTUBE_API_KEY`

**可选：**

- [ ] 修改 `youtube.regions` 或设 `YOUTUBE_REGIONS`（如加日本 JP）
- [ ] 配置 `summaryApiUrl` + `summaryApiKey` 使用自己的摘要服务
- [ ] 配置 Reddit 的 clientId / clientSecret 以抓 Reddit 热门

配好后，本地执行 `node scripts/cli.js trending-videos` 应能生成 `data/trending-videos/YYYY-MM-DD.json`；执行 `node scripts/cli.js all` 会拉取所有模块数据。

---

## 五、大模型摘要（仅本地，不参与 GitHub 每日 build）

用大模型为热门视频生成文字摘要需要调用你的 LLM API（密钥不能放在 GitHub），因此**不能在 GitHub Actions 的每日 build 里执行**，只能在本地或你自己的服务器上跑。

### 1. 配置摘要 API

在 `config.js` 里填：

- **youtube.summaryApiUrl**：你的摘要接口地址（POST，见下方约定）
- **youtube.summaryApiKey**：鉴权（如 Bearer token）

接口约定：脚本会 POST 一个 JSON：`{ "titles": ["视频标题1", "..."], "maxSentences": 3 }`，期望响应 JSON 里包含 `summary` 字符串。

### 2. 本地流程（推荐）

1. **拉取热门**（本地或等每日 build 后从站点/仓库拿到当日 JSON 到本地）  
   `node scripts/cli.js trending-videos --date 2026-02-20`

2. **用大模型写摘要到同一份数据**（会直接改 `data/trending-videos/YYYY-MM-DD.json`）  
   `node scripts/cli.js summarize-trending --date 2026-02-20`

3. **把带摘要的数据推送到仓库**  
   `git add -f data/trending-videos/2026-02-20.json`  
   `git commit -m "data: trending with LLM summary"`  
   `git push origin main`

4. **在 GitHub 上触发「仅部署」**  
   **Actions** → 选择 **Deploy only (no crawl)** → **Run workflow**。  
   该 workflow 不会拉取数据，只会用当前仓库里的 `data/` 构建并部署到 Pages，站点会显示你刚推送的带摘要数据。

### 3. 两个 workflow 分工

| Workflow | 何时跑 | 做什么 |
|----------|--------|--------|
| **Daily build and deploy** | 每天 08:00 北京 / 或手动 | 拉取 YouTube 等数据（无 LLM）、构建、部署 |
| **Deploy only (no crawl)** | 仅手动 | 不拉取；用仓库里已有 data 构建并部署（适合你先本地跑摘要再推送后更新站点） |

---

## 六、OpenClaw 每日定时：热门抓取 + Top10 LLM 分析

在**本地 OpenClaw** 里添加每日定时任务，执行「热门视频抓取 + 前十名 LLM 内容摘要」，结果会写入 `data/trending-videos/YYYY-MM-DD.json`，网页会展示 **Top 10 热门分析**（标题、作者、发布时间、链接、类型、点赞/评论/分享、内容摘要）。

### 1. 配置 LLM 单条视频摘要

在 `config.js` 里配置（勿提交到 Git）：

- **youtube.summaryVideoApiUrl**：接受单条视频的接口，POST  body 为 `{ title, description, maxSentences: 3 }`，响应 JSON 含 `summary` 字符串。
- **youtube.summaryVideoApiKey**：鉴权（如 Bearer token）。

**详细教程**（接口约定、请求/响应格式、OpenAI/Gemini/自建示例）：**[docs/SUMMARY_VIDEO_API.md](SUMMARY_VIDEO_API.md)**。

也可用环境变量 `YOUTUBE_SUMMARY_VIDEO_API_URL`、`YOUTUBE_SUMMARY_VIDEO_API_KEY`。

### 2. 本地执行一次

```bash
cd /path/to/personal-homepage
node scripts/cli.js trending-analysis
```

会先抓取当日热门，再对 **Top 10** 逐条调 LLM 生成内容摘要，并写回 JSON。

### 3. 在 OpenClaw 里添加每日定时

- 新建「定时任务」或「快捷指令」。
- 执行命令设为（把路径换成你的仓库根目录）：
  ```bash
  /bin/bash /path/to/personal-homepage/scripts/run-daily-trending-analysis.sh
  ```
- 设为每日固定时间（如早上 9:00）运行。

### 4. 网页展示

站点会读取 `data/trending-videos/` 下最新日期的 JSON。若有 `analysisTop10`，则展示前十名卡片：**名字、作者、发布时间、链接、类型、点赞数、评论数、分享数**（YouTube 无分享数则显示 —）、**LLM 生成的内容摘要**。排版已单独优化，便于阅读。
