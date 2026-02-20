# Personal Homepage — 多源信息聚合

个人主页：聚合每日热门视频、财经科技新闻、极客社区热门，支持 CLI / iMessage / 定时触发。

## 结构

- **site/** — Next.js 前端，部署到 GitHub Pages 或 Vercel
- **scripts/** — 爬虫与统一 CLI
- **data/** — 爬虫产出的 JSON（按日）

## 快速开始

```bash
# 安装依赖
npm install
cd site && npm install && cd ..

# 拉取今日数据（需配置 API Key / env）
node scripts/cli.js all

# 本地预览主页
cd site && npm run dev
```

## 触发方式

- **CLI**: `node scripts/cli.js trending-videos|news|geek|all [--date YYYY-MM-DD] [--stdout]`
- **iMessage**: 通过 OpenClaw 技能「更新主页数据」「抓今日热门」等触发
- **定时**: GitHub Actions 每日 cron 或本机 cron 执行 `node scripts/cli.js all`

**每日从执行到部署的流程图**：见 **[docs/FLOW.md](docs/FLOW.md)**（含 GitHub 自动 build、本地/OpenClaw 分析 + 仅部署两条路径）。

## 配置

复制 `scripts/config.example.js` 为 `scripts/config.js`，填入 API Key（不提交 config.js）。或使用环境变量。

**详细说明**：需要配哪些、如何获取 API Key、本地与 GitHub Secrets 对照，见 **[docs/CONFIG.md](docs/CONFIG.md)**。

## 部署到 GitHub Pages

1. 将本仓库 push 到 GitHub，分支名 `main`。
2. 仓库 Settings → Pages → Source 选 “GitHub Actions”。
3. 可选：在 Settings → Secrets 中配置 `YOUTUBE_API_KEY`、`REDDIT_CLIENT_ID`、`REDDIT_CLIENT_SECRET`，供每日 workflow 拉取数据。
4. 每日 0:00 UTC 会自动运行 `daily-build` workflow；也可在 Actions 页手动 “Run workflow”。
