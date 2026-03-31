import type { SiteConfig } from '@hatchling/shared';
import { amazonConfig } from './amazon';
import { targetConfig } from './target';
import { walmartConfig } from './walmart';
import { bestbuyConfig } from './bestbuy';
import { etsyConfig } from './etsy';
import { ebayConfig } from './ebay';
import { wayfairConfig } from './wayfair';
import { nikeConfig } from './nike';
import { shopifyConfig } from './shopify';

export const SITE_CONFIGS: SiteConfig[] = [
  amazonConfig,
  targetConfig,
  walmartConfig,
  bestbuyConfig,
  etsyConfig,
  ebayConfig,
  wayfairConfig,
  nikeConfig,
  shopifyConfig,
];

export function getConfigForUrl(url: string): SiteConfig | null {
  const hostname = new URL(url).hostname;
  for (const config of SITE_CONFIGS) {
    for (const pattern of config.matchPatterns) {
      // Convert glob pattern to hostname check
      // Pattern like "*://*.amazon.com/*" -> check if hostname ends with "amazon.com"
      const match = pattern.match(/\*:\/\/\*?\.?([^/]+)/);
      if (match) {
        const domain = match[1].replace(/\*/g, '');
        if (hostname.includes(domain)) return config;
      }
    }
  }
  return null;
}
