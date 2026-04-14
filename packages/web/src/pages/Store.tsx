import { useState } from 'react';
import { COSMETICS, CosmeticDef } from '../data/cosmetics';
import { useStore } from '../hooks/useStore';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';

type Category = 'all' | 'hat' | 'accessory' | 'background' | 'effect';

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  hat: 'Hats',
  accessory: 'Accessories',
  background: 'Backgrounds',
  effect: 'Effects',
};

const CATEGORY_ICONS: Record<string, string> = {
  hat: '\u{1F3A9}',
  accessory: '\u{1F576}\uFE0F',
  background: '\u{1F5BC}\uFE0F',
  effect: '\u2728',
};

const CATEGORY_COLORS: Record<string, string> = {
  hat: 'bg-[#f8d878]',
  accessory: 'bg-[#78b8f8]',
  background: 'bg-[#98d878]',
  effect: 'bg-[#d878f8]',
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function CosmeticItem({
  cosmetic,
  owned,
  canAfford,
  onBuy,
}: {
  cosmetic: CosmeticDef;
  owned: boolean;
  canAfford: boolean;
  onBuy: (cosmetic: CosmeticDef) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const handleBuy = async () => {
    setPurchasing(true);
    onBuy(cosmetic);
    // Parent handles the actual purchase; reset state after a delay
    setTimeout(() => {
      setConfirming(false);
      setPurchasing(false);
    }, 1000);
  };

  return (
    <PixelFrame className="flex flex-col items-center text-center relative">
      {owned && (
        <div className="absolute top-2 right-2 bg-theme-success text-white text-pixel-xs font-pixel px-2 py-1 border-[2px] border-theme-border">
          OWNED
        </div>
      )}

      {/* Category placeholder icon */}
      <div
        className={`w-16 h-16 flex items-center justify-center text-[28px] border-[2px] border-theme-border mb-2 ${CATEGORY_COLORS[cosmetic.category]}`}
      >
        {CATEGORY_ICONS[cosmetic.category]}
      </div>

      <div className="text-pixel-base font-bold mb-1">{cosmetic.name}</div>
      <div className="text-pixel-xs text-theme-text-muted mb-2 min-h-[24px]">{cosmetic.description}</div>

      <div
        className={`text-pixel-base font-bold mb-2 ${
          owned ? 'text-theme-success' : canAfford ? 'text-theme-text' : 'text-[#ccc]'
        }`}
      >
        {formatPrice(cosmetic.price)}
      </div>

      {!owned && !confirming && (
        <PixelButton
          size="sm"
          variant={canAfford ? 'primary' : 'secondary'}
          disabled={!canAfford}
          onClick={() => setConfirming(true)}
        >
          {canAfford ? 'Buy' : 'Not enough'}
        </PixelButton>
      )}

      {!owned && confirming && (
        <div className="space-y-1">
          <div className="text-pixel-sm text-theme-danger font-bold">Are you sure?</div>
          <div className="flex gap-2">
            <PixelButton size="sm" variant="primary" disabled={purchasing} onClick={handleBuy}>
              {purchasing ? '...' : 'Yes'}
            </PixelButton>
            <PixelButton size="sm" variant="secondary" onClick={() => setConfirming(false)}>
              No
            </PixelButton>
          </div>
        </div>
      )}
    </PixelFrame>
  );
}

export function Store() {
  const { ownedCosmeticIds, currencyBalance, loading, purchase } = useStore();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const filtered =
    activeCategory === 'all'
      ? COSMETICS
      : COSMETICS.filter(c => c.category === activeCategory);

  const handlePurchase = async (cosmetic: CosmeticDef) => {
    const success = await purchase(cosmetic.id, cosmetic.price);
    if (success) {
      setPurchaseMessage(`You bought ${cosmetic.name}!`);
    } else {
      setPurchaseMessage('Purchase failed. Please try again.');
    }
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-[24px] mb-3 animate-bounce">🏪</div>
        <p className="text-pixel-base text-theme-text-muted">Loading store...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-pixel-xl">Cosmetic Store</h2>

      {/* Currency balance */}
      <PixelFrame className="text-center bg-[#fffbe6]">
        <div className="text-pixel-base text-theme-text-muted mb-1">Your Balance</div>
        <div className="text-[20px] font-bold text-theme-success">
          {formatPrice(currencyBalance)}
        </div>
      </PixelFrame>

      {/* Purchase toast */}
      {purchaseMessage && (
        <PixelFrame className="text-center bg-theme-surface">
          <p className="text-pixel-base">{purchaseMessage}</p>
        </PixelFrame>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
          <PixelButton
            key={cat}
            size="sm"
            variant={activeCategory === cat ? 'primary' : 'secondary'}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABELS[cat]}
          </PixelButton>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(cosmetic => (
          <CosmeticItem
            key={cosmetic.id}
            cosmetic={cosmetic}
            owned={ownedCosmeticIds.has(cosmetic.id)}
            canAfford={currencyBalance >= cosmetic.price}
            onBuy={handlePurchase}
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <PixelFrame className="text-center">
          <p className="text-pixel-base text-theme-text-muted">No items in this category.</p>
        </PixelFrame>
      )}
    </div>
  );
}
