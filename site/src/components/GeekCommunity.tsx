interface Data {
  date?: string;
  reddit?: { title: string; url: string; subreddit: string; score: number }[];
  hn?: { title: string; url: string; score: number; id: string }[];
}

export function GeekCommunity({ data }: { data: unknown }) {
  const d = data as Data | null;
  const reddit = d?.reddit ?? [];
  const hn = d?.hn ?? [];
  const empty = reddit.length === 0 && hn.length === 0;
  return (
    <div>
      {empty ? (
        <p className="card">暂无数据。运行 <code>node scripts/cli.js geek</code> 拉取。</p>
      ) : (
        <>
          <h3 style={{ fontSize: '0.95rem', color: '#888', marginTop: '1rem' }}>Reddit</h3>
          {reddit.map((item, i) => (
            <div key={`r-${i}`} className="card">
              <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
              <div className="meta">r/{item.subreddit} · {item.score} pts</div>
            </div>
          ))}
          <h3 style={{ fontSize: '0.95rem', color: '#888', marginTop: '1rem' }}>Hacker News</h3>
          {hn.map((item, i) => (
            <div key={`h-${i}`} className="card">
              <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
              <div className="meta">{item.score} pts</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
