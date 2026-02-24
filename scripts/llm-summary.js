/**
 * 通用：用 xAI/Grok API 为标题生成 1～2 句中文摘要。
 * 复用 config.youtube.summaryVideoApiKey（xAI），无 key 时返回空字符串。
 */
const config = require('./config');

const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = (config.youtube && config.youtube.summaryVideoGrokModel) || 'grok-2-1212';

function buildPrompt(title) {
  return `你是一个摘要助手。请用 1～2 句中文概括下面这条新闻/帖子标题的主要内容或要点。只输出中文摘要，不要加「摘要：」等前缀。\n\n标题：${title}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {string} title - 新闻或帖子标题
 * @param {number} delayMs - 调用前等待毫秒（避免限流）
 * @returns {Promise<string>} 中文摘要，失败或未配置 key 时返回 ''
 */
async function generateChineseSummary(title, delayMs = 0) {
  const apiKey = (config.youtube && config.youtube.summaryVideoApiKey) || (config.youtube && config.youtube.summaryApiKey);
  if (!apiKey || !title || typeof title !== 'string') return '';
  const text = String(title).trim();
  if (!text) return '';
  if (delayMs > 0) await sleep(delayMs);
  try {
    const res = await fetch(XAI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: buildPrompt(text) }],
        max_tokens: 150,
      }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    const out = data.choices?.[0]?.message?.content;
    return (out && typeof out === 'string') ? out.trim() : '';
  } catch (_) {
    return '';
  }
}

/**
 * 为多条标题批量生成中文摘要（逐条调用，带间隔）。
 * @param {Array<{ title: string; [k: string]: any }>} items - 带 title 的对象数组
 * @param {string} summaryKey - 写入摘要的字段名，默认 'summary'
 * @param {number} limit - 最多处理条数，默认 15
 * @param {number} delayMs - 每条间隔毫秒，默认 400
 */
async function addChineseSummaries(items, summaryKey = 'summary', limit = 15, delayMs = 400) {
  const apiKey = (config.youtube && config.youtube.summaryVideoApiKey) || (config.youtube && config.youtube.summaryApiKey);
  if (!apiKey || !Array.isArray(items)) return;
  const slice = items.slice(0, limit);
  for (let i = 0; i < slice.length; i++) {
    const item = slice[i];
    if (item && item.title) {
      item[summaryKey] = await generateChineseSummary(item.title, i === 0 ? 0 : delayMs);
    }
  }
}

module.exports = { generateChineseSummary, addChineseSummaries };
