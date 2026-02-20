interface Item {
  title: string;
  url: string;
  views: string;
  source: string;
  channelTitle?: string;
  region?: string;
}
interface Data {
  date?: string;
  regions?: string[];
  summary?: string;
  items?: Item[];
}

export function TrendingVideos({ data }: { data: unknown }) {
  const d = data as Data | null;
  const items = d?.items ?? [];
  const summary = d?.summary ?? '';
  const regions = d?.regions ?? [];
  return (
    <div>
      {summary ? (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <strong>趋势摘要</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>{summary}</p>
          {regions.length > 0 && (
            <div className="meta">地区: {regions.join(', ')}</div>
          )}
        </div>
      ) : null}
      {items.length === 0 ? (
        <p className="card">暂无数据。运行 <code>node scripts/cli.js trending-videos</code> 拉取。</p>
      ) : (
        items.map((item, i) => (
          <div key={i} className="card">
            <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
            <div className="meta">
              {item.source}
              {item.channelTitle ? ` · ${item.channelTitle}` : ''}
              {item.region ? ` · ${item.region}` : ''}
              {' · '}{item.views} 播放
            </div>
          </div>
        ))
      )}
    </div>
  );
}
