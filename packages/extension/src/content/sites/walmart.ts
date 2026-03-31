import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const walmartConfig: SiteConfig = {
  name: 'Walmart',
  matchPatterns: ['*://*.walmart.com/*'],
  hostPermissions: ['*://*.walmart.com/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('h1[itemprop="name"], h1.prod-ProductTitle');
    const priceEl = doc.querySelector('span[itemprop="price"], [data-testid="price-wrap"] span');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    const price = parsePrice(priceEl?.textContent ?? '');
    if (price === 0) return null;

    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('button[data-tl-id="ProductPrimaryCTA-normal"], button.prod-ProductCTA--primary') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/checkout/.test(url);
  },
};
