import { useState, useEffect } from 'react';
import { useEggs } from '../hooks/useEggs';
import { useTokens } from '../hooks/useTokens';
import { useSavings } from '../hooks/useSavings';
import { useStreak } from '../hooks/useStreak';
import { EggCard } from '../components/EggCard';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/* ── Onboarding wizard (shown once for new users) ── */
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
      body: 'Resist impulse buys, earn tokens, pull the gacha machine, and hatch mystery creatures. Happy collecting!',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <PixelFrame className="max-w-sm w-full text-center">
        <div className="text-[36px] mb-3">{current.icon}</div>
        <h3 className="font-pixel text-pixel-lg text-theme-text mb-3">{current.title}</h3>
        <p className="font-pixel text-pixel-sm text-theme-text-muted leading-relaxed mb-4">{current.body}</p>

        {/* progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full border-2 border-theme-border ${
                i === step ? 'bg-theme-success' : 'bg-theme-bg'
              }`}
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
          className="font-pixel text-pixel-xs text-theme-text-muted hover:text-theme-text-muted mt-3 bg-transparent border-none cursor-pointer"
        >
          Skip
        </button>
      </PixelFrame>
    </div>
  );
}

export function Dashboard() {
  const { eggs } = useEggs();
  const { unusedCount: tokenCount } = useTokens();
  const { totalSaved } = useSavings();
  const { currentStreak, bestStreak } = useStreak();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding for new users (no eggs, no tokens, not dismissed before)
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

  // Re-evaluate egg readiness every second so hatch button appears without reload
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const readyEggs = eggs.filter(e => new Date(e.incubation_end).getTime() <= now);
  const incubatingEggs = eggs.filter(e => new Date(e.incubation_end).getTime() > now);

  return (
    <div className="space-y-6">
      {showOnboarding && <OnboardingWizard onDismiss={() => setShowOnboarding(false)} />}
      <h2 className="text-pixel-xl">Welcome back, Trainer!</h2>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <PixelFrame className="text-center">
          <div className="text-[18px]">🪙</div>
          <div className="text-pixel-lg font-bold mt-1">{tokenCount}</div>
          <div className="text-pixel-xs text-theme-text-muted mt-1">Tokens</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">💰</div>
          <div className="text-pixel-lg font-bold text-theme-success mt-1">${(totalSaved / 100).toFixed(0)}</div>
          <div className="text-pixel-xs text-theme-text-muted mt-1">Saved</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">🔥</div>
          <div className="text-pixel-lg font-bold mt-1">{currentStreak}</div>
          <div className="text-pixel-xs text-theme-text-muted mt-1">Streak</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">⭐</div>
          <div className="text-pixel-lg font-bold mt-1">{bestStreak}</div>
          <div className="text-pixel-xs text-theme-text-muted mt-1">Best</div>
        </PixelFrame>
      </div>

      {/* Token CTA */}
      {tokenCount > 0 && (
        <PixelFrame className="text-center bg-theme-surface">
          <p className="text-pixel-base mb-3">
            You have {tokenCount} unused token{tokenCount > 1 ? 's' : ''}!
          </p>
          <PixelButton onClick={() => navigate('/gacha')}>
            Pull the Gacha Machine! 🎰
          </PixelButton>
        </PixelFrame>
      )}

      {/* Ready to hatch */}
      {readyEggs.length > 0 && (
        <div>
          <h3 className="text-pixel-base mb-3">🐣 Ready to Hatch!</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {readyEggs.map(egg => (
              <EggCard key={egg.id} egg={egg} onHatch={handleHatch} />
            ))}
          </div>
        </div>
      )}

      {/* Incubating */}
      {incubatingEggs.length > 0 && (
        <div>
          <h3 className="text-pixel-base mb-3">🥚 Incubating</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {incubatingEggs.map(egg => (
              <EggCard key={egg.id} egg={egg} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {eggs.length === 0 && (
        <PixelFrame className="text-center">
          <div className="text-[24px] mb-3">🥚</div>
          <p className="text-pixel-base mb-2">No eggs yet!</p>
          <p className="text-pixel-sm text-theme-text-muted">
            Install the browser extension and resist an impulse purchase to earn your first token.
          </p>
        </PixelFrame>
      )}
    </div>
  );
}
