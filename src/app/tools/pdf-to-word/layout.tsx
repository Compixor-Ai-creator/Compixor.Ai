import type { Metadata } from 'next';
import { getToolMetadata, getToolSchemas, ToolSlug } from '@/lib/seo-config';

const TOOL_SLUG: ToolSlug = 'pdf-to-word';

export const metadata: Metadata = getToolMetadata(TOOL_SLUG);

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemas = getToolSchemas(TOOL_SLUG);

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {children}
    </>
  );
}
