import { useSavings } from '../hooks/useSavings';
import { useCreatures } from '../hooks/useCreatures';
import { useStreak } from '../hooks/useStreak';
import { PixelFrame } from '../components/PixelFrame';
import { ShareCard } from '../components/ShareCard';
import { TOTAL_CREATURES } from '../data/creatures';

export function Stats() {
  const { totalSaved, weekSaved, monthSaved, yearSaved, savingsLog } = useSavings();
  const { ownedCreatures } = useCreatures();
  const { currentStreak, bestStreak } = useStreak();

  const uniqueOwned = new Set(ownedCreatures.map(c => c.creature_id)).size;

  return (
    <div className="space-y-6">
      <h2 className="text-[16px]">📊 Your Stats</h2>

      {/* Savings summary grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'This Week', amount: weekSaved },
          { label: 'This Month', amount: monthSaved },
          { label: 'This Year', amount: yearSaved },
          { label: 'All Time', amount: totalSaved },
        ].map(({ label, amount }) => (
          <PixelFrame key={label} className="text-center">
            <div className="text-[7px] text-[#888]">{label}</div>
            <div className="text-[14px] sm:text-[16px] font-bold text-[#78c850] mt-2">
              ${(amount / 100).toFixed(0)}
            </div>
          </PixelFrame>
        ))}
      </div>

      {/* Streak and collection stats */}
      <div className="grid grid-cols-3 gap-4">
        <PixelFrame className="text-center">
          <div className="text-[18px]">🔥</div>
          <div className="text-[14px] font-bold mt-1">{currentStreak}</div>
          <div className="text-[7px] text-[#888]">Current Streak</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">⭐</div>
          <div className="text-[14px] font-bold mt-1">{bestStreak}</div>
          <div className="text-[7px] text-[#888]">Best Streak</div>
        </PixelFrame>
        <PixelFrame className="text-center">
          <div className="text-[18px]">📖</div>
          <div className="text-[14px] font-bold mt-1">{uniqueOwned}/{TOTAL_CREATURES}</div>
          <div className="text-[7px] text-[#888]">Pokédex</div>
        </PixelFrame>
      </div>

      {/* Recent savings log */}
      <PixelFrame>
        <h3 className="text-[10px] mb-3">Recent Saves</h3>
        {savingsLog.length === 0 ? (
          <p className="text-[8px] text-[#888]">No savings yet. Resist a purchase to get started!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {savingsLog.slice(0, 20).map(entry => (
              <div key={entry.id} className="flex justify-between items-center text-[8px] border-b border-[#eee] pb-1">
                <div className="min-w-0 flex-1">
                  <span className="truncate block max-w-[200px]">{entry.product_name}</span>
                  <span className="text-[6px] text-[#aaa]">{new Date(entry.saved_at).toLocaleDateString()}</span>
                </div>
                <span className="text-[#78c850] font-bold ml-2 whitespace-nowrap">
                  +${(entry.amount_saved / 100).toFixed(2)}
                </span>
              </div>
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
    </div>
  );
}
