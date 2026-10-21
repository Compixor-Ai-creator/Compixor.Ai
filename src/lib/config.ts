/**
 * Global Configuration Constants
 */

export const SITE_URL = 'https://compixor-ai.cloud';
export const SITE_SHARE_TEXT = 'Free, private online PDF & image tools - Compixor AI';
export const CONTACT_EMAIL = 'support@compixor-ai.cloud';

export interface ShareUrls {
  linkedIn: string;
  x: string;
  whatsApp: string;
  facebook: string;
}

export function getShareUrls(
  url: string = SITE_URL,
  text: string = SITE_SHARE_TEXT
): ShareUrls {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedTextAndUrl = encodeURIComponent(`${text} ${url}`);

  return {
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    whatsApp: `https://wa.me/?text=${encodedTextAndUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };
}
