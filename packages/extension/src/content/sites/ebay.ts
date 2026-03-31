import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const ebayConfig: SiteConfig = {
  name: 'eBay',
  matchPatterns: ['*://*.ebay.com/*', '*://*.ebay.co.uk/*'],
  hostPermissions: ['*://*.ebay.com/*', '*://*.ebay.co.uk/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('.x-item-title__mainTitle span, h1.x-item-title__mainTitle');
    const priceEl = doc.querySelector('.x-price-primary span, #prcIsum');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    const price = parsePrice(priceEl?.textContent ?? '');
    if (price === 0) return null;

    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('a#binBtn_btn, a.vim-buybox-ux-bin') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/(rxo|pay)/.test(url);
  },
};
