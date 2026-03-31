import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const shopifyConfig: SiteConfig = {
  name: 'Shopify',
  matchPatterns: ['*://*/*'],
  hostPermissions: ['*://*/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('.product__title, h1.product-single__title, .product-title, h1[class*="product"]');
    const priceEl = doc.querySelector('.price__regular span, .product__price, .product-single__price, [class*="price"] span');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    const price = parsePrice(priceEl?.textContent ?? '');
    if (price === 0) return null;

    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('button[name="add"], .product-form__submit, button[type="submit"][name="add"]') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/checkout/.test(url);
  },
};
