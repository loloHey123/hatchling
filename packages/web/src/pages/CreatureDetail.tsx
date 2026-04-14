import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Rarity } from '@hatchling/shared';
import { RARITY_COLORS } from '@hatchling/shared';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { RarityBadge } from '../components/RarityBadge';
import { AnimatedPage } from '../components/AnimatedPage';
import { CREATURE_MAP } from '../data/creatures';
import { CARE_ITEMS, CARE_CATEGORY_LABELS, type CareCategory } from '../data/creatureCare';
import { useCreatures } from '../hooks/useCreatures';
import { useCreatureCare } from '../hooks/useCreatureCare';
import { useStore } from '../hooks/useStore';
import { supabase } from '../lib/supabase';

export function CreatureDetail() {
  const { creatureId } = useParams<{ creatureId: string }>();
  const navigate = useNavigate();
  const { ownedCreatures, loading, refetch } = useCreatures();
  const { feedOrPlay, recentInteraction } = useCreatureCare();
  const { currencyBalance, refetch: refetchStore } = useStore();

  const creatureDefId = Number(creatureId);
  const creatureDef = CREATURE_MAP.get(creatureDefId);

  const userInstances = useMemo(
    () => ownedCreatures.filter((uc) => uc.creature_id === creatureDefId),
    [ownedCreatures, creatureDefId]
  );

  const primaryInstance = userInstances[0] ?? null;
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [careMessage, setCareMessage] = useState<string | null>(null);
  const [careTab, setCareTab] = useState<CareCategory | 'all'>('all');

  useEffect(() => {
    if (primaryInstance?.nickname) setNickname(primaryInstance.nickname);
  }, [primaryInstance]);

  const hasNickname = !!primaryInstance?.nickname;
  const showInput = editing || !hasNickname;

  if (!creatureDef) {
    return (
      <AnimatedPage className="max-w-md mx-auto">
        <PixelFrame className="text-center py-6">
          <p className="text-sm text-theme-text-muted font-body">Creature not found.</p>
          <div className="mt-4">
            <PixelButton size="sm" onClick={() => navigate('/collection')}>Back to Collection</PixelButton>
          </div>
        </PixelFrame>
      </AnimatedPage>
    );
  }

  if (loading) {
    return (
      <AnimatedPage className="max-w-md mx-auto">
        <PixelFrame className="text-center py-6">
          <p className="text-sm text-theme-text-muted font-body">Loading...</p>
        </PixelFrame>
      </AnimatedPage>
    );
  }

  if (!primaryInstance) {
    return (
      <AnimatedPage className="max-w-md mx-auto">
        <PixelFrame className="text-center py-6">
          <p className="text-sm text-theme-text-muted font-body">You haven't collected this creature yet.</p>
          <div className="mt-4">
            <PixelButton size="sm" onClick={() => navigate('/collection')}>Back to Collection</PixelButton>
          </div>
        </PixelFrame>
      </AnimatedPage>
    );
  }

  const handleSaveNickname = async () => {
    if (!primaryInstance) return;
    setSaving(true);
    setSaved(false);
    await supabase.from('user_creatures').update({ nickname: nickname.trim() || null }).eq('id', primaryInstance.id);
    await refetch();
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCare = async (itemId: number) => {
    if (!primaryInstance) return;
    const result = await feedOrPlay(itemId, primaryInstance.id, currencyBalance);
    setCareMessage(result.message);
    if (result.success) await refetchStore();
    setTimeout(() => setCareMessage(null), 3000);
  };

  const collectedDate = new Date(primaryInstance.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const rarityColor = RARITY_COLORS[creatureDef.rarity as Rarity];

  const filteredCareItems = careTab === 'all' ? CARE_ITEMS : CARE_ITEMS.filter(i => i.category === careTab);

  return (
    <AnimatedPage className="max-w-md mx-auto space-y-4">
      <PixelButton size="sm" variant="secondary" onClick={() => navigate('/collection')}>
        &larr; Back
      </PixelButton>

      <PixelFrame>
        {/* Creature display */}
        <div className="flex justify-center mb-4 relative">
          <motion.div
            className="w-32 h-32 rounded-xl border-2 border-theme-border flex items-center justify-center text-white font-pixel text-[28px] shadow-soft-lg"
            style={{ backgroundColor: rarityColor + '50', imageRendering: 'pixelated' }}
            whileHover={{ scale: 1.05 }}
            animate={recentInteraction ? {
              y: [0, -8, 0, -4, 0],
              transition: { duration: 0.6 }
            } : {}}
          >
            {creatureDef.name[0]}
          </motion.div>

          {/* Care animation overlay */}
          <AnimatePresence>
            {recentInteraction && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {recentInteraction.animation === 'hearts' && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-lg"
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{
                          opacity: [0, 1, 0],
                          y: -40 - Math.random() * 30,
                          x: (Math.random() - 0.5) * 60,
                          scale: [0.5, 1.2, 0],
                        }}
                        transition={{ duration: 1.2, delay: i * 0.15 }}
                      >
                        ❤️
                      </motion.span>
                    ))}
                  </>
                )}
                {recentInteraction.animation === 'sparkle' && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-lg"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                          x: Math.cos((i / 6) * Math.PI * 2) * 50,
                          y: Math.sin((i / 6) * Math.PI * 2) * 50,
                        }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      >
                        ✨
                      </motion.span>
                    ))}
                  </>
                )}
                {recentInteraction.animation === 'confetti' && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-sm"
                        initial={{ opacity: 0, y: 0, rotate: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          y: -60 - Math.random() * 40,
                          x: (Math.random() - 0.5) * 80,
                          rotate: Math.random() * 360,
                        }}
                        transition={{ duration: 1.5, delay: i * 0.08 }}
                      >
                        {['🎉', '🎊', '⭐', '💫'][i % 4]}
                      </motion.span>
                    ))}
                  </>
                )}
                {recentInteraction.animation === 'bounce' && (
                  <motion.span
                    className="absolute text-2xl"
                    animate={{
                      y: [0, -30, 0, -15, 0],
                      scale: [1, 1.3, 1, 1.15, 1],
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    ⚡
                  </motion.span>
                )}
                {recentInteraction.animation === 'spin' && (
                  <motion.span
                    className="absolute text-2xl"
                    animate={{ rotate: 720, scale: [0, 1.5, 0] }}
                    transition={{ duration: 1.2 }}
                  >
                    🌟
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Name and rarity */}
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold font-body mb-1">
            {primaryInstance?.nickname || creatureDef.name}
          </h2>
          {primaryInstance?.nickname && (
            <div className="text-xs text-theme-text-muted font-body mb-1">{creatureDef.name}</div>
          )}
          <RarityBadge rarity={creatureDef.rarity as Rarity} />
          {creatureDef.safariOnly && (
            <span className="ml-2 text-xs text-theme-success font-body font-bold">Safari Exclusive</span>
          )}
        </div>

        <p className="text-sm text-theme-text-muted font-body text-center mb-4 leading-relaxed">
          {creatureDef.description}
        </p>

        {/* Details */}
        <div className="border-t border-theme-border pt-3 mb-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-body">
            <div>
              <span className="text-theme-text-muted">Found via:</span>
              <span className="ml-1 font-bold capitalize">{primaryInstance.found_via}</span>
            </div>
            <div>
              <span className="text-theme-text-muted">Collected:</span>
              <span className="ml-1 font-bold">{collectedDate}</span>
            </div>
            <div>
              <span className="text-theme-text-muted">Copies:</span>
              <span className="ml-1 font-bold">{userInstances.length}</span>
            </div>
            <div>
              <span className="text-theme-text-muted">ID:</span>
              <span className="ml-1 font-bold">#{String(creatureDef.id).padStart(3, '0')}</span>
            </div>
          </div>
        </div>

        {/* Nickname */}
        <div className="border-t border-theme-border pt-3">
          <label className="block text-xs font-body font-bold text-theme-text-muted mb-1">Nickname</label>
          {showInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Give it a nickname..."
                maxLength={20}
                className="flex-1 text-sm font-body border-2 border-theme-border px-2.5 py-1.5 bg-theme-bg rounded-button outline-none focus:border-theme-accent transition-colors"
                autoFocus={editing}
              />
              <PixelButton size="sm" onClick={handleSaveNickname} disabled={saving}>
                {saving ? '...' : 'Save'}
              </PixelButton>
              {hasNickname && (
                <PixelButton size="sm" variant="secondary" onClick={() => { setEditing(false); setNickname(primaryInstance?.nickname || ''); }}>
                  Cancel
                </PixelButton>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-body font-bold">{primaryInstance?.nickname}</span>
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-theme-text-muted hover:text-theme-text bg-transparent border-none cursor-pointer transition-colors"
              >
                ✏️
              </button>
            </div>
          )}
          {saved && (
            <motion.div
              className="text-xs text-theme-success font-body font-bold mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Nickname saved!
            </motion.div>
          )}
        </div>
      </PixelFrame>

      {/* Creature Care Section */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-3">Care for {primaryInstance?.nickname || creatureDef.name}</h3>
        <p className="text-xs text-theme-text-muted font-body mb-3">
          Feed, play with, or give items to your creature! Balance: <span className="text-theme-warning font-bold">🪙 {currencyBalance}</span>
        </p>

        <AnimatePresence>
          {careMessage && (
            <motion.div
              className="mb-3 p-2 rounded-button bg-theme-success/10 border border-theme-success/30"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-xs font-body text-theme-success font-bold">{careMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Care category tabs */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(['all', 'food', 'toy', 'clothing', 'shelter'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCareTab(tab)}
              className={`text-xs px-2 py-1 rounded-button font-body font-semibold cursor-pointer transition-all border-2 ${
                careTab === tab
                  ? 'bg-theme-accent text-white border-transparent'
                  : 'bg-transparent text-theme-text-muted border-theme-border hover:border-theme-text-muted'
              }`}
            >
              {tab === 'all' ? 'All' : CARE_CATEGORY_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Care items grid */}
        <div className="grid grid-cols-3 gap-2">
          {filteredCareItems.slice(0, 9).map(item => {
            const canAfford = currencyBalance >= item.price;
            return (
              <motion.button
                key={item.id}
                className={`p-2 rounded-card border-2 text-center cursor-pointer transition-all ${
                  canAfford
                    ? 'border-theme-border bg-theme-bg hover:border-theme-accent'
                    : 'border-theme-border bg-theme-bg opacity-40 cursor-not-allowed'
                }`}
                onClick={() => canAfford && handleCare(item.id)}
                whileHover={canAfford ? { scale: 1.05 } : {}}
                whileTap={canAfford ? { scale: 0.95 } : {}}
                disabled={!canAfford}
              >
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-[10px] font-body font-bold truncate">{item.name}</div>
                <div className="text-[10px] text-theme-warning font-body">{item.price} 🪙</div>
                <div className="flex justify-center gap-px mt-0.5">
                  {Array.from({ length: item.happinessBoost }).map((_, i) => (
                    <span key={i} className="text-[8px]">❤️</span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </PixelFrame>
    </AnimatedPage>
  );
}
