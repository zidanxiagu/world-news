interface TrendItem {
  title: string;
  titleZh?: string;
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
  if (!s || s === '—' || s === '-' || s === 'N/A') return '—';
  if (/[KMBkmb]$/.test(s)) return s;
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return s;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

function hasValue(s: string | undefined): boolean {
  return !!s && s !== '—' && s !== '-' && s !== 'N/A' && s !== '';
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function parseSummaryTitles(summary: string): { intro: string; titles: string[] } {
  const idx = summary.indexOf('趋势包括');
  if (idx === -1) return { intro: summary, titles: [] };
  const intro = summary.slice(0, idx).replace(/[,，\s]+$/, '').trim();
  const rest = summary.slice(idx).replace(/^趋势包括[：:\s]*/, '').replace(/\s*[，。等]+\.?\s*$/, '').trim();
  const titles = rest
    .split(/[,，、|｜]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { intro, titles };
}

export function TrendingVideos({ data }: { data: unknown }) {
  const d = data as Data | null;
  const date = d?.date ?? '';
  const summary = d?.summary ?? '';
  const regions = d?.regions ?? [];
  const top10 = d?.analysisTop10 ?? [];
  const items = d?.items ?? [];
  const showAnalysis = top10.length > 0;
  const summaryParsed = summary ? parseSummaryTitles(summary) : null;
  const hasSummaryList = summaryParsed && summaryParsed.titles.length > 0;

  return (
    <div className="trending-section">
      {date ? (
        <div className="trending-date">
          <span className="trending-date-label">数据日期</span>
          <time dateTime={date}>{formatDate(date)}</time>
        </div>
      ) : null}
      {summary ? (
        <div className="trending-summary card">
          <strong className="trending-summary-label">趋势摘要</strong>
          {hasSummaryList ? (
            <>
              {summaryParsed!.intro && <p className="trending-summary-intro">{summaryParsed!.intro}</p>}
              <div className="trending-summary-tags" role="list">
                {summaryParsed!.titles.map((t, i) => (
                  <span key={i} className="trending-summary-tag" role="listitem">{t}</span>
                ))}
              </div>
            </>
          ) : (
            <p>{summary}</p>
          )}
          {regions.length > 0 && <div className="trending-regions">地区：{regions.join('、')}</div>}
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
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.titleZh || item.title}</a>
                  </h4>
                  {item.titleZh ? <p className="title-original">{item.title}</p> : null}
                  <div className="top10-meta">
                    <span className="top10-channel" title="频道">{item.channelTitle || '—'}</span>
                    <span className="sep">·</span>
                    <span className="top10-published" title="发布时间">{item.publishedAtFormatted || item.publishedAt || '—'}</span>
                    {item.region ? (
                      <>
                        <span className="sep">·</span>
                        <span className="top10-region">{item.region}</span>
                      </>
                    ) : null}
                  </div>
                  {hasValue(item.categoryName) ? (
                    <div className="top10-type">
                      <span className="top10-type-label">分类</span>
                      <span className="tag">{item.categoryName}</span>
                    </div>
                  ) : null}
                  <div className="top10-stats">
                    {hasValue(item.views) ? <><span className="top10-stat" title="播放量">▶ {formatNum(item.views)}</span><span className="sep">·</span></> : null}
                    {hasValue(item.likeCount) ? <><span className="top10-stat" title="点赞数">👍 {formatNum(item.likeCount)}</span><span className="sep">·</span></> : null}
                    {hasValue(item.commentCount) ? <><span className="top10-stat" title="评论数">💬 {formatNum(item.commentCount)}</span></> : null}
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
            <li key={i} className="trending-fallback-card card">
              <h3><a href={item.url} target="_blank" rel="noopener noreferrer">{item.titleZh || item.title}</a></h3>
              {item.titleZh ? <p className="title-original">{item.title}</p> : null}
              <div className="trending-fallback-meta">
                {item.channelTitle && <span className="channel">{item.channelTitle}</span>}
                {item.region && <span className="region">{item.region}</span>}
                <span className="stat">▶ {formatNum(item.views)}</span>
                <span className="stat">👍 {formatNum(item.likeCount)}</span>
                <span className="stat">💬 {formatNum(item.commentCount)}</span>
                {item.categoryName ? <span className="category tag">{item.categoryName}</span> : null}
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
