#!/usr/bin/env bash
# OpenClaw 每日定时任务：热门视频抓取 + Top10 LLM 分析
# 在 OpenClaw 里添加「定时任务」或「快捷指令」，每日执行本脚本即可。
set -e
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"
DATE=$(date +%Y-%m-%d)
node scripts/cli.js trending-analysis --date "$DATE"
echo "Done: $DATE"
