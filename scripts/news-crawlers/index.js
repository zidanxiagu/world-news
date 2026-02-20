const path = require('path');
const fs = require('fs');
const config = require('../config');

const DATA_DIR = path.join(config.dataDir, 'news');

async function fetchRssFeed(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'personal-homepage/1.0' } });
  const xml = await res.text();
  const items = [];
  const titleMatch = xml.match(/<title>([^<]+)<\/title>/);
  const source = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
  const itemRegex = /<item>[\s\S]*?<title>([^<]*)<\/title>[\s\S]*?<link>([^<]*)<\/link>[\s\S]*?(?:<pubDate>([^<]*)<\/pubDate>)?[\s\S]*?<\/item>/gi;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    items.push({
      title: m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim(),
      url: m[2].trim(),
      source,
      publishedAt: m[3] ? new Date(m[3]).toISOString() : new Date().toISOString(),
    });
  }
  return items;
}

async function run(dateStr) {
  const all = [];
  for (const feedUrl of config.news.feeds || []) {
    try {
      const items = await fetchRssFeed(feedUrl);
      all.push(...items.slice(0, 5));
    } catch (e) {
      all.push({
        title: `(RSS 拉取失败: ${feedUrl})`,
        url: '#',
        source: feedUrl,
        publishedAt: dateStr,
      });
    }
  }
  const result = { date: dateStr, items: all.slice(0, 30) };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, `${dateStr}.json`), JSON.stringify(result, null, 2), 'utf8');
  return result;
}

module.exports = { run };
