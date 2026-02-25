import Link from 'next/link';
import { readData } from '@/lib/data';
import { TrendingVideos } from '@/components/TrendingVideos';
import { XTrending } from '@/components/XTrending';
import { NewsDigest } from '@/components/NewsDigest';
import { GeekCommunity } from '@/components/GeekCommunity';

export default async function Home() {
  const data = await readData();
  return (
    <>
      <nav className="main-nav">
        <div className="nav-inner">
          <span className="nav-brand">北境日报</span>
          <div className="nav-links">
            <a href="#youtube" className="nav-link yt">
              <span className="nav-dot" />
              <span className="nav-label">YouTube 今日热门</span>
            </a>
            <a href="#x" className="nav-link x">
              <span className="nav-dot" />
              <span className="nav-label">X 今日热门</span>
            </a>
            <a href="#news" className="nav-link news">
              <span className="nav-dot" />
              <span className="nav-label">今日财经科技</span>
            </a>
            <a href="#geek" className="nav-link geek">
              <span className="nav-dot" />
              <span className="nav-label">极客社区</span>
            </a>
          </div>
          <Link href="/archive" className="nav-archive">历史归档</Link>
        </div>
      </nav>

      <main>
        <section id="youtube" className="section section-youtube">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">▶</div>
              <h2 className="section-title">YouTube 今日热门</h2>
            </div>
            <TrendingVideos data={data.trendingVideos} />
          </div>
        </section>

        <section id="x" className="section section-x">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">𝕏</div>
              <h2 className="section-title">X 今日热门</h2>
            </div>
            <XTrending data={data.geek} />
          </div>
        </section>

        <section id="news" className="section section-news">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">📊</div>
              <h2 className="section-title">今日财经科技</h2>
            </div>
            <NewsDigest data={data.news} />
          </div>
        </section>

        <section id="geek" className="section section-geek">
          <div className="section-inner">
            <div className="section-header">
              <div className="section-icon">💻</div>
              <h2 className="section-title">极客社区</h2>
            </div>
            <GeekCommunity data={data.geek} />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        数据由 Grok AI 生成摘要 · 每日自动更新
      </footer>
    </>
  );
}
