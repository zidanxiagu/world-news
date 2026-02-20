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
| **YOUTUBE_API_KEY** | YouTube Data API v3 密钥 | 见下方「获取 YouTube API Key」 | `config.js` → `youtube.apiKey` 或环境变量 `YOUTUBE_API_KEY` |
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

**注意**：未配置 API Key 时，热门视频会显示占位文案「YouTube API Key 未配置」，不会报错。

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
