import { Suspense } from 'react';
import PdfOrganizerClient from './pdf-organizer-client';

function OrganizerClientWrapper({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const initialTab = searchParams?.tab === 'split' ? 'split' : 'merge';
  return <PdfOrganizerClient initialTab={initialTab} />;
}

export default function PdfOrganizerPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OrganizerClientWrapper searchParams={searchParams} />
    </Suspense>
  );
}
