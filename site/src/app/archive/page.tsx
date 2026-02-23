import Link from 'next/link';
import { getArchiveIndex, getDataByDate, ARCHIVE_SOURCES } from '@/lib/data';
import { TrendingVideos } from '@/components/TrendingVideos';
import { GeekCommunity } from '@/components/GeekCommunity';
import { NewsDigest } from '@/components/NewsDigest';

function ArchiveContent({
  sourceId,
  date,
  data,
}: {
  sourceId: string;
  date: string;
  data: unknown;
}) {
  if (sourceId === 'trending-videos') return <TrendingVideos data={data} />;
  if (sourceId === 'reddit-hn') return <GeekCommunity data={data} />;
  if (sourceId === 'news') return <NewsDigest data={data} />;
  return <p className="card empty">未知来源</p>;
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; date?: string }>;
}) {
  const params = await searchParams;
  const sourceId = params?.source ?? '';
  const date = params?.date ?? '';
  const index = getArchiveIndex();
  const data = sourceId && date ? getDataByDate(sourceId, date) : null;
  const sourceMeta = ARCHIVE_SOURCES.find((s) => s.id === sourceId);

  return (
    <>
      <nav className="archive-nav">
        <Link href="/">← 首页</Link>
        <span className="archive-title">历史归档</span>
      </nav>
      <section className="archive-section">
        <h2>按来源与日期查看</h2>
        <div className="archive-sources">
          {ARCHIVE_SOURCES.map((src) => (
            <div key={src.id} className="archive-source-block">
              <h3 className="archive-source-name">{src.name}</h3>
              <ul className="archive-dates">
                {(index[src.id] ?? []).slice(0, 31).map((d) => (
                  <li key={d}>
                    <Link
                      href={`/archive?source=${src.id}&date=${d}`}
                      className={sourceId === src.id && date === d ? 'active' : undefined}
                    >
                      {d}
                    </Link>
                  </li>
                ))}
              </ul>
              {(index[src.id] ?? []).length === 0 && (
                <p className="archive-empty">暂无该来源数据</p>
              )}
            </div>
          ))}
        </div>

        {sourceId && date && (
          <div className="archive-content">
            <h3 className="archive-content-title">
              {sourceMeta?.name ?? sourceId} · {date}
            </h3>
            {data ? (
              <ArchiveContent sourceId={sourceId} date={date} data={data} />
            ) : (
              <p className="card empty">该日期无数据</p>
            )}
          </div>
        )}

        {!sourceId && (
          <p className="archive-hint card">请在上方选择来源与日期查看历史数据。</p>
        )}
      </section>
    </>
  );
}
