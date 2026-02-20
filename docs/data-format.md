# 数据格式说明

爬虫产出按日写入 `data/` 下对应子目录，文件名 `YYYY-MM-DD.json`。

## trending-videos

- 路径: `data/trending-videos/YYYY-MM-DD.json`
- 结构:
```json
{
  "date": "YYYY-MM-DD",
  "regions": ["US", "GB"],
  "summary": "今日 US/GB 地区热门共 N 支，趋势包括：...",
  "analyzedAt": "ISO8601",
  "analysisTop10": [
    {
      "title": "string",
      "url": "string",
      "views": "string",
      "likeCount": "string",
      "commentCount": "string",
      "shareCount": "—",
      "categoryName": "string",
      "channelTitle": "string",
      "publishedAt": "ISO8601",
      "publishedAtFormatted": "string",
      "region": "string",
      "contentSummary": "LLM 生成的内容摘要"
    }
  ],
  "items": [ "...同上字段，含 contentSummary 的为 Top10" ]
}
```
- `analysisTop10` 与每条 `contentSummary` 由本地/OpenClaw 跑 `trending-analysis` 生成（需 LLM API）。

## news

- 路径: `data/news/YYYY-MM-DD.json`
- 结构:
```json
{
  "date": "YYYY-MM-DD",
  "items": [
    { "title": "string", "url": "string", "source": "string", "publishedAt": "ISO8601" }
  ]
}
```

## reddit-hn

- 路径: `data/reddit-hn/YYYY-MM-DD.json`
- 结构:
```json
{
  "date": "YYYY-MM-DD",
  "reddit": [
    { "title": "string", "url": "string", "subreddit": "string", "score": number }
  ],
  "hn": [
    { "title": "string", "url": "string", "score": number, "id": "string" }
  ]
}
```

## learning

- 占位: `data/learning/placeholder.json` 或空数组，后续扩展。
