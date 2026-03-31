import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const targetConfig: SiteConfig = {
  name: 'Target',
  matchPatterns: ['*://*.target.com/*'],
  hostPermissions: ['*://*.target.com/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('h1[data-test="product-title"], [data-test="product-detail-title"]');
    const priceEl = doc.querySelector('[data-test="product-price"], span[data-test="product-price-sale"]');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    const price = parsePrice(priceEl?.textContent ?? '');
    if (price === 0) return null;

    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('button[data-test="addToCartButton"], button[data-test="shipItButton"]') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/(cart|checkout)/.test(url);
  },
};
