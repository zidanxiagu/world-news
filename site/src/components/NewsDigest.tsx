interface Item {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
}
interface Data {
  date?: string;
  items?: Item[];
}

export function NewsDigest({ data }: { data: unknown }) {
  const d = data as Data | null;
  const items = d?.items ?? [];
  return (
    <div>
      {items.length === 0 ? (
        <p className="card">暂无数据。运行 <code>node scripts/cli.js news</code> 拉取。</p>
      ) : (
        items.map((item, i) => (
          <div key={i} className="card">
            <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
            <div className="meta">{item.source} · {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</div>
          </div>
        ))
      )}
    </div>
  );
}
