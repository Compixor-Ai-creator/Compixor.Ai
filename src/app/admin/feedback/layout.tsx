import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback Moderation — Compixor AI Admin',
  description: 'Internal administrative dashboard for reviewing visitor feedback.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-zinc-50 dark:bg-surface-950">{children}</div>;
}
