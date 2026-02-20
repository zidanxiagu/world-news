/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // 仓库名为 world-news 时，Pages 地址为 username.github.io/world-news/
  basePath: process.env.NODE_ENV === 'production' ? '/world-news' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/world-news/' : '',
};

module.exports = nextConfig;
