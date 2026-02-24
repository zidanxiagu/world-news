import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Personal Homepage — 多源聚合',
  description: '每日热门视频、财经科技新闻、极客社区',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 发布后尽快看到新内容，减少浏览器对 HTML 的强缓存 */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
      </head>
      <body>{children}</body>
    </html>
  );
}
