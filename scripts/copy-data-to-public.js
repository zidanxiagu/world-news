const path = require('path');
const fs = require('fs');

let config;
try {
  config = require('./config');
} catch (_) {
  config = { dataDir: path.join(__dirname, '..', 'data'), repoRoot: path.join(__dirname, '..') };
}
const src = config.dataDir || path.join(__dirname, '..', 'data');
const dest = path.join(config.repoRoot || path.join(__dirname, '..'), 'site', 'public', 'data');
if (!fs.existsSync(src)) process.exit(0);
fs.mkdirSync(dest, { recursive: true });
function copyDir(a, b) {
  fs.mkdirSync(b, { recursive: true });
  for (const name of fs.readdirSync(a)) {
    const ap = path.join(a, name);
    const bp = path.join(b, name);
    if (fs.statSync(ap).isDirectory()) copyDir(ap, bp);
    else fs.copyFileSync(ap, bp);
  }
}
copyDir(src, dest);

// 供静态导出时归档页使用：写入 archive-index.json（来源 -> 日期列表）
const ARCHIVE_SOURCE_DIRS = ['trending-videos', 'news', 'reddit-hn'];
const index = {};
for (const dir of ARCHIVE_SOURCE_DIRS) {
  const dirPath = path.join(dest, dir);
  if (!fs.existsSync(dirPath)) {
    index[dir] = [];
    continue;
  }
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  const dates = files
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace('.json', ''))
    .sort()
    .reverse();
  index[dir] = dates;
}
fs.writeFileSync(path.join(dest, 'archive-index.json'), JSON.stringify(index), 'utf8');

// 生成 RSS feed
const SITE_URL = 'https://zidanxiagu.github.io/world-news';
const allDates = [...new Set(Object.values(index).flat())].sort().reverse();
const latestDate = allDates[0];
if (latestDate) {
  const feedItems = [];
  const newsFile = path.join(dest, 'news', `${latestDate}.json`);
  if (fs.existsSync(newsFile)) {
    const news = JSON.parse(fs.readFileSync(newsFile, 'utf8'));
    (news.items || []).forEach((item) => {
      feedItems.push({ title: item.titleZh || item.title, link: item.url, desc: item.summary || '', cat: 'Finance & Tech' });
    });
  }
  const rhFile = path.join(dest, 'reddit-hn', `${latestDate}.json`);
  if (fs.existsSync(rhFile)) {
    const rh = JSON.parse(fs.readFileSync(rhFile, 'utf8'));
    const LABELS = { reddit: 'Reddit', hn: 'Hacker News', producthunt: 'Product Hunt', substack: 'Substack', jike: '即刻', pinterest: 'Pinterest', x: 'X' };
    for (const [key, label] of Object.entries(LABELS)) {
      (rh[key] || []).forEach((item) => {
        feedItems.push({ title: item.titleZh || item.title, link: item.url, desc: item.summary || '', cat: label });
      });
    }
  }
  const ytFile = path.join(dest, 'trending-videos', `${latestDate}.json`);
  if (fs.existsSync(ytFile)) {
    const yt = JSON.parse(fs.readFileSync(ytFile, 'utf8'));
    (yt.analysisTop10 || yt.items || []).forEach((item) => {
      feedItems.push({ title: item.title, link: item.url, desc: item.contentSummary || '', cat: 'YouTube' });
    });
  }
  const esc = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rssItems = feedItems.map((item) =>
    `    <item>\n      <title>${esc(item.title)}</title>\n      <link>${esc(item.link)}</link>\n      <description>${esc(item.desc)}</description>\n      <category>${esc(item.cat)}</category>\n      <pubDate>${new Date(latestDate + 'T08:00:00+08:00').toUTCString()}</pubDate>\n    </item>`
  ).join('\n');
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>抓瞎 - 带你每日瞎看世界</title>
    <link>${SITE_URL}</link>
    <description>多源热门聚合：YouTube、财经科技、Reddit、HN、Product Hunt、Substack、即刻、Pinterest、X</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${rssItems}
  </channel>
</rss>`;
  fs.writeFileSync(path.join(dest, '..', 'feed.xml'), rss, 'utf8');
  console.log('Generated feed.xml');
}
