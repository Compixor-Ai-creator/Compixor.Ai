'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WebMcpRegister() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Available tools metadata for WebMCP discovery
    const toolsCatalogue = [
      { slug: 'pdf-compressor', name: 'PDF Compressor', url: '/tools/pdf-compressor', type: 'client-side' },
      { slug: 'pdf-organizer', name: 'PDF Merge & Split', url: '/tools/pdf-organizer', type: 'client-side' },
      { slug: 'add-watermark', name: 'Add Watermark', url: '/tools/add-watermark', type: 'client-side' },
      { slug: 'remove-watermark', name: 'Remove Watermark', url: '/tools/remove-watermark', type: 'client-side' },
      { slug: 'protect-pdf', name: 'Protect PDF (AES-256)', url: '/tools/protect-pdf', type: 'client-side' },
      { slug: 'unlock-pdf', name: 'Unlock PDF', url: '/tools/unlock-pdf', type: 'client-side' },
      { slug: 'word-compressor', name: 'Word Compressor', url: '/tools/word-compressor', type: 'client-side' },
      { slug: 'passport-photo', name: 'Biometric Passport Photo Maker', url: '/tools/passport-photo', type: 'hybrid' },
      { slug: 'full-dp-maker', name: 'WhatsApp Full DP Maker', url: '/tools/full-dp-maker', type: 'client-side' },
      { slug: 'qr-generator', name: 'Vector QR Code Generator', url: '/tools/qr-generator', type: 'client-side' },
      { slug: 'pdf-to-word', name: 'PDF to Word OCR Converter', url: '/tools/pdf-to-word', type: 'server-assisted' },
      { slug: 'img-to-word', name: 'Image to Word OCR Converter', url: '/tools/img-to-word', type: 'server-assisted' },
    ];

    const faqItems = [
      {
        question: 'What is client-side PDF processing?',
        answer: 'Client-side PDF processing refers to executing all document transformations directly within the user web browser memory using WebAssembly and HTML5 Canvas, completely eliminating the need to upload files to external cloud servers.',
      },
      {
        question: 'Are my files uploaded to Compixor servers?',
        answer: 'No. Compixor runs 9 of its core tools completely client-side in your local browser sandbox. Your files never leave your device. Our server-assisted OCR and passport tools process streams over encrypted HTTPS and purge data immediately.',
      },
      {
        question: 'How does Compixor compress and edit files for free?',
        answer: 'Compixor utilizes your device own CPU and GPU power via WebAssembly and HTML5 Canvas instead of running costly cloud server fleets. This enables zero subscriptions, no watermarks, and unlimited free usage.',
      },
      {
        question: 'Is client-side document processing secure for sensitive business files?',
        answer: 'Yes. Because client-side tools run in sandboxed browser memory, sensitive business contracts and personal documents never cross the internet or touch third-party disks, ensuring total zero-data-leak compliance.',
      },
      {
        question: 'Can I print biometric passport photos made on Compixor at retail stores?',
        answer: 'Yes. Compixor renders passport photo print sheets at exact 300 DPI resolution formatted for standard 4x6 inch photo paper, allowing direct printing at CVS, Walgreens, Boots, Walmart, or home printers.',
      },
    ];

    // Helper functions
    const searchFAQ = (query: string) => {
      const q = (query || '').toLowerCase().trim();
      if (!q) return faqItems;
      return faqItems.filter(
        (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      );
    };

    const listAvailableTools = (category?: string) => {
      if (!category) return toolsCatalogue;
      const cat = category.toLowerCase();
      return toolsCatalogue.filter((t) => t.type.includes(cat) || t.name.toLowerCase().includes(cat));
    };

    const launchClientTool = (toolSlug: string) => {
      const found = toolsCatalogue.find(
        (t) => t.slug === toolSlug || t.slug.includes(toolSlug) || t.name.toLowerCase().includes(toolSlug.toLowerCase())
      );
      if (found) {
        router.push(found.url);
        return { success: true, message: `Navigating to ${found.name}`, url: found.url };
      }
      return { success: false, message: `Tool "${toolSlug}" not found.`, availableTools: toolsCatalogue.map((t) => t.slug) };
    };

    // Expose globally on window for agent inspection
    (window as any).__compixorWebMcp = {
      searchFAQ,
      listAvailableTools,
      launchClientTool,
      openClientTool: launchClientTool,
      tools: toolsCatalogue,
      faqs: faqItems,
    };

    // Imperative WebMCP API registration if supported
    const nav = navigator as any;
    if (nav && typeof nav.modelContext !== 'undefined' && typeof nav.modelContext.registerTool === 'function') {
      try {
        nav.modelContext.registerTool({
          name: 'searchFAQ',
          description: 'Search frequently asked questions about Compixor privacy and browser tools',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Question or keyword to lookup in FAQ knowledge base',
              },
            },
            required: ['query'],
          },
          handler: async ({ query }: { query: string }) => {
            return { results: searchFAQ(query) };
          },
        });

        nav.modelContext.registerTool({
          name: 'listAvailableTools',
          description: 'List and filter all available free client-side and hybrid browser tools on Compixor',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Optional filter by category or tool type (client-side, hybrid, server-assisted)',
              },
            },
          },
          handler: async ({ category }: { category?: string }) => {
            return { tools: listAvailableTools(category) };
          },
        });

        nav.modelContext.registerTool({
          name: 'launchClientTool',
          description: 'Open and navigate to a specific Compixor tool by its slug or name',
          parameters: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                description: 'Slug of the tool to launch (e.g. pdf-compressor, pdf-to-word, passport-photo)',
              },
            },
            required: ['slug'],
          },
          handler: async ({ slug }: { slug: string }) => {
            return launchClientTool(slug);
          },
        });

        nav.modelContext.registerTool({
          name: 'openClientTool',
          description: 'Alias for launchClientTool: open a client tool on Compixor',
          parameters: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                description: 'Slug of the tool to launch',
              },
            },
            required: ['slug'],
          },
          handler: async ({ slug }: { slug: string }) => {
            return launchClientTool(slug);
          },
        });
      } catch (err) {
        console.warn('WebMCP registration notice:', err);
      }
    }
  }, [router]);

  return null;
}
