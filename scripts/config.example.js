/**
 * 复制本文件为 config.js 并填入密钥。config.js 不要提交到版本库。
 * 也可使用环境变量，见下方说明。
 */
module.exports = {
  // YouTube Data API v3
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
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
