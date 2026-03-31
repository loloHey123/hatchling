import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const bestbuyConfig: SiteConfig = {
  name: 'Best Buy',
  matchPatterns: ['*://*.bestbuy.com/*'],
  hostPermissions: ['*://*.bestbuy.com/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('.sku-title h1, h1.heading-5');
    const priceEl = doc.querySelector('.priceView-customer-price span:first-child, .priceView-hero-price span:first-child');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    const price = parsePrice(priceEl?.textContent ?? '');
    if (price === 0) return null;

    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('.add-to-cart-button, button.c-button-primary[data-button-state="ADD_TO_CART"]') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/(checkout|cart)/.test(url);
  },
};
