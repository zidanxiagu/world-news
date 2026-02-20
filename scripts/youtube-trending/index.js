const config = require('../config');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(config.dataDir, 'trending-videos');
const regions = config.youtube?.regions || ['US', 'GB'];
const maxPerRegion = config.youtube?.maxResultsPerRegion ?? 15;

async function fetchPopularForRegion(apiKey, regionCode) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}&maxResults=${maxPerRegion}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'YouTube API error');
  return (data.items || []).map((v) => ({
    id: v.id,
    title: v.snippet?.title || '',
    description: (v.snippet?.description || '').slice(0, 300),
    url: `https://youtube.com/watch?v=${v.id}`,
    views: parseInt(v.statistics?.viewCount || 0, 10),
    viewsStr: (v.statistics?.viewCount || 0).toString(),
    channelTitle: v.snippet?.channelTitle || '',
    publishedAt: v.snippet?.publishedAt || '',
    source: 'youtube',
    region: regionCode,
  }));
}

async function fetchAllTrending(dateStr) {
  const apiKey = config.youtube?.apiKey || '';
  if (!apiKey) {
    return {
      date: dateStr,
      regions: [],
      items: [{ title: '(YouTube API Key 未配置)', url: '#', viewsStr: '-', source: 'youtube' }],
      summary: '',
    };
  }
  const byId = new Map();
  for (const regionCode of regions) {
    try {
      const items = await fetchPopularForRegion(apiKey, regionCode);
      for (const item of items) {
        if (!byId.has(item.id)) byId.set(item.id, { ...item, region: item.region });
        else {
          const existing = byId.get(item.id);
          const r = Array.isArray(existing.region) ? existing.region : (existing.region ? [existing.region] : []);
          if (!r.includes(regionCode)) existing.region = r.concat(regionCode).join(',');
        }
      }
    } catch (e) {
      byId.set(`err-${regionCode}`, {
        id: `err-${regionCode}`,
        title: `[${regionCode}] 拉取失败: ${e.message}`,
        url: '#',
        viewsStr: '-',
        source: 'youtube',
        region: regionCode,
      });
    }
  }
  const items = Array.from(byId.values())
    .filter((v) => !v.id.startsWith('err-'))
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 25)
    .map((v) => ({
      title: v.title,
      url: v.url,
      views: v.viewsStr,
      source: v.source,
      channelTitle: v.channelTitle,
      region: v.region,
    }));
  return { date: dateStr, regions, items };
}

async function generateSummary(payload) {
  const apiUrl = config.youtube?.summaryApiUrl || '';
  const apiKey = config.youtube?.summaryApiKey || '';
  if (apiUrl && apiKey) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ titles: payload.titles, maxSentences: 3 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) return data.summary;
      }
    } catch (_) {}
  }
  const titles = payload.titles || [];
  if (titles.length === 0) return '';
  const top = titles.slice(0, 8).join('、');
  const more = titles.length > 8 ? ` 等` : '';
  return `今日 ${(config.youtube?.regions || ['US', 'GB']).join('/')} 地区热门共 ${titles.length} 支，趋势包括：${top}${more}。`;
}

async function run(dateStr) {
  const raw = await fetchAllTrending(dateStr);
  const titles = (raw.items || []).map((i) => i.title).filter(Boolean);
  raw.summary = await generateSummary({ titles });
  const result = {
    date: raw.date,
    regions: raw.regions,
    summary: raw.summary,
    items: raw.items,
  };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const outPath = path.join(DATA_DIR, `${dateStr}.json`);
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  return result;
}

module.exports = { run, fetchAllTrending, generateSummary };
