import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const wayfairConfig: SiteConfig = {
  name: 'Wayfair',
  matchPatterns: ['*://*.wayfair.com/*'],
  hostPermissions: ['*://*.wayfair.com/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('h1.ProductDetailInfoBlock-header, h1[data-hb-id="Heading"]');
    const priceEl = doc.querySelector('[class*="BasePriceBlock"] span, .ProductDetailInfoBlock span.is-selected');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    const price = parsePrice(priceEl?.textContent ?? '');
    if (price === 0) return null;

    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('button[data-enzyme-id="PrimaryCTA"], button.ProductDetailPage-addToCart') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/checkout/.test(url);
  },
};
