import { motion } from 'framer-motion';
import { useSavings } from '../hooks/useSavings';
import { useCreatures } from '../hooks/useCreatures';
import { useStreak } from '../hooks/useStreak';
import { useXP } from '../hooks/useXP';
import { PixelFrame } from '../components/PixelFrame';
import { ShareCard } from '../components/ShareCard';
import { StatCard } from '../components/StatCard';
import { XPBar } from '../components/XPBar';
import { AnimatedPage } from '../components/AnimatedPage';
import { TOTAL_CREATURES } from '../data/creatures';
import { MILESTONES } from '../data/milestones';

export function Stats() {
  const { totalSaved, weekSaved, monthSaved, yearSaved, savingsLog } = useSavings();
  const { ownedCreatures } = useCreatures();
  const { currentStreak, bestStreak } = useStreak();
  const xp = useXP();

  const uniqueOwned = new Set(ownedCreatures.map(c => c.creature_id)).size;

  // Milestones reached
  const milestonesReached = MILESTONES.filter(m => totalSaved >= m.amountCents);

  return (
    <AnimatedPage className="space-y-5">
      <h2 className="text-pixel-xl font-pixel">Your Stats</h2>

      {/* XP Bar */}
      <XPBar {...xp} />

      {/* Savings summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'This Week', amount: weekSaved, delay: 0 },
          { label: 'This Month', amount: monthSaved, delay: 0.05 },
          { label: 'This Year', amount: yearSaved, delay: 0.1 },
          { label: 'All Time', amount: totalSaved, delay: 0.15 },
        ].map(({ label, amount, delay }) => (
          <StatCard
            key={label}
            icon="💰"
            value={`$${(amount / 100).toFixed(0)}`}
            label={label}
            color="var(--color-success)"
            delay={delay}
          />
        ))}
      </div>

      {/* Streak and collection */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="🔥" value={currentStreak} label="Current Streak" delay={0.05} />
        <StatCard icon="⭐" value={bestStreak} label="Best Streak" delay={0.1} />
        <StatCard icon="📖" value={`${uniqueOwned}/${TOTAL_CREATURES}`} label="Collection" delay={0.15} />
      </div>

      {/* Savings Milestones */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-3">Savings Milestones</h3>
        <div className="space-y-2">
          {MILESTONES.map((milestone, i) => {
            const reached = totalSaved >= milestone.amountCents;
            const progressPct = Math.min((totalSaved / milestone.amountCents) * 100, 100);
            return (
              <motion.div
                key={milestone.id}
                className={`flex items-center gap-3 p-2 rounded-button border-2 transition-colors ${
                  reached ? 'border-theme-success/30 bg-theme-success/5' : 'border-theme-border'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-xl">{milestone.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-bold font-body ${reached ? 'text-theme-success' : 'text-theme-text'}`}>
                      {milestone.label}
                    </span>
                    {reached && <span className="text-[10px] text-theme-success font-body">Reached!</span>}
                  </div>
                  <div className="w-full h-1.5 bg-theme-bg rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${reached ? 'bg-theme-success' : 'bg-theme-accent'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                    />
                  </div>
                </div>
                {milestone.bonusTokens > 0 && (
                  <span className="text-[10px] text-theme-warning font-body font-bold">+{milestone.bonusTokens} 🪙</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </PixelFrame>

      {/* Recent savings log */}
      <PixelFrame>
        <h3 className="text-sm font-bold font-body mb-3">Recent Saves</h3>
        {savingsLog.length === 0 ? (
          <p className="text-sm text-theme-text-muted font-body">No savings yet. Resist a purchase to get started!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {savingsLog.slice(0, 20).map((entry, i) => (
              <motion.div
                key={entry.id}
                className="flex justify-between items-center text-sm border-b border-theme-border pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="min-w-0 flex-1">
                  <span className="truncate block max-w-[200px] font-body font-semibold">{entry.product_name}</span>
                  <span className="text-xs text-theme-text-muted font-body">{new Date(entry.saved_at).toLocaleDateString()}</span>
                </div>
                <span className="text-theme-success font-bold ml-2 whitespace-nowrap font-body">
                  +${(entry.amount_saved / 100).toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </PixelFrame>

      {/* Share card */}
      <ShareCard
        totalSaved={totalSaved}
        creaturesCollected={uniqueOwned}
        totalCreatures={TOTAL_CREATURES}
        bestStreak={bestStreak}
      />
    </AnimatedPage>
  );
}
