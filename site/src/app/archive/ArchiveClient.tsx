'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { TrendingVideos } from '@/components/TrendingVideos';
import { GeekCommunity } from '@/components/GeekCommunity';
import { NewsDigest } from '@/components/NewsDigest';

const ARCHIVE_SOURCES = [
  { id: 'news', name: 'Finance & Tech News', dir: 'news' },
  { id: 'reddit-hn', name: 'Community (Reddit / HN / PH / Substack / Pinterest / X)', dir: 'reddit-hn' },
  { id: 'trending-videos', name: 'YouTube', dir: 'trending-videos' },
];

const BASE = process.env.NODE_ENV === 'production' ? '/world-news' : '';

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

function ArchiveInner() {
  const searchParams = useSearchParams();
  const sourceId = searchParams?.get('source') ?? '';
  const date = searchParams?.get('date') ?? '';

  const [index, setIndex] = useState<Record<string, string[]>>({});
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/data/archive-index.json`)
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex({}))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!sourceId || !date) {
      setData(null);
      return;
    }
    const src = ARCHIVE_SOURCES.find((s) => s.id === sourceId);
    if (!src) {
      setData(null);
      return;
    }
    setData(null);
    fetch(`${BASE}/data/${src.dir}/${date}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, [sourceId, date]);

  const sourceMeta = ARCHIVE_SOURCES.find((s) => s.id === sourceId);

  if (loading) {
    return (
      <>
        <nav className="archive-nav">
          <Link href="/">← 首页</Link>
          <span className="archive-title">历史归档</span>
        </nav>
        <p className="card">加载中…</p>
      </>
    );
  }

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
                {(index[src.dir] ?? []).slice(0, 31).map((d) => (
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
              {(index[src.dir] ?? []).length === 0 && (
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
              <p className="card empty">该日期无数据或加载中</p>
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

export default function ArchiveClient() {
  return (
    <Suspense fallback={<p className="card">加载中…</p>}>
      <ArchiveInner />
    </Suspense>
  );
}
