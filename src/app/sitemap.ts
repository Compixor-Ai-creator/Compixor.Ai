import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo-config';
import { tools } from '@/data/tools';
import { blogsData } from '@/lib/blogsData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = BASE_URL;
  const currentDate = new Date();

  return [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...tools.map((tool) => ({
      url: `${baseUrl}${tool.href}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogsData.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];
}
