#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, 'config.js');
if (!fs.existsSync(configPath)) {
  console.error('Missing scripts/config.js. Copy config.example.js and configure.');
  process.exit(1);
}
const config = require('./config');

function getDateArg() {
  const i = process.argv.indexOf('--date');
  if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

const stdout = process.argv.includes('--stdout');

async function main() {
  const cmd = process.argv[2] || 'all';
  const dateStr = getDateArg();

  const summaries = [];

  if (cmd === 'trending-videos' || cmd === 'all') {
    const yt = require('./youtube-trending');
    const tt = require('./tiktok-trending');
    const ytResult = await yt.run(dateStr);
    const ttResult = await tt.run(dateStr);
    const count = (ttResult.items || []).length;
    summaries.push(`trending-videos: ${count} items (${dateStr})`);
    if (stdout) console.log(JSON.stringify(ttResult, null, 2));
  }

  if (cmd === 'news' || cmd === 'all') {
    const news = require('./news-crawlers');
    const result = await news.run(dateStr);
    summaries.push(`news: ${(result.items || []).length} items (${dateStr})`);
    if (stdout && cmd === 'news') console.log(JSON.stringify(result, null, 2));
  }

  if (cmd === 'geek' || cmd === 'all') {
    const geek = require('./reddit-hn');
    const result = await geek.run(dateStr);
    const r = (result.reddit || []).length;
    const h = (result.hn || []).length;
    summaries.push(`geek: reddit ${r}, hn ${h} (${dateStr})`);
    if (stdout && cmd === 'geek') console.log(JSON.stringify(result, null, 2));
  }

  if (cmd === 'learning' || cmd === 'all') {
    const dataDir = path.join(config.dataDir, 'learning');
    fs.mkdirSync(dataDir, { recursive: true });
    const placeholder = { placeholder: true, date: dateStr };
    fs.writeFileSync(path.join(dataDir, 'placeholder.json'), JSON.stringify(placeholder, null, 2), 'utf8');
    if (cmd === 'learning') summaries.push('learning: placeholder updated');
  }

  // 热门分析：抓取 + Top10 + 每条 LLM 内容摘要（供 OpenClaw 每日定时；需 summaryVideoApiUrl/Key）
  if (cmd === 'trending-analysis') {
    const yt = require('./youtube-trending');
    const result = await yt.runTrendingAnalysis(dateStr);
    const n = (result.analysisTop10 || []).length;
    console.log(`trending-analysis: ${dateStr}, top10 analyzed (${n} with contentSummary)`);
    if (stdout) console.log(JSON.stringify(result, null, 2));
    return;
  }

  // 本地用大模型生成热门视频摘要（需配置 summaryApiUrl + summaryApiKey，无法在 GitHub Actions 里跑）
  if (cmd === 'summarize-trending') {
    const yt = require('./youtube-trending');
    const dataDir = path.join(config.dataDir, 'trending-videos');
    const filePath = path.join(dataDir, `${dateStr}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`No data file: ${filePath}. Run "node scripts/cli.js trending-videos --date ${dateStr}" first.`);
      process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const titles = (data.items || []).map((i) => i.title).filter(Boolean);
    if (titles.length === 0) {
      console.error('No video titles in file.');
      process.exit(1);
    }
    const summary = await yt.generateSummary({ titles });
    data.summary = summary;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`summarize-trending: wrote summary (${dateStr}), ${summary.length} chars`);
    return;
  }

  if (!stdout || cmd === 'all') {
    if (summaries.length) console.log(summaries.join('\n'));
    else console.log('Usage: node cli.js trending-videos|trending-analysis|news|geek|learning|summarize-trending|all [--date YYYY-MM-DD] [--stdout]');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
