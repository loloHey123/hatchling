import { motion } from 'framer-motion';

interface XPBarProps {
  level: number;
  title: string;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
  totalXP: number;
}

export function XPBar({ level, title, currentLevelXP, nextLevelXP, progress, totalXP }: XPBarProps) {
  return (
    <div className="bg-theme-surface border-2 border-theme-border rounded-panel p-3 shadow-soft-md">
      <div className="flex items-center gap-3 mb-2">
        {/* Level badge */}
        <motion.div
          className="w-12 h-12 rounded-full bg-theme-accent/20 border-2 border-theme-accent flex items-center justify-center flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-pixel-lg font-pixel text-theme-accent">{level}</span>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm font-bold font-body text-theme-text truncate">{title}</span>
            <span className="text-xs text-theme-text-muted font-body ml-2 flex-shrink-0">
              {totalXP} XP
            </span>
          </div>

          {/* XP Progress bar */}
          <div className="w-full h-3 bg-theme-bg rounded-full border border-theme-border overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-secondary))',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between mt-0.5">
            <span className="text-[10px] text-theme-text-muted font-body">
              {currentLevelXP} / {nextLevelXP} XP
            </span>
            <span className="text-[10px] text-theme-text-muted font-body">
              Lv. {level + 1}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
