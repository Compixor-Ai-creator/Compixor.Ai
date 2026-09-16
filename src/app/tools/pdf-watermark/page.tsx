import PdfWatermarkClient from './pdf-watermark-client';

export default function PdfWatermarkPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const initialMode = searchParams?.tab === 'remove' ? 'remove' : 'add';
  return <PdfWatermarkClient initialMode={initialMode} />;
}
