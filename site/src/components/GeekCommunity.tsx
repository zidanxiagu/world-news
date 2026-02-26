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
  icon,
  title,
  items,
  meta,
}: {
  icon: string;
  title: string;
  items: Item[];
  meta: (item: Item) => React.ReactNode;
}) {
  if (!items?.length) return null;
  return (
    <>
      <h3 className="geek-sub-title">
        <span className="geek-sub-icon">{icon}</span>
        {title}
      </h3>
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

  if (empty) {
    return <p className="empty-state">暂无极客社区数据</p>;
  }

  return (
    <div>
      <Section
        icon="🤖"
        title="Reddit"
        items={reddit}
        meta={(item) => <>r/{item.subreddit} · {item.score ?? 0} pts</>}
      />
      <Section
        icon="🔥"
        title="Hacker News"
        items={hn}
        meta={(item) => <>{item.score ?? 0} pts</>}
      />
      <Section
        icon="🚀"
        title="Product Hunt"
        items={producthunt}
        meta={(item) => <>{item.votesCount ?? 0} votes</>}
      />
      <Section
        icon="📝"
        title="Substack"
        items={substack}
        meta={(item) => <>{item.source ?? 'Substack'}</>}
      />
      <Section
        icon="📍"
        title="即刻"
        items={jike}
        meta={(item) => <>{item.source ?? '即刻'}</>}
      />
      <Section
        icon="📌"
        title="Pinterest"
        items={pinterest}
        meta={(item) => <>{item.source ?? 'Pinterest'}</>}
      />
      <Section
        icon="𝕏"
        title="X (Twitter)"
        items={x}
        meta={(item) => <>{item.source ?? 'X'}</>}
      />
    </div>
  );
}
