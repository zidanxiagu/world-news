#!/usr/bin/env node
/**
 * 调试：抓取 https://www.youtube.com/feed/trending 并检查能否解析出视频列表
 * 运行：node scripts/youtube-trending/debug-scraper.js
 * 若本机 fetch 失败，可先浏览器打开该链接 → 另存为「网页，仅 HTML」→ 再运行：
 *   node scripts/youtube-trending/debug-scraper.js --file=./trending.html
 */
const fs = require('fs');
const path = require('path');
const url = 'https://www.youtube.com/feed/trending';

function getFileFromArgs() {
  for (const arg of process.argv.slice(2)) {
    if (arg === '--file' && process.argv[process.argv.indexOf(arg) + 1])
      return path.resolve(process.argv[process.argv.indexOf(arg) + 1]);
    if (arg.startsWith('--file=')) return path.resolve(arg.slice(7));
  }
  return null;
}

async function main() {
  const fileArg = getFileFromArgs();
  let html;

  if (fileArg) {
    console.log('1. Reading from file:', fileArg);
    if (!fs.existsSync(fileArg)) {
      console.error('   File not found.');
      process.exit(1);
    }
    html = fs.readFileSync(fileArg, 'utf8');
    console.log('   HTML length:', html.length);
  } else {
    console.log('1. Fetching', url, '...');
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    console.log('   Status:', res.status, res.statusText);
    html = await res.text();
    console.log('   HTML length:', html.length);
  }

  console.log('\n2. Looking for ytInitialData ...');
  const markers = ['var ytInitialData = ', 'ytInitialData = ', 'window["ytInitialData"] = '];
  let idx = -1;
  let startMarker = '';
  for (const m of markers) {
    idx = html.indexOf(m);
    if (idx !== -1) {
      startMarker = m;
      break;
    }
  }
  if (idx === -1) {
    console.log('   NOT FOUND: var ytInitialData / ytInitialData = / window["ytInitialData"]');
    if (html.includes('ytInitialData')) {
      const alt = html.indexOf('ytInitialData');
      console.log('   "ytInitialData" first at index:', alt);
      console.log('   Snippet:', html.slice(Math.max(0, alt - 20), alt + 100));
    }
    console.log('\n   若本机 fetch 失败，可用浏览器打开该链接 → 另存为「网页，仅 HTML」→ 运行: node scripts/youtube-trending/debug-scraper.js --file=./trending.html');
    return;
  }
  console.log('   Found "' + startMarker.trim() + '" at index:', idx);

  console.log('\n3. Extracting JSON ...');
  const jsonStart = html.indexOf('{', idx + startMarker.length);
  if (jsonStart === -1) {
    console.log('   No "{" after marker');
    return;
  }
  let depth = 0;
  let end = jsonStart;
  for (let i = jsonStart; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  const jsonStr = html.slice(jsonStart, end);
  console.log('   JSON length:', jsonStr.length);

  let data;
  try {
    data = JSON.parse(jsonStr);
    console.log('   Parse OK');
  } catch (e) {
    console.log('   Parse FAILED:', e.message);
    return;
  }

  console.log('\n4. Top-level keys:', Object.keys(data).slice(0, 20).join(', '));

  function findVideoIds(obj, pathArr, results = []) {
    if (!obj || typeof obj !== 'object') return results;
    if (obj.videoId && (obj.title?.runs?.[0]?.text || obj.title?.simpleText)) {
      results.push({
        path: pathArr.join(' > '),
        videoId: obj.videoId,
        title: obj.title?.runs?.[0]?.text || obj.title?.simpleText || '',
        viewCount: obj.viewCount?.simpleText || obj.shortViewCount?.simpleText,
      });
      return results;
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => findVideoIds(item, pathArr.concat([i]), results));
      return results;
    }
    if (pathArr.length > 15) return results;
    for (const key of Object.keys(obj)) {
      findVideoIds(obj[key], pathArr.concat([key]), results);
      if (results.length >= 5) return results;
    }
    return results;
  }

  const videos = findVideoIds(data, ['root']);
  console.log('\n5. Videos found (sample, max 5):', videos.length);
  videos.forEach((v, i) => console.log('   ', i + 1, v.videoId, (v.title || '').slice(0, 50), '| path:', (v.path || '').slice(0, 60)));

  if (videos.length === 0) {
    console.log('\n   Searching for any "videoId" in JSON ...');
    const str = JSON.stringify(data);
    const videoIdMatches = str.match(/videoId[\"\']?\s*:\s*[\"\']?([a-zA-Z0-9_-]{11})/g);
    console.log('   Raw videoId-like matches count:', videoIdMatches ? videoIdMatches.length : 0);
    if (videoIdMatches && videoIdMatches.length > 0) {
      console.log('   First 5:', videoIdMatches.slice(0, 5));
    }
  } else {
    console.log('\n   => 可以解析出视频列表，爬虫逻辑可用。');
  }
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
