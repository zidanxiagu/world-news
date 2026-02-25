interface Item {
  title: string;
  url: string;
  summary?: string;
  source?: string;
}

interface Data {
  x?: Item[];
}

export function XTrending({ data }: { data: unknown }) {
  const d = data as Data | null;
  const items = d?.x ?? [];

  if (items.length === 0) {
    return <p className="empty-state">暂无 X 热门数据</p>;
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="card">
          <h3>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          </h3>
          {item.summary ? <p className="item-summary">{item.summary}</p> : null}
          <div className="meta">{item.source ?? 'X'}</div>
        </div>
      ))}
    </div>
  );
}
