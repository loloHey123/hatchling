import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const etsyConfig: SiteConfig = {
  name: 'Etsy',
  matchPatterns: ['*://*.etsy.com/*'],
  hostPermissions: ['*://*.etsy.com/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('h1[data-buy-box-listing-title], h1.wt-text-body-01');
    const priceEl = doc.querySelector('[data-buy-box-listing-price] p, div[data-selector="price-only"] p');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    const price = parsePrice(priceEl?.textContent ?? '');
    if (price === 0) return null;

    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('div[data-selector="add-to-cart"] button, button.add-to-cart-btn') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/(cart|checkout)/.test(url);
  },
};
