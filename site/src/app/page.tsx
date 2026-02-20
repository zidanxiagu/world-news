import { readData } from '@/lib/data';
import { TrendingVideos } from '@/components/TrendingVideos';
import { NewsDigest } from '@/components/NewsDigest';
import { GeekCommunity } from '@/components/GeekCommunity';
import { LearningNotes } from '@/components/LearningNotes';

export default async function Home() {
  const data = await readData();
  return (
    <>
      <nav>
        <a href="#trending">每日热门视频</a>
        <a href="#news">财经·科技新闻</a>
        <a href="#geek">极客社区</a>
        <a href="#learning">个人学习</a>
      </nav>
      <section id="trending">
        <h2>每日热门视频</h2>
        <TrendingVideos data={data.trendingVideos} />
      </section>
      <section id="news">
        <h2>每日财经·政治·科技</h2>
        <NewsDigest data={data.news} />
      </section>
      <section id="geek">
        <h2>极客社区热门</h2>
        <GeekCommunity data={data.geek} />
      </section>
      <section id="learning">
        <h2>个人学习思考</h2>
        <LearningNotes data={data.learning} />
      </section>
    </>
  );
}
