import type { SiteConfig } from '@hatchling/shared';
import { extractKeywords, parsePrice } from './helpers';

export const amazonConfig: SiteConfig = {
  name: 'Amazon',
  matchPatterns: ['*://*.amazon.com/*', '*://*.amazon.co.uk/*'],
  hostPermissions: ['*://*.amazon.com/*', '*://*.amazon.co.uk/*'],
  detectProduct(doc) {
    const titleEl = doc.querySelector('#productTitle');
    const priceWhole = doc.querySelector('.a-price .a-price-whole');
    const priceFraction = doc.querySelector('.a-price .a-price-fraction');
    const priceEl = doc.querySelector('#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen');

    if (!titleEl) return null;
    const name = titleEl.textContent?.trim() ?? '';
    if (!name) return null;

    let price = 0;
    if (priceWhole) {
      const whole = parseInt(priceWhole.textContent?.replace(/[^0-9]/g, '') ?? '0', 10);
      const fraction = parseInt(priceFraction?.textContent?.replace(/[^0-9]/g, '') ?? '0', 10);
      price = whole * 100 + fraction;
    } else if (priceEl) {
      price = parsePrice(priceEl.textContent ?? '');
    }

    if (price === 0) return null;
    return { name, price, keywords: extractKeywords(name), url: doc.location.href };
  },
  detectAddToCart(doc) {
    return doc.querySelector('#add-to-cart-button, [name="submit.add-to-cart"]') as HTMLElement | null;
  },
  detectCheckout(url) {
    return /\/(gp\/buy|checkout|cart\/proceed)/.test(url);
  },
};
