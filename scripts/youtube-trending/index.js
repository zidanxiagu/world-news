const config = require('../config');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(config.dataDir, 'trending-videos');

async function fetchYouTubeTrending(dateStr) {
  const apiKey = config.youtube.apiKey;
  if (!apiKey) {
    return {
      date: dateStr,
      items: [
        { title: '(YouTube API Key 未配置)', url: '#', views: '-', source: 'youtube' },
      ],
    };
  }
  try {
    const regionCode = 'US';
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}&maxResults=10&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'YouTube API error');
    const items = (data.items || []).map((v) => ({
      title: v.snippet?.title || '',
      url: `https://youtube.com/watch?v=${v.id}`,
      views: (v.statistics?.viewCount || 0).toString(),
      source: 'youtube',
    }));
    return { date: dateStr, items };
  } catch (e) {
    return {
      date: dateStr,
      items: [{ title: `(YouTube 拉取失败: ${e.message})`, url: '#', views: '-', source: 'youtube' }],
    };
  }
}

async function run(dateStr) {
  const result = await fetchYouTubeTrending(dateStr);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const outPath = path.join(DATA_DIR, `${dateStr}.json`);
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  return result;
}

module.exports = { run, fetchYouTubeTrending };
