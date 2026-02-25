interface Item {
  title: string;
  titleZh?: string;
  url: string;
  summary?: string;
  score?: number;
  subreddit?: string;
  votesCount?: number;
  source?: string;
}

export function PlatformFeed({
  items,
  meta,
}: {
  items: Item[];
  meta: (item: Item) => React.ReactNode;
}) {
  if (items.length === 0) {
    return <p className="empty-state">暂无数据</p>;
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
          <div className="meta">{meta(item)}</div>
        </div>
      ))}
    </div>
  );
}
