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
  author?: string;
  likes?: number;
  retweets?: number;
}
interface GeekData {
  reddit?: GeekItem[];
  hn?: GeekItem[];
  producthunt?: GeekItem[];
  substack?: GeekItem[];
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
          <span className="nav-brand">抓瞎</span>
          <div className="nav-links">
            <a href="#reddit" className="nav-link reddit"><span className="nav-dot" />Reddit</a>
            <a href="#hn" className="nav-link hn"><span className="nav-dot" />Hacker News</a>
            <a href="#ph" className="nav-link ph"><span className="nav-dot" />Product Hunt</a>
            <a href="#sub" className="nav-link sub"><span className="nav-dot" />Substack</a>
            <a href="#pin" className="nav-link pin"><span className="nav-dot" />Pinterest</a>
            <a href="#news" className="nav-link news"><span className="nav-dot" />Finance & Tech</a>
            <a href="#youtube" className="nav-link yt"><span className="nav-dot" />YouTube</a>
            <a href="#x" className="nav-link x"><span className="nav-dot" />X</a>
          </div>
          <Link href="/archive" className="nav-archive">归档</Link>
          <a href="https://zidanxiagu.github.io/world-news/feed.xml" className="nav-rss" target="_blank" rel="noopener noreferrer" title="RSS 订阅">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="6.18" cy="17.82" r="2.18"/><path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/></svg>
          </a>
        </div>
      </nav>

      <MobileNav />

      <main>
        {/* 1. Reddit */}
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

        {/* 2. Hacker News */}
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

        {/* 3. Product Hunt */}
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

        {/* 4. Substack */}
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

        {/* 5. Pinterest */}
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

        {/* 6. 财经科技 */}
        <section id="news" className="section section-news">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">📊</div>
              <h2 className="section-title">Finance & Tech News</h2>
            </div>
            <NewsDigest data={data.news} />
          </div>
        </section>

        {/* 7. YouTube */}
        <section id="youtube" className="section section-yt">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">▶</div>
              <h2 className="section-title">YouTube</h2>
            </div>
            <TrendingVideos data={data.trendingVideos} />
          </div>
        </section>

        {/* 8. X */}
        <section id="x" className="section section-x">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">𝕏</div>
              <h2 className="section-title">X (Twitter)</h2>
            </div>
            <PlatformFeed
              items={geek.x ?? []}
              meta={(item) => <>
                {item.author ? <span className="x-author">{item.author}</span> : null}
                {item.author && (item.likes || item.retweets) ? <span className="sep"> · </span> : null}
                {item.likes ? <span title="点赞">❤️ {item.likes >= 1000 ? (item.likes / 1000).toFixed(1) + 'K' : item.likes}</span> : null}
                {item.likes && item.retweets ? <span className="sep"> · </span> : null}
                {item.retweets ? <span title="转发">🔁 {item.retweets >= 1000 ? (item.retweets / 1000).toFixed(1) + 'K' : item.retweets}</span> : null}
                {!item.author && !item.likes && !item.retweets ? <span>{item.source ?? 'X'}</span> : null}
              </>}
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        数据由 Grok AI 生成摘要 · 每日自动更新 ·{' '}
        <a href="https://zidanxiagu.github.io/world-news/feed.xml" target="_blank" rel="noopener noreferrer" className="footer-rss">
          RSS 订阅
        </a>
      </footer>
    </>
  );
}
