interface Item {
  title: string;
  titleZh?: string;
  url: string;
  source: string;
  publishedAt?: string;
  summary?: string;
}
interface Data {
  date?: string;
  items?: Item[];
}

export function NewsDigest({ data }: { data: unknown }) {
  const d = data as Data | null;
  const items = d?.items ?? [];

  if (items.length === 0) {
    return <p className="empty-state">暂无财经科技新闻</p>;
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="card">
          <h3>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.titleZh || item.title}
            </a>
          </h3>
          {item.titleZh ? <p className="title-original">{item.title}</p> : null}
          {item.summary ? <p className="item-summary">{item.summary}</p> : null}
          <div className="meta">
            {item.source}
            {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString('zh-CN')}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
