#!/usr/bin/env bash
# 路径 B 一键：热门分析 + 提交并推送 data → 触发 GitHub 自动部署（需已配置 git 且可 push）
# 使用前确保：1) 已跑过至少一次并配置好 config.js  2) 本机 git 能 push 到 origin main
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"
DATE=$(date +%Y-%m-%d)
node scripts/cli.js trending-analysis --date "$DATE"
FILE="data/trending-videos/${DATE}.json"
if [ -f "$FILE" ]; then
  git add -f "$FILE"
  if git diff --staged --quiet; then
    echo "No changes to push."
  else
    git commit -m "data: trending-analysis ${DATE}"
    git push origin main
    echo "Pushed. Deploy only will run on GitHub."
  fi
else
  echo "No file: $FILE"
fi
