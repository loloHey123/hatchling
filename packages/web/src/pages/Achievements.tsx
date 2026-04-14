import { motion } from 'framer-motion';
import { ACHIEVEMENTS, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/achievements';
import { useAchievements } from '../hooks/useAchievements';
import { PixelFrame } from '../components/PixelFrame';
import { AnimatedPage } from '../components/AnimatedPage';

export function Achievements() {
  const { isUnlocked, stats, unlockedList, loading } = useAchievements();

  const unlockedDates = new Map(unlockedList.map(a => [a.achievement_id, a.unlocked_at]));

  // Group achievements by category
  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))];

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          className="text-[32px] mb-3"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🏆
        </motion.div>
        <p className="text-sm text-theme-text-muted font-body">Loading achievements...</p>
      </div>
    );
  }

  return (
    <AnimatedPage className="space-y-5">
      <h2 className="text-pixel-xl font-pixel">Achievements</h2>

      {/* Progress */}
      <PixelFrame>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold font-body">Progress</span>
          <span className="text-sm font-bold font-body text-theme-accent">{stats.unlocked} / {stats.total}</span>
        </div>
        <div className="w-full h-3 bg-theme-bg rounded-full border border-theme-border overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-theme-accent"
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </PixelFrame>

      {/* Achievements by category */}
      {categories.map(category => (
        <div key={category} className="space-y-2">
          <h3
            className="text-sm font-bold font-body flex items-center gap-2"
            style={{ color: CATEGORY_COLORS[category] }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
            {CATEGORY_LABELS[category]}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACHIEVEMENTS.filter(a => a.category === category).map((achievement, i) => {
              const unlocked = isUnlocked(achievement.id);
              const unlockedAt = unlockedDates.get(achievement.id);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PixelFrame
                    className={`flex items-center gap-3 transition-all ${
                      unlocked
                        ? 'border-theme-success/30'
                        : 'opacity-60'
                    }`}
                  >
                    {/* Badge icon */}
                    <motion.div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                        unlocked ? 'bg-theme-success/15' : 'bg-theme-bg grayscale'
                      }`}
                      whileHover={unlocked ? { scale: 1.1, rotate: 5 } : {}}
                    >
                      {achievement.icon}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold font-body ${unlocked ? 'text-theme-text' : 'text-theme-text-muted'}`}>
                          {achievement.name}
                        </span>
                        {unlocked && (
                          <span className="text-[10px] bg-theme-success/20 text-theme-success px-1.5 py-0.5 rounded-badge font-body font-bold">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-theme-text-muted font-body mt-0.5">
                        {achievement.description}
                      </p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-theme-accent font-body font-bold">
                          +{achievement.xpReward} XP
                        </span>
                        <span className="text-[10px] text-theme-warning font-body font-bold">
                          +{achievement.currencyReward} coins
                        </span>
                      </div>
                      {unlocked && unlockedAt && (
                        <span className="text-[10px] text-theme-text-muted font-body">
                          {new Date(unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </PixelFrame>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </AnimatedPage>
  );
}
