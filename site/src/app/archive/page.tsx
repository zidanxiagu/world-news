import ArchiveClient from './ArchiveClient';

// 静态导出：不在服务端使用 searchParams，由客户端 ArchiveClient 用 useSearchParams 读取
export default function ArchivePage() {
  return <ArchiveClient />;
}
