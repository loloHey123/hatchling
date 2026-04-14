import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuests, type ActiveQuest } from '../hooks/useQuests';
import { useCreatures } from '../hooks/useCreatures';
import { useXP } from '../hooks/useXP';
import { QUESTS, QUEST_MAP } from '../data/quests';
import { CREATURES } from '../data/creatures';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { AnimatedPage } from '../components/AnimatedPage';

function QuestTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Complete!');
        setDone(true);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <span className={`text-sm font-bold font-body ${done ? 'text-theme-success' : 'text-theme-text-muted'}`}>
      {timeLeft}
    </span>
  );
}

export function Quests() {
  const { activeQuests, completedCount, loading, startQuest, claimRewards } = useQuests();
  const { ownedCreatures } = useCreatures();
  const { level } = useXP();

  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Creature instances not on a quest
  const busyCreatureIds = new Set(
    activeQuests
      .filter(q => !q.rewards_claimed)
      .map(q => q.creature_instance_id)
  );
  const availableCreatures = ownedCreatures.filter(c => !busyCreatureIds.has(c.id));

  const selectedQuest = selectedQuestId ? QUEST_MAP.get(selectedQuestId) : null;

  const handleStartQuest = async () => {
    if (!selectedQuestId || !selectedCreatureId || !selectedQuest) return;
    const creature = ownedCreatures.find(c => c.id === selectedCreatureId);
    if (!creature) return;

    const result = await startQuest(
      selectedQuestId,
      selectedCreatureId,
      creature.creature_id,
      selectedQuest.durationHours,
    );
    if (result) {
      setMessage(`Quest started! Your creature is on a ${selectedQuest.name} expedition.`);
      setSelectedQuestId(null);
      setSelectedCreatureId(null);
    } else {
      setMessage('Failed to start quest.');
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleClaim = async (quest: ActiveQuest) => {
    const questDef = QUEST_MAP.get(quest.quest_id);
    const success = await claimRewards(quest.id);
    if (success && questDef) {
      setMessage(`Quest complete! Earned ${questDef.currencyReward} coins and ${questDef.xpReward} XP${quest.bonus_triggered ? ' + bonus reward!' : '!'}`);
    }
    setTimeout(() => setMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          className="text-[32px] mb-3"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ⚔️
        </motion.div>
        <p className="text-sm text-theme-text-muted font-body">Loading quests...</p>
      </div>
    );
  }

  // Time check for quest completion
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatedPage className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-pixel-xl font-pixel">Creature Quests</h2>
        <span className="text-xs text-theme-text-muted font-body">{completedCount} completed</span>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PixelFrame className="text-center">
              <p className="text-sm font-body">{message}</p>
            </PixelFrame>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active quests */}
      {activeQuests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold font-body">Active Expeditions</h3>
          {activeQuests.map((quest, i) => {
            const questDef = QUEST_MAP.get(quest.quest_id);
            const creatureDef = CREATURES.find(c => c.id === quest.creature_id);
            const isDone = new Date(quest.ends_at).getTime() <= now;
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PixelFrame className={`flex items-center gap-3 ${isDone ? 'border-theme-success/40 glow-success' : ''}`}>
                  <div className="text-2xl">{questDef?.icon || '⚔️'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold font-body">{questDef?.name || 'Quest'}</div>
                    <div className="text-xs text-theme-text-muted font-body">
                      {creatureDef?.name || 'Unknown'} is exploring...
                    </div>
                    <QuestTimer endsAt={quest.ends_at} />
                  </div>
                  {isDone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                    >
                      <PixelButton size="sm" onClick={() => handleClaim(quest)}>
                        Claim!
                      </PixelButton>
                    </motion.div>
                  )}
                </PixelFrame>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Available quests */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold font-body">Available Quests</h3>
        {QUESTS.map((quest, i) => {
          const canStart = level >= quest.minLevel;
          const isSelected = selectedQuestId === quest.id;
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <PixelFrame
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-theme-accent glow-accent' : ''
                } ${!canStart ? 'opacity-40' : ''}`}
              >
                <button
                  className="w-full text-left flex items-center gap-3 bg-transparent border-none cursor-pointer p-0"
                  onClick={() => canStart && setSelectedQuestId(isSelected ? null : quest.id)}
                  disabled={!canStart}
                >
                  <div className="text-2xl flex-shrink-0">{quest.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-body text-theme-text">{quest.name}</span>
                      {!canStart && (
                        <span className="text-[10px] bg-theme-border text-theme-text-muted px-1.5 py-0.5 rounded-badge font-body">
                          Lv.{quest.minLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-theme-text-muted font-body mt-0.5">{quest.description}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-theme-text-muted font-body">⏱️ {quest.durationHours}h</span>
                      <span className="text-[10px] text-theme-accent font-body font-bold">+{quest.xpReward} XP</span>
                      <span className="text-[10px] text-theme-warning font-body font-bold">+{quest.currencyReward} 🪙</span>
                    </div>
                  </div>
                </button>

                {/* Creature selector when quest is selected */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      className="mt-3 pt-3 border-t border-theme-border"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <p className="text-xs font-bold font-body mb-2 text-theme-text-muted">Choose a creature to send:</p>
                      {availableCreatures.length === 0 ? (
                        <p className="text-xs text-theme-text-muted font-body">No available creatures (all on quests or none owned).</p>
                      ) : (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {availableCreatures.slice(0, 8).map(c => {
                            const def = CREATURES.find(cr => cr.id === c.creature_id);
                            const isChosen = selectedCreatureId === c.id;
                            return (
                              <motion.button
                                key={c.id}
                                className={`px-2 py-1.5 border-2 rounded-button text-xs font-body font-semibold cursor-pointer transition-all bg-transparent ${
                                  isChosen ? 'border-theme-accent bg-theme-accent/10 text-theme-accent' : 'border-theme-border text-theme-text hover:border-theme-text-muted'
                                }`}
                                onClick={() => setSelectedCreatureId(c.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {c.nickname || def?.name || `#${c.creature_id}`}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                      <PixelButton
                        size="sm"
                        disabled={!selectedCreatureId}
                        onClick={handleStartQuest}
                      >
                        Send on Quest!
                      </PixelButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </PixelFrame>
            </motion.div>
          );
        })}
      </div>
    </AnimatedPage>
  );
}
