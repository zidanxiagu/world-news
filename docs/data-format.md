# 数据格式说明

爬虫产出按日写入 `data/` 下对应子目录，文件名 `YYYY-MM-DD.json`。

## trending-videos

- 路径: `data/trending-videos/YYYY-MM-DD.json`
- 结构:
```json
{
  "date": "YYYY-MM-DD",
  "items": [
    { "title": "string", "url": "string", "views": "string", "source": "youtube|tiktok" }
  ]
}
```

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
