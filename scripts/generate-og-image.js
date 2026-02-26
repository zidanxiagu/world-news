#!/usr/bin/env node
/**
 * 生成 OG 分享缩略图：极简 Notion 风格，1200x630
 * 输出：site/public/og-image.png
 */
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '..', 'site', 'public');
const pngPath = path.join(outDir, 'og-image.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect fill="#f7f6f3" width="1200" height="630"/>
  <text x="600" y="290" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="110" font-weight="700" fill="#37352f" text-anchor="middle">抓瞎</text>
  <text x="600" y="365" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="26" fill="#6b6b6b" text-anchor="middle">带你每日瞎看世界</text>
</svg>`;

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const sharp = require('sharp');
  await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png()
    .toFile(pngPath);
  console.log('Generated:', pngPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
