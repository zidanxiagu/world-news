const path = require('path');
const fs = require('fs');
const config = require('../config');

const DATA_DIR = path.join(config.dataDir, 'trending-videos');

/**
 * TikTok 无官方热门 API，当前为占位。后续可接非官方数据源或手动维护。
 */
async function run(dateStr) {
  const existingPath = path.join(DATA_DIR, `${dateStr}.json`);
  let base = { date: dateStr, items: [], summary: '', regions: [] };
  if (fs.existsSync(existingPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      base.items = existing.items || [];
      if (existing.summary) base.summary = existing.summary;
      if (existing.regions) base.regions = existing.regions;
    } catch (_) {}
  }
  const tiktokPlaceholder = {
    title: '(TikTok 热门占位 — 暂无官方 API)',
    url: '#',
    views: '-',
    source: 'tiktok',
  };
  const hasTiktok = base.items.some((i) => i.source === 'tiktok');
  if (!hasTiktok) base.items.push(tiktokPlaceholder);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(existingPath, JSON.stringify(base, null, 2), 'utf8');
  return base;
}

module.exports = { run };
