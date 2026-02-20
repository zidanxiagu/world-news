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
