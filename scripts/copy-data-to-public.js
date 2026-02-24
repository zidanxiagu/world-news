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
const ARCHIVE_SOURCE_DIRS = ['trending-videos', 'reddit-hn', 'news'];
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
