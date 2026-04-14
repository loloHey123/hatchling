import { PixelFrame } from './PixelFrame';

export function StreakCounter({ current, best }: { current: number; best: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PixelFrame className="text-center">
        <div className="text-2xl mb-1">🔥</div>
        <div className="text-xl font-bold font-body">{current}</div>
        <div className="text-xs text-theme-text-muted font-body mt-0.5">Streak</div>
      </PixelFrame>
      <PixelFrame className="text-center">
        <div className="text-2xl mb-1">⭐</div>
        <div className="text-xl font-bold font-body">{best}</div>
        <div className="text-xs text-theme-text-muted font-body mt-0.5">Best</div>
      </PixelFrame>
    </div>
  );
}
