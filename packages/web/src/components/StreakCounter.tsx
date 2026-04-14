import { PixelFrame } from './PixelFrame';

export function StreakCounter({ current, best }: { current: number; best: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PixelFrame className="text-center">
        <div className="text-pixel-xl">🔥</div>
        <div className="text-pixel-lg font-bold mt-1">{current}</div>
        <div className="text-pixel-xs text-theme-text-muted mt-1">Streak</div>
      </PixelFrame>
      <PixelFrame className="text-center">
        <div className="text-pixel-xl">⭐</div>
        <div className="text-pixel-lg font-bold mt-1">{best}</div>
        <div className="text-pixel-xs text-theme-text-muted mt-1">Best</div>
      </PixelFrame>
    </div>
  );
}
