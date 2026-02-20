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
    description: (v.snippet?.description || '').slice(0, 500),
    url: `https://youtube.com/watch?v=${v.id}`,
    views: parseInt(v.statistics?.viewCount || 0, 10),
    viewsStr: (v.statistics?.viewCount || 0).toString(),
    likeCount: (v.statistics?.likeCount || 0).toString(),
    commentCount: (v.statistics?.commentCount || 0).toString(),
    categoryId: v.snippet?.categoryId || '',
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
      description: v.description,
      url: v.url,
      views: v.viewsStr,
      likeCount: v.likeCount,
      commentCount: v.commentCount,
      categoryId: v.categoryId,
      categoryName: getCategoryName(v.categoryId),
      channelTitle: v.channelTitle,
      publishedAt: v.publishedAt,
      source: v.source,
      region: v.region,
    }));
  return { date: dateStr, regions, items };
}

const CATEGORY_NAMES = {
  1: 'Film & Animation',
  2: 'Autos & Vehicles',
  10: 'Music',
  15: 'Pets & Animals',
  17: 'Sports',
  19: 'Travel & Events',
  20: 'Gaming',
  22: 'People & Blogs',
  23: 'Comedy',
  24: 'Entertainment',
  25: 'News & Politics',
  26: 'Howto & Style',
  27: 'Education',
  28: 'Science & Technology',
};
function getCategoryName(categoryId) {
  if (!categoryId) return '';
  const id = parseInt(categoryId, 10);
  return CATEGORY_NAMES[id] || `Category ${categoryId}`;
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

const XAI_CHAT_URL = 'https://api.x.ai/v1/chat/completions';
const OLLAMA_CHAT_URL = 'http://localhost:11434/v1/chat/completions';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function buildSummaryPrompt(title, description, maxSentences) {
  return `你是一个视频内容总结助手。根据以下 YouTube 视频标题和描述，用 ${maxSentences} 句话概括视频的主要内容或亮点。只输出摘要正文，不要加「摘要：」等前缀。\n\n标题：${title}\n\n描述：${description}`;
}

/** 免费：仅用描述前几句作为摘要，不调任何 API */
function snippetSummary(description, maxLen = 180) {
  const s = (description || '').trim();
  if (!s) return '';
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const last = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('.'), cut.lastIndexOf('\n'));
  return (last > 80 ? cut.slice(0, last + 1) : cut + '…').trim();
}

/** 单条视频内容摘要：支持 Grok / Gemini / Ollama（免费）/ snippet（免费）/ 自定义接口 */
async function generateVideoContentSummary(item) {
  const provider = (config.youtube?.summaryVideoProvider || 'custom').toLowerCase();
  const apiKey = config.youtube?.summaryVideoApiKey || config.youtube?.summaryApiKey || '';
  const title = item.title || '';
  const description = (item.description || '').slice(0, 800);
  const maxSentences = 3;
  const prompt = buildSummaryPrompt(title, description, maxSentences);

  if (provider === 'snippet' || provider === 'free') {
    return snippetSummary(description);
  }

  if (provider === 'ollama') {
    try {
      const url = config.youtube?.summaryVideoOllamaUrl || OLLAMA_CHAT_URL;
      const model = config.youtube?.summaryVideoOllamaModel || 'llama3.2';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          options: { num_predict: 256 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && typeof text === 'string') return text.trim();
      }
    } catch (_) {}
    return snippetSummary(description);
  }

  if (provider === 'gemini') {
    if (!apiKey) return snippetSummary(description);
    try {
      const model = config.youtube?.summaryVideoGeminiModel || 'gemini-2.0-flash';
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 256 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === 'string') return text.trim();
      }
    } catch (_) {}
    return snippetSummary(description);
  }

  if (provider === 'grok' || provider === 'xai') {
    if (!apiKey) return snippetSummary(description);
    try {
      const model = config.youtube?.summaryVideoGrokModel || 'grok-2-1212';
      const res = await fetch(XAI_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 256,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text && typeof text === 'string') return text.trim();
      }
    } catch (_) {}
    return '';
  }

  const apiUrl = config.youtube?.summaryVideoApiUrl || config.youtube?.summaryApiUrl || '';
  if (!apiUrl || !apiKey) return snippetSummary(description);
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ title, description, maxSentences }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.summary && typeof data.summary === 'string') return data.summary.trim();
    }
  } catch (_) {}
  return snippetSummary(description);
}

/**
 * 热门分析：抓取热门 → 取 Top10 → 为每条调用 LLM 生成内容摘要 → 写回 JSON。
 * 供本地或 OpenClaw 每日定时跑；不在 GitHub Actions 跑（无 LLM 密钥）。
 */
async function runTrendingAnalysis(dateStr) {
  const ytResult = await run(dateStr);
  const tt = require('../tiktok-trending');
  await tt.run(dateStr);
  const filePath = path.join(DATA_DIR, `${dateStr}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const items = data.items || [];
  const top10 = items.filter((i) => i.source === 'youtube' && i.title).slice(0, 10);
  for (let i = 0; i < top10.length; i++) {
    const summary = await generateVideoContentSummary(top10[i]);
    top10[i].contentSummary = summary || '';
    if (top10[i].publishedAt) {
      try {
        const d = new Date(top10[i].publishedAt);
        top10[i].publishedAtFormatted = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (_) {
        top10[i].publishedAtFormatted = top10[i].publishedAt;
      }
    }
    if (!top10[i].likeCount) top10[i].likeCount = '—';
    if (!top10[i].commentCount) top10[i].commentCount = '—';
    top10[i].shareCount = '—';
  }
  const rest = items.slice(10);
  data.items = [...top10, ...rest];
  data.analysisTop10 = top10;
  data.analyzedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  return data;
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

module.exports = { run, fetchAllTrending, generateSummary, generateVideoContentSummary, runTrendingAnalysis };
