import Link from 'next/link';
import { readData } from '@/lib/data';
import { TrendingVideos } from '@/components/TrendingVideos';
import { NewsDigest } from '@/components/NewsDigest';
import { PlatformFeed } from '@/components/PlatformFeed';
import { MobileNav } from '@/components/MobileNav';

interface GeekItem {
  title: string;
  url: string;
  summary?: string;
  score?: number;
  subreddit?: string;
  votesCount?: number;
  source?: string;
}
interface GeekData {
  reddit?: GeekItem[];
  hn?: GeekItem[];
  producthunt?: GeekItem[];
  substack?: GeekItem[];
  jike?: GeekItem[];
  pinterest?: GeekItem[];
  x?: GeekItem[];
}

export default async function Home() {
  const data = await readData();
  const geek = (data.geek ?? {}) as GeekData;

  return (
    <>
      <nav className="main-nav">
        <div className="nav-inner">
          <span className="nav-brand">每日热门</span>
          <div className="nav-links">
            <a href="#news" className="nav-link news"><span className="nav-dot" />Finance & Tech</a>
            <a href="#reddit" className="nav-link reddit"><span className="nav-dot" />Reddit</a>
            <a href="#hn" className="nav-link hn"><span className="nav-dot" />Hacker News</a>
            <a href="#ph" className="nav-link ph"><span className="nav-dot" />Product Hunt</a>
            <a href="#sub" className="nav-link sub"><span className="nav-dot" />Substack</a>
            <a href="#jike" className="nav-link jike"><span className="nav-dot" />即刻</a>
            <a href="#pin" className="nav-link pin"><span className="nav-dot" />Pinterest</a>
            <a href="#youtube" className="nav-link yt"><span className="nav-dot" />YouTube</a>
            <a href="#x" className="nav-link x"><span className="nav-dot" />X</a>
          </div>
          <Link href="/archive" className="nav-archive">归档</Link>
        </div>
      </nav>

      <MobileNav />

      <main>
        {/* 1. 财经科技 */}
        <section id="news" className="section section-news">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">📊</div>
              <h2 className="section-title">Finance & Tech News</h2>
            </div>
            <NewsDigest data={data.news} />
          </div>
        </section>

        {/* 2. Reddit */}
        <section id="reddit" className="section section-reddit">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">🤖</div>
              <h2 className="section-title">Reddit</h2>
            </div>
            <PlatformFeed
              items={geek.reddit ?? []}
              meta={(item) => <>r/{item.subreddit} · {item.score ?? 0} pts</>}
            />
          </div>
        </section>

        {/* 3. Hacker News */}
        <section id="hn" className="section section-hn">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">🔥</div>
              <h2 className="section-title">Hacker News</h2>
            </div>
            <PlatformFeed
              items={geek.hn ?? []}
              meta={(item) => <>{item.score ?? 0} pts</>}
            />
          </div>
        </section>

        {/* 4. Product Hunt */}
        <section id="ph" className="section section-ph">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">🚀</div>
              <h2 className="section-title">Product Hunt</h2>
            </div>
            <PlatformFeed
              items={geek.producthunt ?? []}
              meta={(item) => <>{item.votesCount ?? 0} votes</>}
            />
          </div>
        </section>

        {/* 5. Substack */}
        <section id="sub" className="section section-sub">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">📝</div>
              <h2 className="section-title">Substack</h2>
            </div>
            <PlatformFeed
              items={geek.substack ?? []}
              meta={(item) => <>{item.source ?? 'Substack'}</>}
            />
          </div>
        </section>

        {/* 6. 即刻 */}
        <section id="jike" className="section section-jike">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">📍</div>
              <h2 className="section-title">即刻</h2>
            </div>
            <PlatformFeed
              items={geek.jike ?? []}
              meta={(item) => <>{item.source ?? '即刻'}</>}
            />
          </div>
        </section>

        {/* 7. Pinterest */}
        <section id="pin" className="section section-pin">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">📌</div>
              <h2 className="section-title">Pinterest</h2>
            </div>
            <PlatformFeed
              items={geek.pinterest ?? []}
              meta={(item) => <>{item.source ?? 'Pinterest'}</>}
            />
          </div>
        </section>

        {/* 8. YouTube */}
        <section id="youtube" className="section section-yt">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">▶</div>
              <h2 className="section-title">YouTube</h2>
            </div>
            <TrendingVideos data={data.trendingVideos} />
          </div>
        </section>

        {/* 9. X */}
        <section id="x" className="section section-x">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">𝕏</div>
              <h2 className="section-title">X (Twitter)</h2>
            </div>
            <PlatformFeed
              items={geek.x ?? []}
              meta={(item) => <>{item.source ?? 'X'}</>}
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        数据由 Grok AI 生成摘要 · 每日自动更新
      </footer>
    </>
  );
}
