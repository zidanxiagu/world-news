const path = require('path');
const fs = require('fs');
const config = require('../config');
const { addChineseSummaries } = require('../llm-summary');

const DATA_DIR = path.join(config.dataDir, 'reddit-hn');
const UA = 'personal-homepage/1.0';

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

async function fetchRedditSub(sub, limit = 5) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=${limit}`, {
      headers: { 'User-Agent': config.reddit?.userAgent || UA },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    const children = data?.data?.children || [];
    return children
      .filter((c) => c.data && c.data.title && !c.data.stickied)
      .map((c) => ({
        title: c.data.title,
        url: `https://reddit.com${c.data.permalink}`,
        subreddit: sub,
        score: c.data.score || 0,
      }));
  } catch (_) {
    clearTimeout(timer);
    return [];
  }
}

async function fetchReddit() {
  const subs = [
    'programming', 'technology', 'webdev',
    'machinelearning', 'artificial', 'wallstreetbets',
    'science', 'worldnews',
  ];
  const results = await Promise.allSettled(subs.map((s) => fetchRedditSub(s, 3)));
  const reddit = [];
  for (const r of results) {
    if (r.status === 'fulfilled') reddit.push(...r.value);
  }
  if (reddit.length > 0) {
    console.log(`[geek] Reddit: fetched ${reddit.length} items from direct API`);
  } else {
    console.log('[geek] Reddit: direct API returned 0 items (Grok will fill in summaries step)');
  }
  return reddit.slice(0, 20);
}

async function fetchProductHuntApi(apiKey) {
  try {
    const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: `query { posts(first: 15) { edges { node { name, tagline, slug, votesCount, websiteUrl } } } }`,
      }),
    });
    const data = await res.json();
    const edges = data?.data?.posts?.edges || [];
    return edges.map((e) => {
      const n = e.node;
      const slug = n.slug || (n.name || '').replace(/\s+/g, '-').toLowerCase();
      return {
        title: n.tagline ? `${n.name} — ${n.tagline}` : n.name,
        url: n.websiteUrl || `https://www.producthunt.com/posts/${slug}`,
        votesCount: n.votesCount || 0,
      };
    });
  } catch (_) {
    return [];
  }
}

async function fetchProductHuntRss() {
  try {
    const res = await fetch('https://www.producthunt.com/feed', {
      headers: { 'User-Agent': UA },
    });
    const xml = await res.text();
    const items = [];
    const entryRegex = /<entry>[\s\S]*?<\/entry>/gi;
    let em;
    while ((em = entryRegex.exec(xml)) !== null) {
      const block = em[0];
      const titleM = block.match(/<title[^>]*>([^<]*(?:<!\[CDATA\[[\s\S]*?\]\]>)?[^<]*)<\/title>/i);
      const linkM = block.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i);
      const contentM = block.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
      const title = titleM ? titleM[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
      const url = linkM ? linkM[1].trim() : '';
      let tagline = '';
      if (contentM) {
        const pMatch = contentM[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').match(/<p>\s*([\s\S]*?)\s*<\/p>/i);
        if (pMatch) tagline = pMatch[1].replace(/<[^>]+>/g, '').trim();
      }
      if (title && url) {
        items.push({
          title: tagline ? `${title} — ${tagline}` : title,
          url,
          votesCount: 0,
        });
      }
    }
    return items.slice(0, 15);
  } catch (_) {
    return [];
  }
}

async function fetchProductHunt() {
  const apiKey = config.producthunt?.apiKey || process.env.PRODUCT_HUNT_API_KEY;
  if (apiKey) {
    const items = await fetchProductHuntApi(apiKey);
    if (items.length > 0) return items;
  }
  try {
    const items = await fetchProductHuntRss();
    if (items.length === 0) console.log('[geek] Product Hunt RSS returned 0 items (Grok will fill in summaries step)');
    return items;
  } catch (e) {
    console.log('[geek] Product Hunt RSS failed:', e.message, '(Grok will fill in summaries step)');
    return [];
  }
}

async function fetchRssItems(url, sourceName) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    const xml = await res.text();
    const items = [];
    const titleMatch = xml.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const source = sourceName || (titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : new URL(url).hostname);
    const itemRegex = /<item[\s>][\s\S]*?<\/item>/gi;
    let m;
    while ((m = itemRegex.exec(xml)) !== null) {
      const block = m[0];
      const tM = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const lM = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const title = tM ? tM[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
      const link = lM ? lM[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
      if (title && link) items.push({ title, url: link, source });
    }
    if (items.length === 0) {
      const entryRegex = /<entry[\s>][\s\S]*?<\/entry>/gi;
      while ((m = entryRegex.exec(xml)) !== null) {
        const block = m[0];
        const tM = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const lM = block.match(/<link[^>]*href="([^"]+)"/i);
        const title = tM ? tM[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
        const link = lM ? lM[1].trim() : '';
        if (title && link) items.push({ title, url: link, source });
      }
    }
    return items;
  } catch (_) {
    return [];
  }
}

async function fetchSubstack() {
  const feeds = config.substack?.feeds || [];
  const all = [];
  for (const url of feeds.slice(0, 5)) {
    const items = await fetchRssItems(url, new URL(url).hostname);
    all.push(...items.slice(0, 5));
  }
  return all.slice(0, 15);
}

async function fetchJike() {
  const feeds = config.jike?.feeds || [];
  const all = [];
  for (const url of feeds.slice(0, 5)) {
    const items = await fetchRssItems(url, '即刻');
    all.push(...items.slice(0, 5));
  }
  return all.slice(0, 15);
}

async function fetchPinterest() {
  const feeds = config.pinterest?.feeds || [];
  const all = [];
  for (const url of feeds.slice(0, 5)) {
    const items = await fetchRssItems(url, 'Pinterest');
    all.push(...items.slice(0, 5));
  }
  return all.slice(0, 15);
}

async function fetchX() {
  return [];
}

async function run(dateStr) {
  const useGrok = process.env.USE_GROK === '1';
  const [hn, reddit, producthunt, substack, jike, pinterest, x] = await Promise.all([
    fetchHN(),
    fetchReddit(),
    fetchProductHunt(),
    fetchSubstack(),
    fetchJike(),
    fetchPinterest(),
    fetchX(),
  ]);

  const limit = useGrok ? 15 : 10;
  const redditList = reddit.slice(0, useGrok ? 15 : reddit.length);
  const hnList = hn.slice(0, useGrok ? 15 : hn.length);
  const phList = producthunt.slice(0, 15);
  const subList = substack.slice(0, 15);
  const jikeList = jike.slice(0, 15);
  const pinList = pinterest.slice(0, 15);
  const xList = x.slice(0, 15);

  if (!useGrok) {
    await addChineseSummaries(redditList, 'summary', limit, 400);
    await addChineseSummaries(hnList, 'summary', limit, 400);
    await addChineseSummaries(phList, 'summary', limit, 400);
    await addChineseSummaries(subList, 'summary', limit, 400);
    await addChineseSummaries(jikeList, 'summary', limit, 400);
    await addChineseSummaries(pinList, 'summary', limit, 400);
    await addChineseSummaries(xList, 'summary', limit, 400);
  }

  const result = {
    date: dateStr,
    reddit: redditList,
    hn: hnList,
    producthunt: phList,
    substack: subList,
    jike: jikeList,
    pinterest: pinList,
    x: xList,
  };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, `${dateStr}.json`), JSON.stringify(result, null, 2), 'utf8');
  return result;
}

module.exports = { run };
