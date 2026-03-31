// packages/extension/src/content/interceptor.ts
import type { SiteConfig } from '@hatchling/shared';
import { showInterceptOverlay } from './overlay';

interface DetectedProduct {
  name: string;
  price: number;
  keywords: string[];
  url: string;
}

export function setupInterceptor(
  button: HTMLElement,
  product: DetectedProduct,
  _config: SiteConfig
) {
  button.addEventListener('click', async (e) => {
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_PRODUCT',
      payload: { price: product.price, url: product.url },
    });

    if (response?.action === 'prompt') {
      e.preventDefault();
      e.stopImmediatePropagation();
      showInterceptOverlay(product);
    }
  }, { capture: true });
}
