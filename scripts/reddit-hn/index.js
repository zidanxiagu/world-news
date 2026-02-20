const path = require('path');
const fs = require('fs');
const config = require('../config');

const DATA_DIR = path.join(config.dataDir, 'reddit-hn');

async function fetchHN() {
  const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const ids = (await res.json()).slice(0, 15);
  const hn = [];
  for (const id of ids) {
    try {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      const item = await itemRes.json();
      if (item && item.title)
        hn.push({
          title: item.title,
          url: item.url || `https://news.ycombinator.com/item?id=${id}`,
          score: item.score || 0,
          id: String(id),
        });
    } catch (_) {}
  }
  return hn;
}

async function fetchReddit() {
  const subs = ['programming', 'technology', 'webdev'];
  const reddit = [];
  for (const sub of subs) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=5`, {
        headers: { 'User-Agent': config.reddit.userAgent || 'personal-homepage/1.0' },
      });
      const data = await res.json();
      const children = data?.data?.children || [];
      for (const c of children) {
        const d = c.data;
        if (d && d.title)
          reddit.push({
            title: d.title,
            url: `https://reddit.com${d.permalink}`,
            subreddit: sub,
            score: d.score || 0,
          });
      }
    } catch (_) {}
  }
  return reddit.slice(0, 20);
}

async function run(dateStr) {
  const [hn, reddit] = await Promise.all([fetchHN(), fetchReddit()]);
  const result = { date: dateStr, reddit, hn };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, `${dateStr}.json`), JSON.stringify(result, null, 2), 'utf8');
  return result;
}

module.exports = { run };
