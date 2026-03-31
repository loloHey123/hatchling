// packages/extension/src/content/detector.ts
import type { SiteConfig } from '@hatchling/shared';
import { setupInterceptor } from './interceptor';
import { showTrackedWarning } from './overlay';

export function startDetection(config: SiteConfig) {
  const product = config.detectProduct(document);

  // Always check if current page has a tracked product
  checkIfTracked(config);

  if (!product) return;

  // Set up interception on add-to-cart button
  const addToCartBtn = config.detectAddToCart(document);
  if (addToCartBtn) {
    setupInterceptor(addToCartBtn, product, config);
  }

  // Check if navigating to checkout
  if (config.detectCheckout(window.location.href)) {
    // On checkout pages, check if any cart items are tracked
    chrome.runtime.sendMessage({
      type: 'CHECK_PRODUCT',
      payload: { price: product.price, url: product.url },
    }).then(response => {
      if (response?.action === 'prompt') {
        import('./overlay').then(({ showInterceptOverlay }) => {
          showInterceptOverlay(product);
        });
      }
    });
  }
}

async function checkIfTracked(config: SiteConfig) {
  const product = config.detectProduct(document);
  if (!product) return;

  const response = await chrome.runtime.sendMessage({
    type: 'CHECK_TRACKED',
    payload: {
      url: window.location.href,
      keywords: product.keywords,
    },
  });

  if (response?.tracked) {
    showTrackedWarning(response.product);
  }
}
