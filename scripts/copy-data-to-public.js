const path = require('path');
const fs = require('fs');
const config = require('./config');

const src = config.dataDir;
const dest = path.join(config.repoRoot, 'site', 'public', 'data');
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
