'use client';

import React, { useEffect } from 'react';
import ErrorStage from '@/components/ErrorStage';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log runtime error to client console
    console.error('Compixor Application Error:', error);
  }, [error]);

  return (
    <ErrorStage
      type="error"
      badgeTitle="Oops! System Error"
      badgeCode={error?.digest ? `ERR_${error.digest.slice(0, 8)}` : 'ERR_RUNTIME_EXCEPTION'}
      systemAlertLabel="System Alert · Runtime Error"
      headlineMain="System Glitch!"
      headlineGradient="Calculations Interrupted."
      description="An unexpected glitch occurred during execution. Your local files and browser memory remain completely protected and untampered."
      error={error}
      reset={reset}
    />
  );
}
