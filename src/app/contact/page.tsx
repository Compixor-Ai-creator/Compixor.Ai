import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us - Support & Inquiries',
  description: 'Contact Compixor AI support for tool assistance, feature requests, or technical inquiries. Email support@compixor-ai.cloud.',
  alternates: {
    canonical: 'https://compixor-ai.cloud/contact',
  },
  openGraph: {
    title: 'Contact Us - Support & Inquiries | Compixor',
    description: 'Contact Compixor AI support for tool assistance, feature requests, or technical inquiries.',
    url: 'https://compixor-ai.cloud/contact',
    siteName: 'Compixor AI',
    type: 'website',
    images: [
      {
        url: 'https://compixor-ai.cloud/brand/logo-512.png',
        width: 512,
        height: 512,
        alt: 'Compixor AI Contact & Support',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us - Support & Inquiries | Compixor',
    description: 'Contact Compixor AI support for tool assistance, feature requests, or technical inquiries.',
    images: ['https://compixor-ai.cloud/brand/logo-512.png'],
  },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Us | Compixor AI',
  description: 'Contact Compixor AI support for tool assistance, feature requests, or technical inquiries.',
  url: 'https://compixor-ai.cloud/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'Compixor AI',
    url: 'https://compixor-ai.cloud',
    email: 'support@compixor-ai.cloud',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://compixor-ai.cloud',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Contact',
      item: 'https://compixor-ai.cloud/contact',
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContactClient />
    </>
  );
}
