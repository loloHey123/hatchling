import { useEggs } from '../hooks/useEggs';
import { useTokens } from '../hooks/useTokens';
import { useSavings } from '../hooks/useSavings';
import { useStreak } from '../hooks/useStreak';
import { EggCard } from '../components/EggCard';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const { eggs } = useEggs();
  const { unusedCount: tokenCount } = useTokens();
  const { totalSaved } = useSavings();
  const { currentStreak, bestStreak } = useStreak();
  const navigate = useNavigate();

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

  const readyEggs = eggs.filter(e => new Date(e.incubation_end) <= new Date());
  const incubatingEggs = eggs.filter(e => new Date(e.incubation_end) > new Date());

  return (
    <div className="space-y-6">
      <h2 className="text-[16px]">Welcome back, Trainer!</h2>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <PixelFrame className="text-center">
          <div className="text-[18px]">🪙</div>
          <div className="text-[14px] font-bold mt-1">{tokenCount}</div>
          <div className="text-[7px] text-[#888] mt-1">Tokens</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">💰</div>
          <div className="text-[12px] font-bold text-[#78c850] mt-1">${(totalSaved / 100).toFixed(0)}</div>
          <div className="text-[7px] text-[#888] mt-1">Saved</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">🔥</div>
          <div className="text-[14px] font-bold mt-1">{currentStreak}</div>
          <div className="text-[7px] text-[#888] mt-1">Streak</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">⭐</div>
          <div className="text-[14px] font-bold mt-1">{bestStreak}</div>
          <div className="text-[7px] text-[#888] mt-1">Best</div>
        </PixelFrame>
      </div>

      {/* Token CTA */}
      {tokenCount > 0 && (
        <PixelFrame className="text-center bg-[#e8f5d4]">
          <p className="text-[10px] mb-3">
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
          <h3 className="text-[11px] mb-3">🐣 Ready to Hatch!</h3>
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
          <h3 className="text-[11px] mb-3">🥚 Incubating</h3>
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
          <p className="text-[10px] mb-2">No eggs yet!</p>
          <p className="text-[8px] text-[#888]">
            Install the browser extension and resist an impulse purchase to earn your first token.
          </p>
        </PixelFrame>
      )}
    </div>
  );
}
