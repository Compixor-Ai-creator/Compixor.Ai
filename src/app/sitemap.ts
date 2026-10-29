import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo-config';
import { tools } from '@/data/tools';
import { blogsData } from '@/lib/blogsData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BASE_URL;
  const siteBuildDate = new Date('2026-10-25T00:00:00.000Z');

  return [
    {
      url: `${baseUrl}`,
      lastModified: siteBuildDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...tools.map((tool) => ({
      url: `${baseUrl}${tool.href}`,
      lastModified: siteBuildDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-10-21T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: siteBuildDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-10-29T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-10-21T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: siteBuildDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogsData.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.dateModified
        ? new Date(blog.dateModified)
        : blog.datePublished
          ? new Date(blog.datePublished)
          : siteBuildDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];
}
