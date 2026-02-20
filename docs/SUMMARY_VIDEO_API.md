# 单条视频 LLM 摘要 API 配置教程

用于 **Top 10 热门分析**：脚本会为每条视频根据**标题 + 描述**生成**内容摘要**，并写入 JSON、在网页展示。

---

## 免费实现视频分析：有哪些方法

在 `config.js` 里设置 **summaryVideoProvider** 即可切换方式，无需自建服务即可用。

| 方式 | summaryVideoProvider | 费用 | 说明 |
|------|----------------------|------|------|
| **描述片段** | `'snippet'` 或 `'free'` | **完全免费** | 不调任何 API，直接用视频描述的前一两句话作为摘要。质量一般，但零成本、无需密钥。**默认值**。 |
| **Ollama（本机）** | `'ollama'` | **完全免费** | 本机用 [Ollama](https://ollama.com/) 跑开源模型（如 Llama、Qwen），脚本连 `localhost:11434`。需自己安装 Ollama 并拉取模型。 |
| **Google Gemini** | `'gemini'` | **免费额度** | 用 [Google AI Studio](https://aistudio.google.com/) 的 API Key，免费 tier 有每日/每分钟限额，个人 Top10 通常够用。 |
| **Grok（xAI）** | `'grok'` 或 `'xai'` | 按量计费 | 需 xAI API Key，见下文。 |
| **自建接口** | `'custom'` | 看你部署 | 自己写接口（如调 OpenAI），填 summaryVideoApiUrl + summaryVideoApiKey。 |

### 1. 完全免费：用描述片段（snippet）

不请求任何外部服务，直接把视频描述的截断作为「摘要」。

在 `config.js` 里设：

```js
summaryVideoProvider: 'snippet',
```

无需 API Key。运行 `node scripts/cli.js trending-analysis` 即可，每条 Top10 的 `contentSummary` 会是描述的前约 180 字（尽量按句截断）。

### 2. 完全免费：本机 Ollama

在电脑上装 [Ollama](https://ollama.com/)，拉一个模型（如 `ollama pull llama3.2`），启动后脚本连本机即可。

在 `config.js` 里设：

```js
summaryVideoProvider: 'ollama',
summaryVideoOllamaUrl: 'http://localhost:11434/v1/chat/completions',  // 默认即此
summaryVideoOllamaModel: 'llama3.2',  // 或 qwen2.5、mistral 等
```

不需要 **summaryVideoApiKey**。若 Ollama 请求失败，脚本会自动退回为 snippet 摘要。

### 3. 免费额度：Google Gemini

1. 打开 [Google AI Studio](https://aistudio.google.com/) 获取 API Key（免费、无需绑卡，有速率和每日限额）。
2. 在 `config.js` 里设：

```js
summaryVideoProvider: 'gemini',
summaryVideoApiKey: process.env.YOUTUBE_SUMMARY_VIDEO_API_KEY || '你的Gemini_API_Key',
summaryVideoGeminiModel: 'gemini-2.0-flash',  // 或 gemini-1.5-flash 等
```

免费 tier 一般够每天跑一次 Top10；超限则脚本会退回为 snippet 摘要。

---

## 用 Grok（xAI）做视频内容分析

无需自建接口，只要 xAI 的 API Key 即可。

### 1. 获取 xAI API Key

1. 打开 [xAI 控制台](https://console.x.ai/) 注册/登录。
2. 进入 **API Keys**（如 https://console.x.ai/team/default/api-keys）创建密钥。
3. 账户需有额度才能调用（按用量计费）。

### 2. 在 config.js 里配置

在 `scripts/config.js` 的 `youtube` 里设置：

```js
youtube: {
  apiKey: process.env.YOUTUBE_API_KEY || '你的YouTube密钥',
  // ... 其他不变 ...
  summaryVideoProvider: 'grok',   // 或 'xai'，表示用 Grok
  summaryVideoApiKey: process.env.YOUTUBE_SUMMARY_VIDEO_API_KEY || '你的xAI_API_Key',
  summaryVideoGrokModel: 'grok-2-1212',  // 可选，默认 grok-2-1212，可改为 grok-beta 等
},
```

- **summaryVideoProvider**：填 `'grok'` 或 `'xai'` 即走 Grok，**不用填** summaryVideoApiUrl。
- **summaryVideoApiKey**：填你在 xAI 控制台拿到的 **API Key**。
- **summaryVideoGrokModel**（可选）：模型名，默认 `grok-2-1212`，也可用 `grok-beta`、`grok-4` 等（以 xAI 文档为准）。

### 3. 运行

```bash
node scripts/cli.js trending-analysis
```

脚本会直连 `https://api.x.ai/v1/chat/completions`，用 Grok 为 Top 10 每条生成摘要并写回 JSON。

---

## 一、自定义摘要接口：在 config.js 里填什么

打开 `scripts/config.js`，在 `youtube` 里增加或修改这两项：

```js
youtube: {
  apiKey: process.env.YOUTUBE_API_KEY || '你的YouTube密钥',
  regions: process.env.YOUTUBE_REGIONS ? ... : ['US', 'GB'],
  maxResultsPerRegion: 15,
  summaryApiUrl: process.env.YOUTUBE_SUMMARY_API_URL || '',
  summaryApiKey: process.env.YOUTUBE_SUMMARY_API_KEY || '',
  // 下面两行：单条视频内容摘要（trending-analysis 用）
  summaryVideoApiUrl: process.env.YOUTUBE_SUMMARY_VIDEO_API_URL || 'https://你的摘要服务地址/summarize',
  summaryVideoApiKey: process.env.YOUTUBE_SUMMARY_VIDEO_API_KEY || '你的API密钥',
},
```

- **summaryVideoApiUrl**：你的摘要接口的**完整 URL**（必须是 POST 可用的地址）。
- **summaryVideoApiKey**：该接口的鉴权密钥（脚本会以 `Authorization: Bearer <密钥>` 形式发送）。

不想把密钥写在文件里时，可以用环境变量：

```bash
export YOUTUBE_SUMMARY_VIDEO_API_URL="https://你的摘要服务地址/summarize"
export YOUTUBE_SUMMARY_VIDEO_API_KEY="你的API密钥"
```

此时 `config.js` 里可以留空：`''`，脚本会优先读环境变量。

---

## 二、接口约定（你的服务必须满足）

脚本会对 **Top 10** 的每条视频各请求**一次**你的接口。

### 请求

- **方法**：`POST`
- **Header**：  
  `Content-Type: application/json`  
  `Authorization: Bearer <summaryVideoApiKey>`
- **Body（JSON）** 示例：
  ```json
  {
    "title": "视频标题",
    "description": "视频简介或描述文本，可能很长，脚本会截到约 800 字",
    "maxSentences": 3
  }
  ```

### 响应

- **状态码**：`200`
- **Body（JSON）** 必须包含字段 **summary**（字符串）：
  ```json
  {
    "summary": "用 2～3 句话概括该视频的主要内容、亮点或结论。"
  }
  ```

只要返回里带 `summary` 即可，其它字段脚本会忽略。

---

## 三、实现方式示例

你的摘要服务可以任选一种方式实现，只要满足上面的请求/响应格式即可。

### 方式 1：用 OpenAI（或兼容接口）

若你已有 OpenAI API Key，可以写一个**极简 HTTP 服务**，接收我们的 POST，调 OpenAI 再返回 `{ summary }`。

**Node 示例（Express）：**

```js
// 单独建一个项目或放在本地脚本里，仅示例
const express = require('express');
const app = express();
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // 你的 OpenAI Key

app.post('/summarize', async (req, res) => {
  const { title, description, maxSentences = 3 } = req.body || {};
  const prompt = `请根据以下视频标题和描述，用 ${maxSentences} 句话概括视频主要内容。只输出摘要，不要其他解释。\n\n标题：${title}\n\n描述：${description}`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    }),
  });
  const data = await response.json();
  const summary = data.choices?.[0]?.message?.content?.trim() || '';
  res.json({ summary });
});

app.listen(3000, () => console.log('Summarize API on :3000'));
```

- 本地跑起来后，在 config.js 里填：  
  `summaryVideoApiUrl: 'http://localhost:3000/summarize'`  
  `summaryVideoApiKey: '任意一个密钥'`（若你本地不校验，可随便填；脚本会照常发 Bearer）。
- 若部署到公网（如 `https://你的域名/summarize`），则 URL 填该地址，Key 设成你自己约定的一串密钥，在服务端校验 `Authorization: Bearer <key>` 即可。

### 方式 2：用 Google Gemini

思路相同：写一个接口，收到 `title`、`description` 后调 Gemini 生成摘要，返回 `{ summary }`。  
Gemini API 文档：<https://ai.google.dev/docs>。  
把你的接口地址和鉴权密钥填到 **summaryVideoApiUrl**、**summaryVideoApiKey** 即可。

### 方式 3：云函数 / Serverless

在 Vercel、腾讯云函数、阿里云 FC 等写一个函数：

- 触发方式：HTTP（POST）。
- 请求体：`{ title, description, maxSentences }`。
- 内部调 OpenAI / Gemini / 其它模型，得到一段摘要文本。
- 返回 `{ "summary": "..." }`。

把该函数的 URL 填到 **summaryVideoApiUrl**，密钥填到 **summaryVideoApiKey**（若函数需要 API Key 鉴权）。

---

## 四、校验是否配对

1. 确保 **summaryVideoApiUrl** 可访问（在浏览器或 `curl` 里能 POST 到该地址）。
2. 本地执行：  
   `node scripts/cli.js trending-analysis`  
   若配置正确，会为当日 Top 10 每条请求一次你的接口，并在 `data/trending-videos/YYYY-MM-DD.json` 里看到 `analysisTop10[].contentSummary` 有内容。
3. 若某条没有摘要，检查：接口是否返回 200、响应 JSON 里是否包含 `summary` 字段、网络/鉴权是否正常（脚本不会把密钥提交到 Git，仅在本地使用）。

---

## 五、小结

| 配置项 | 含义 | 示例 |
|--------|------|------|
| **summaryVideoApiUrl** | 接受单条视频、返回摘要的接口地址 | `https://你的服务/summarize` 或 `http://localhost:3000/summarize` |
| **summaryVideoApiKey** | 请求头里的 Bearer 鉴权 | 任意你和服务端约定的一串密钥 |

接口只需满足：**POST，body 含 title/description/maxSentences，响应 JSON 含 summary 字符串**。实现方式（自建服务、云函数、OpenAI/Gemini 等）任选。
