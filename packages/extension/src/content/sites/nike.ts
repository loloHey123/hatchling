import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const nikeConfig: SiteConfig = {
  name: 'Nike',
  matchPatterns: ['*://*.nike.com/*'],
  hostPermissions: ['*://*.nike.com/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('h1#pdp_product_title');
    const priceEl = doc.querySelector('[data-test="product-price"], div.product-price');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    const price = parsePrice(priceEl?.textContent ?? '');
    if (price === 0) return null;

    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('button[data-testid="add-to-cart-btn"], button.ncss-btn-primary-dark') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/checkout/.test(url);
  },
};
