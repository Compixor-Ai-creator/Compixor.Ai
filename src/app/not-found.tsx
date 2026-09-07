import React from 'react';
import type { Metadata } from 'next';
import ErrorStage from '@/components/ErrorStage';

export const metadata: Metadata = {
  title: '404 - Page Not Found | COMPIXOR.AI',
  description: 'The requested page could not be found. Your local files and memory remain safe.',
};

export default function NotFound() {
  return (
    <ErrorStage
      type="404"
      badgeTitle="Oops! 404 Error"
      badgeCode="HTTP_404_PAGE_NOT_FOUND"
      systemAlertLabel="System Alert · Page Not Found"
      headlineMain="Oh No!"
      headlineGradient="Lost in the Void."
      description="The page you were searching for has disconnected or migrated to an unknown sector. All local calculations and memory remain safe and sound."
    />
  );
}
