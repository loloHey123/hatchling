import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEggs } from '../hooks/useEggs';
import { useTokens } from '../hooks/useTokens';
import { useSavings } from '../hooks/useSavings';
import { useStreak } from '../hooks/useStreak';
import { useXP } from '../hooks/useXP';
import { useAchievements } from '../hooks/useAchievements';
import { useQuests } from '../hooks/useQuests';
import { EggCard } from '../components/EggCard';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { XPBar } from '../components/XPBar';
import { StatCard } from '../components/StatCard';
import { AnimatedPage } from '../components/AnimatedPage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MILESTONES } from '../data/milestones';

/* Onboarding wizard */
const ONBOARDING_KEY = 'hatchling_onboarding_complete';

function OnboardingWizard({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: '🐣',
      title: 'Welcome to Hatchling!',
      body: 'You are about to embark on a journey to turn impulse purchases into adorable pixel creatures. Let us get you set up!',
    },
    {
      icon: '🎯',
      title: 'Set Your Threshold',
      body: 'Head to Settings to set your impulse purchase threshold. The extension will detect purchases above this amount and give you a chance to delay.',
    },
    {
      icon: '🧩',
      title: 'Install the Extension',
      body: 'Install the Hatchling browser extension from the Chrome Web Store (coming soon). It watches for impulse purchases on popular shopping sites.',
    },
    {
      icon: '🚀',
      title: "You're Ready!",
      body: 'Resist impulse buys, earn tokens, hatch creatures, send them on quests, and unlock achievements. Happy collecting!',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      onDismiss();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
      >
        <PixelFrame className="max-w-sm w-full text-center">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-[40px] mb-3">{current.icon}</div>
            <h3 className="font-pixel text-pixel-lg text-theme-text mb-3">{current.title}</h3>
            <p className="font-body text-sm text-theme-text-muted leading-relaxed mb-4">{current.body}</p>
          </motion.div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-theme-accent' : 'bg-theme-border'}`}
                animate={{ scale: i === step ? 1.3 : 1 }}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            {step > 0 && (
              <PixelButton variant="secondary" size="sm" onClick={() => setStep(step - 1)}>
                Back
              </PixelButton>
            )}
            <PixelButton size="sm" onClick={handleNext}>
              {isLast ? "Let's Go!" : 'Next'}
            </PixelButton>
          </div>

          <button
            onClick={() => { localStorage.setItem(ONBOARDING_KEY, 'true'); onDismiss(); }}
            className="font-body text-xs text-theme-text-muted hover:text-theme-text mt-3 bg-transparent border-none cursor-pointer transition-colors"
          >
            Skip
          </button>
        </PixelFrame>
      </motion.div>
    </div>
  );
}

export function Dashboard() {
  const { eggs } = useEggs();
  const { unusedCount: tokenCount } = useTokens();
  const { totalSaved } = useSavings();
  const { currentStreak, bestStreak } = useStreak();
  const { level, title, currentLevelXP, nextLevelXP, progress, totalXP } = useXP();
  const { stats: achievementStats } = useAchievements();
  const { activeQuests } = useQuests();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const alreadyDone = localStorage.getItem(ONBOARDING_KEY) === 'true';
    if (!alreadyDone && eggs.length === 0 && tokenCount === 0) {
      setShowOnboarding(true);
    }
  }, [eggs.length, tokenCount]);

  const handleHatch = async (eggId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'}/functions/v1/hatch-egg`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ eggId }),
        }
      );
      const result = await res.json();
      if (result.creature) {
        navigate(`/collection/${result.creature.creature_id}`);
      }
    } catch (err) {
      console.error('Failed to hatch egg:', err);
    }
  };

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const readyEggs = eggs.filter(e => new Date(e.incubation_end).getTime() <= now);
  const incubatingEggs = eggs.filter(e => new Date(e.incubation_end).getTime() > now);

  // Next milestone
  const nextMilestone = MILESTONES.find(m => totalSaved < m.amountCents);

  // Active quests count
  const activeQuestCount = activeQuests.filter(q => !q.completed).length;

  return (
    <AnimatedPage className="space-y-5">
      {showOnboarding && <OnboardingWizard onDismiss={() => setShowOnboarding(false)} />}

      <div className="flex items-baseline justify-between">
        <h2 className="text-pixel-xl font-pixel">Welcome back!</h2>
        <span className="text-xs text-theme-text-muted font-body">Lv. {level} {title}</span>
      </div>

      {/* XP Bar */}
      <XPBar
        level={level}
        title={title}
        currentLevelXP={currentLevelXP}
        nextLevelXP={nextLevelXP}
        progress={progress}
        totalXP={totalXP}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="🪙" value={tokenCount} label="Tokens" delay={0} />
        <StatCard icon="💰" value={`$${(totalSaved / 100).toFixed(0)}`} label="Saved" color="var(--color-success)" delay={0.05} />
        <StatCard icon="🔥" value={currentStreak} label="Streak" delay={0.1} />
        <StatCard icon="🏆" value={`${achievementStats.unlocked}/${achievementStats.total}`} label="Badges" delay={0.15} />
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tokenCount > 0 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PixelFrame className="text-center cursor-pointer hover:border-theme-accent transition-colors" onClick={() => navigate('/gacha')}>
              <div className="text-xl mb-1">🎰</div>
              <p className="text-sm font-bold font-body">{tokenCount} token{tokenCount > 1 ? 's' : ''}</p>
              <p className="text-xs text-theme-accent font-body">Pull the Gacha!</p>
            </PixelFrame>
          </motion.div>
        )}
        {activeQuestCount > 0 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PixelFrame className="text-center cursor-pointer hover:border-theme-accent-secondary transition-colors" onClick={() => navigate('/quests')}>
              <div className="text-xl mb-1">⚔️</div>
              <p className="text-sm font-bold font-body">{activeQuestCount} active</p>
              <p className="text-xs text-theme-accent-secondary font-body">View Quests</p>
            </PixelFrame>
          </motion.div>
        )}
        {nextMilestone && (
          <PixelFrame className="text-center">
            <div className="text-xl mb-1">{nextMilestone.icon}</div>
            <p className="text-xs font-body text-theme-text-muted">Next milestone</p>
            <p className="text-sm font-bold font-body text-theme-success">{nextMilestone.label}</p>
            <div className="w-full h-1.5 bg-theme-bg rounded-full mt-1.5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-theme-success"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalSaved / nextMilestone.amountCents) * 100, 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </PixelFrame>
        )}
      </div>

      {/* Ready to hatch */}
      <AnimatePresence>
        {readyEggs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-sm font-bold font-body mb-3 flex items-center gap-2">
              <span>🐣</span> Ready to Hatch!
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {readyEggs.map(egg => (
                <EggCard key={egg.id} egg={egg} onHatch={handleHatch} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incubating */}
      {incubatingEggs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold font-body mb-3 flex items-center gap-2">
            <span>🥚</span> Incubating
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {incubatingEggs.map((egg, i) => (
              <motion.div
                key={egg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <EggCard egg={egg} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {eggs.length === 0 && tokenCount === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PixelFrame className="text-center py-8">
            <div className="text-[40px] mb-3 animate-float">🥚</div>
            <p className="text-base font-bold font-body mb-2">No eggs yet!</p>
            <p className="text-sm text-theme-text-muted font-body max-w-xs mx-auto">
              Install the browser extension and resist an impulse purchase to earn your first token.
            </p>
          </PixelFrame>
        </motion.div>
      )}
    </AnimatedPage>
  );
}
