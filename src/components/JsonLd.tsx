import React from 'react';

export interface SoftwareAppSchemaProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: 'Utility' | 'DeveloperTool' | 'DesignApplication' | 'BusinessApplication';
  operatingSystem?: string;
  price?: string;
  priceCurrency?: string;
  ratingValue?: string;
  reviewCount?: string;
  featureList?: string[];
}

export function SoftwareAppJsonLd({
  name,
  description,
  url,
  applicationCategory = 'Utility',
  operatingSystem = 'Any/Web',
  price = '0',
  priceCurrency = 'USD',
  ratingValue = '4.9',
  reviewCount = '1280',
  featureList,
}: SoftwareAppSchemaProps) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Person',
      name: 'Haroon Ali',
      url: 'https://compixor-ai.vercel.app',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Compixor AI',
      url: 'https://compixor-ai.vercel.app',
      logo: 'https://compixor-ai.vercel.app/icon.png',
    },
  };

  if (featureList && featureList.length > 0) {
    schema.featureList = featureList;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface FaqItem {
  q: string;
  a: string;
}

export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs || faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Compixor AI',
    founder: {
      '@type': 'Person',
      name: 'Haroon Ali',
      jobTitle: 'Founder & Lead Developer',
      url: 'https://compixor-ai.vercel.app',
    },
    url: 'https://compixor-ai.vercel.app',
    logo: 'https://compixor-ai.vercel.app/icon.png',
    sameAs: ['https://compixor.ai', 'https://compixor-ai.vercel.app'],
    description:
      'Compixor AI provides 100% private, client-side web utilities for documents and media with zero cloud uploads.',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
