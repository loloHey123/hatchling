import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARE_ITEMS, CARE_CATEGORY_LABELS, CARE_CATEGORY_ICONS, type CareCategory } from '../data/creatureCare';
import { useStore } from '../hooks/useStore';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { AnimatedPage } from '../components/AnimatedPage';

type Category = 'all' | CareCategory;

function formatPrice(cents: number): string {
  return `${cents} coins`;
}

function CareItemCard({
  item,
  canAfford,
  onBuy,
}: {
  item: typeof CARE_ITEMS[number];
  canAfford: boolean;
  onBuy: (item: typeof CARE_ITEMS[number]) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const handleBuy = async () => {
    setPurchasing(true);
    onBuy(item);
    setTimeout(() => {
      setConfirming(false);
      setPurchasing(false);
    }, 1000);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15 }}
    >
      <PixelFrame className="flex flex-col items-center text-center h-full">
        {/* Item icon */}
        <motion.div
          className="w-14 h-14 rounded-xl bg-theme-bg flex items-center justify-center text-[28px] mb-2 border border-theme-border"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          {item.icon}
        </motion.div>

        <div className="text-sm font-bold font-body mb-0.5">{item.name}</div>
        <div className="text-xs text-theme-text-muted mb-2 min-h-[32px] font-body">{item.description}</div>

        {/* Happiness hearts */}
        <div className="flex gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-xs ${i < item.happinessBoost ? 'opacity-100' : 'opacity-20'}`}>
              ❤️
            </span>
          ))}
        </div>

        <div className={`text-xs font-bold mb-2 font-body ${canAfford ? 'text-theme-warning' : 'text-theme-text-muted'}`}>
          {formatPrice(item.price)}
        </div>

        <AnimatePresence mode="wait">
          {!confirming ? (
            <motion.div key="buy" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PixelButton
                size="sm"
                variant={canAfford ? 'primary' : 'secondary'}
                disabled={!canAfford}
                onClick={() => setConfirming(true)}
              >
                {canAfford ? 'Buy' : 'Not enough'}
              </PixelButton>
            </motion.div>
          ) : (
            <motion.div key="confirm" className="space-y-1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-xs text-theme-danger font-bold font-body">Buy this?</div>
              <div className="flex gap-2">
                <PixelButton size="sm" variant="primary" disabled={purchasing} onClick={handleBuy}>
                  {purchasing ? '...' : 'Yes'}
                </PixelButton>
                <PixelButton size="sm" variant="secondary" onClick={() => setConfirming(false)}>
                  No
                </PixelButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PixelFrame>
    </motion.div>
  );
}

export function Store() {
  const { currencyBalance, loading } = useStore();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  const filtered =
    activeCategory === 'all'
      ? CARE_ITEMS
      : CARE_ITEMS.filter(c => c.category === activeCategory);

  const handlePurchase = async (item: typeof CARE_ITEMS[number]) => {
    // For now, just show what they selected — actual purchase hooks into creature care
    setPurchaseMessage(`${item.icon} ${item.name} purchased! Use it on a creature from their detail page.`);
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          className="text-[32px] mb-3"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🏪
        </motion.div>
        <p className="text-sm text-theme-text-muted font-body">Loading store...</p>
      </div>
    );
  }

  const categories: Category[] = ['all', 'food', 'toy', 'clothing', 'shelter'];

  return (
    <AnimatedPage className="space-y-5">
      <h2 className="text-pixel-xl font-pixel">Creature Shop</h2>

      {/* Currency balance */}
      <PixelFrame className="text-center">
        <div className="text-xs text-theme-text-muted font-body mb-1">Your Balance</div>
        <div className="text-xl font-bold text-theme-warning font-body">
          🪙 {currencyBalance} coins
        </div>
      </PixelFrame>

      {/* Purchase toast */}
      <AnimatePresence>
        {purchaseMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PixelFrame className="text-center">
              <p className="text-sm font-body">{purchaseMessage}</p>
            </PixelFrame>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <PixelButton
            key={cat}
            size="sm"
            variant={activeCategory === cat ? 'primary' : 'secondary'}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? 'All Items' : `${CARE_CATEGORY_ICONS[cat]} ${CARE_CATEGORY_LABELS[cat]}`}
          </PixelButton>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <CareItemCard
              item={item}
              canAfford={currencyBalance >= item.price}
              onBuy={handlePurchase}
            />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <PixelFrame className="text-center">
          <p className="text-sm text-theme-text-muted font-body">No items in this category.</p>
        </PixelFrame>
      )}
    </AnimatedPage>
  );
}
