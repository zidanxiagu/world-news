interface Item {
  title: string;
  url: string;
  summary?: string;
  score?: number;
  subreddit?: string;
  votesCount?: number;
  source?: string;
  id?: string;
}

interface Data {
  date?: string;
  reddit?: Item[];
  hn?: Item[];
  producthunt?: Item[];
  substack?: Item[];
  jike?: Item[];
  pinterest?: Item[];
  x?: Item[];
}

function Section({
  title,
  items,
  meta,
}: {
  title: string;
  items: Item[];
  meta: (item: Item) => React.ReactNode;
}) {
  if (!items?.length) return null;
  return (
    <>
      <h3 style={{ fontSize: '0.95rem', color: '#888', marginTop: '1rem' }}>{title}</h3>
      {items.map((item, i) => (
        <div key={`${title}-${i}`} className="card">
          <h3>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          </h3>
          {item.summary ? <p className="item-summary">{item.summary}</p> : null}
          <div className="meta">{meta(item)}</div>
        </div>
      ))}
    </>
  );
}

export function GeekCommunity({ data }: { data: unknown }) {
  const d = data as Data | null;
  const reddit = d?.reddit ?? [];
  const hn = d?.hn ?? [];
  const producthunt = d?.producthunt ?? [];
  const substack = d?.substack ?? [];
  const jike = d?.jike ?? [];
  const pinterest = d?.pinterest ?? [];
  const x = d?.x ?? [];
  const empty =
    reddit.length === 0 &&
    hn.length === 0 &&
    producthunt.length === 0 &&
    substack.length === 0 &&
    jike.length === 0 &&
    pinterest.length === 0 &&
    x.length === 0;

  return (
    <div>
      {empty ? (
        <p className="card">
          暂无数据。运行 <code>node scripts/cli.js geek</code> 拉取；在 config 中配置 producthunt.apiKey、substack.feeds、jike.feeds、pinterest.feeds 可拉取更多平台。
        </p>
      ) : (
        <>
          <Section
            title="Reddit"
            items={reddit}
            meta={(item) => <>r/{item.subreddit} · {item.score ?? 0} pts</>}
          />
          <Section
            title="Hacker News"
            items={hn}
            meta={(item) => <>{item.score ?? 0} pts</>}
          />
          <Section
            title="Product Hunt"
            items={producthunt}
            meta={(item) => <>{item.votesCount ?? 0} votes</>}
          />
          <Section
            title="Substack"
            items={substack}
            meta={(item) => <>{item.source ?? 'Substack'}</>}
          />
          <Section
            title="即刻"
            items={jike}
            meta={(item) => <>{item.source ?? '即刻'}</>}
          />
          <Section
            title="Pinterest"
            items={pinterest}
            meta={(item) => <>{item.source ?? 'Pinterest'}</>}
          />
          <Section
            title="X (Twitter)"
            items={x}
            meta={(item) => <>{item.source ?? 'X'}</>}
          />
        </>
      )}
    </div>
  );
}
