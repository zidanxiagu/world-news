import path from 'path';
import fs from 'fs';

const DATA_BASE = path.join(process.cwd(), 'public', 'data');

function readJson(dir: string, file: string): unknown {
  const p = path.join(DATA_BASE, dir, file);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function getLatestOrSample(dir: string, sampleName: string): unknown {
  const today = new Date().toISOString().slice(0, 10);
  const dirPath = path.join(DATA_BASE, dir);
  if (!fs.existsSync(dirPath)) return null;
  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  const dated = files.filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse();
  const toTry = [today, ...dated.map((f) => f.replace('.json', ''))];
  for (const d of toTry) {
    const data = readJson(dir, `${d}.json`);
    if (data) return data;
  }
  return readJson(dir, sampleName);
}

export async function readData() {
  return {
    trendingVideos: getLatestOrSample('trending-videos', 'sample.json'),
    news: getLatestOrSample('news', 'sample.json'),
    geek: getLatestOrSample('reddit-hn', 'sample.json'),
    learning: readJson('learning', 'placeholder.json'),
  };
}
