import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us - Support & Inquiries',
  description: 'Contact Compixor AI support for tool assistance, feature requests, or technical inquiries. Email support@compixor-ai.cloud.',
  alternates: {
    canonical: 'https://compixor-ai.cloud/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
