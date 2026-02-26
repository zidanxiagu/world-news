import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://zidanxiagu.github.io/world-news';

export const metadata: Metadata = {
  title: '抓瞎 - 带你每日瞎看世界',
  description: '抓瞎 - 带你每日瞎看世界',
  icons: {
    icon: [
      { url: `${SITE_URL}/favicon.png`, sizes: '32x32', type: 'image/png' },
      { url: `${SITE_URL}/favicon-16x16.png`, sizes: '16x16', type: 'image/png' },
    ],
    apple: `${SITE_URL}/apple-touch-icon.png`,
  },
  openGraph: {
    title: '抓瞎 - 带你每日瞎看世界',
    description: '抓瞎 - 带你每日瞎看世界',
    url: SITE_URL,
    siteName: '抓瞎',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: '抓瞎',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '抓瞎 - 带你每日瞎看世界',
    description: '抓瞎 - 带你每日瞎看世界',
    images: [`${SITE_URL}/og-image.png`],
  },
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
