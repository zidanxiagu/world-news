interface TrendItem {
  title: string;
  url: string;
  views?: string;
  source?: string;
  channelTitle?: string;
  region?: string;
  likeCount?: string;
  commentCount?: string;
  shareCount?: string;
  categoryName?: string;
  publishedAt?: string;
  publishedAtFormatted?: string;
  contentSummary?: string;
}
interface Data {
  date?: string;
  regions?: string[];
  summary?: string;
  analyzedAt?: string;
  analysisTop10?: TrendItem[];
  items?: TrendItem[];
}

function formatNum(s: string | undefined): string {
  if (s === undefined || s === '—' || s === '-') return '—';
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return s;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

export function TrendingVideos({ data }: { data: unknown }) {
  const d = data as Data | null;
  const summary = d?.summary ?? '';
  const regions = d?.regions ?? [];
  const top10 = d?.analysisTop10 ?? [];
  const items = d?.items ?? [];
  const showAnalysis = top10.length > 0;

  return (
    <div className="trending-section">
      {summary ? (
        <div className="trending-summary card">
          <strong>趋势摘要</strong>
          <p>{summary}</p>
          {regions.length > 0 && <div className="meta">地区: {regions.join(', ')}</div>}
        </div>
      ) : null}

      {showAnalysis ? (
        <div className="trending-top10">
          <h3 className="top10-title">Top 10 热门分析</h3>
          <ul className="top10-list">
            {top10.map((item, i) => (
              <li key={i} className="top10-card card">
                <div className="top10-rank">#{i + 1}</div>
                <div className="top10-main">
                  <h4 className="top10-name">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                  </h4>
                  <div className="top10-meta">
                    <span title="作者">{item.channelTitle || '—'}</span>
                    <span className="sep">·</span>
                    <span title="发布时间">{item.publishedAtFormatted || item.publishedAt || '—'}</span>
                    {item.region ? (
                      <>
                        <span className="sep">·</span>
                        <span>{item.region}</span>
                      </>
                    ) : null}
                  </div>
                  {item.categoryName ? (
                    <div className="top10-type">
                      <span className="tag">{item.categoryName}</span>
                    </div>
                  ) : null}
                  <div className="top10-stats">
                    <span title="播放">播放 {formatNum(item.views)}</span>
                    <span className="sep">·</span>
                    <span title="点赞">👍 {formatNum(item.likeCount)}</span>
                    <span className="sep">·</span>
                    <span title="评论">💬 {formatNum(item.commentCount)}</span>
                    <span className="sep">·</span>
                    <span title="分享">↗ {item.shareCount ?? '—'}</span>
                  </div>
                  {item.contentSummary ? (
                    <div className="top10-summary">
                      <strong>内容摘要</strong>
                      <p>{item.contentSummary}</p>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!showAnalysis && items.length > 0 ? (
        <ul className="trending-fallback">
          {items.map((item, i) => (
            <li key={i} className="card">
              <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a></h3>
              <div className="meta">
                {item.source}
                {item.channelTitle ? ` · ${item.channelTitle}` : ''}
                {item.region ? ` · ${item.region}` : ''}
                {' · '}{item.views ?? '—'} 播放
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {items.length === 0 && !showAnalysis ? (
        <p className="card empty">暂无数据。运行 <code>node scripts/cli.js trending-analysis</code>（或 trending-videos）拉取。</p>
      ) : null}
    </div>
  );
}
