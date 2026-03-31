// packages/extension/src/content/overlay.ts

interface DetectedProduct {
  name: string;
  price: number;
  keywords: string[];
  url: string;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function showInterceptOverlay(product: DetectedProduct) {
  // Remove existing overlay if any
  document.getElementById('hatchling-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'hatchling-overlay';
  overlay.innerHTML = `
    <div class="hatchling-backdrop"></div>
    <div class="hatchling-modal">
      <div class="hatchling-modal-header">
        <span class="hatchling-egg-icon">🥚</span>
        <h2 class="hatchling-title">Hold on!</h2>
      </div>
      <p class="hatchling-body">
        Do you <em>really</em> need <strong>${escapeHtml(product.name.substring(0, 80))}</strong> for
        <strong>$${(product.price / 100).toFixed(2)}</strong>?
      </p>
      <p class="hatchling-subtitle">
        Or is this an impulse purchase?
      </p>
      <div class="hatchling-offer">
        <p>Delay this purchase and receive a <strong>mystery egg token</strong>!</p>
        <p>Wait 14 days without buying this item and hatch a rare creature.</p>
      </div>
      <div class="hatchling-buttons">
        <button class="hatchling-btn hatchling-btn-delay" id="hatchling-delay">
          Delay &amp; Get Token!
        </button>
        <button class="hatchling-btn hatchling-btn-skip" id="hatchling-skip">
          I really need this
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('hatchling-delay')!.addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({
      type: 'DELAY_PURCHASE',
      payload: {
        productName: product.name,
        productPrice: product.price,
        productKeywords: product.keywords,
        productUrl: product.url,
      },
    });

    if (response?.success) {
      const modal = overlay.querySelector('.hatchling-modal')!;
      modal.innerHTML = `
        <div class="hatchling-success">
          <h2 class="hatchling-title">Token earned!</h2>
          <p class="hatchling-body">
            You earned a gacha token worth <strong>$${(product.price / 100).toFixed(2)}</strong>!
          </p>
          <p class="hatchling-subtitle">
            Visit the Hatchling app to pull the gacha machine and start incubating your egg.
          </p>
          <div class="hatchling-buttons">
            <button class="hatchling-btn hatchling-btn-delay" id="hatchling-open-app">
              Open Hatchling
            </button>
            <button class="hatchling-btn hatchling-btn-skip" id="hatchling-close-success">
              Close
            </button>
          </div>
        </div>
      `;
      document.getElementById('hatchling-open-app')!.addEventListener('click', () => {
        window.open(response.webAppUrl || 'http://localhost:5173', '_blank');
        overlay.remove();
      });
      document.getElementById('hatchling-close-success')!.addEventListener('click', () => {
        overlay.remove();
      });
    }
  });

  document.getElementById('hatchling-skip')!.addEventListener('click', () => {
    overlay.remove();
  });

  // Close on backdrop click
  overlay.querySelector('.hatchling-backdrop')!.addEventListener('click', () => {
    overlay.remove();
  });
}

export function showTrackedWarning(trackedProduct: { product_name: string; id: string }) {
  // Remove existing warning
  document.getElementById('hatchling-warning')?.remove();

  const banner = document.createElement('div');
  banner.id = 'hatchling-warning';
  banner.innerHTML = `
    <div class="hatchling-warning-banner">
      <span class="hatchling-warning-icon">⚠️</span>
      <span class="hatchling-warning-text">
        You have an egg incubating for <strong>${escapeHtml(trackedProduct.product_name)}</strong>.
        Buying this will <strong>destroy your egg!</strong>
      </span>
      <button class="hatchling-warning-close" id="hatchling-dismiss-warning">✕</button>
    </div>
  `;
  document.body.prepend(banner);

  document.getElementById('hatchling-dismiss-warning')!.addEventListener('click', () => {
    banner.remove();
  });
}
