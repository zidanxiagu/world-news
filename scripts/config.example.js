/**
 * 复制本文件为 config.js 并填入密钥。config.js 不要提交到版本库。
 * 也可使用环境变量，见下方说明。
 */
module.exports = {
  // YouTube Data API v3：热门与趋势
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    regions: process.env.YOUTUBE_REGIONS ? process.env.YOUTUBE_REGIONS.split(',') : ['US', 'GB'],
    maxResultsPerRegion: 15,
    summaryApiUrl: process.env.YOUTUBE_SUMMARY_API_URL || '',
    summaryApiKey: process.env.YOUTUBE_SUMMARY_API_KEY || '',
    // 每条视频的 LLM 内容摘要（本地/OpenClaw 用，勿放 GitHub）
    summaryVideoApiUrl: process.env.YOUTUBE_SUMMARY_VIDEO_API_URL || '',
    summaryVideoApiKey: process.env.YOUTUBE_SUMMARY_VIDEO_API_KEY || '',
    // 摘要来源：snippet=免费仅用描述片段 | ollama=本机 Ollama | gemini=Google 免费版 | grok=xAI | custom=自建接口
    summaryVideoProvider: process.env.YOUTUBE_SUMMARY_VIDEO_PROVIDER || 'snippet',
    summaryVideoOllamaUrl: process.env.YOUTUBE_OLLAMA_URL || 'http://localhost:11434/v1/chat/completions',
    summaryVideoOllamaModel: process.env.YOUTUBE_OLLAMA_MODEL || 'llama3.2',
    summaryVideoGeminiModel: process.env.YOUTUBE_GEMINI_MODEL || 'gemini-2.0-flash',
    summaryVideoGrokModel: process.env.YOUTUBE_GROK_MODEL || 'grok-2-1212',
  },
  // Reddit API (optional, 也可用 RSS 无需 key)
  reddit: {
    clientId: process.env.REDDIT_CLIENT_ID || '',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    userAgent: process.env.REDDIT_USER_AGENT || 'personal-homepage/1.0',
  },
  // 新闻 RSS 源（无需 key）
  news: {
    feeds: [
      'https://feeds.reuters.com/reuters/topNews',
      'https://techcrunch.com/feed/',
      'https://feeds.feedburner.com/venturebeat/SZYF',
    ],
  },
  // 数据与脚本根目录（相对本文件）
  dataDir: process.env.PERSONAL_HOMEPAGE_DATA || require('path').join(__dirname, '..', 'data'),
  repoRoot: process.env.PERSONAL_HOMEPAGE_REPO || require('path').join(__dirname, '..'),
};
