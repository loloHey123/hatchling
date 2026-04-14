import { PixelFrame } from './PixelFrame';

export function SavingsCounter({ amount, label }: { amount: number; label: string }) {
  return (
    <PixelFrame className="text-center">
      <div className="text-pixel-xl">💰</div>
      <div className="text-pixel-lg font-bold text-theme-accent mt-1">
        ${(amount / 100).toFixed(0)}
      </div>
      <div className="text-pixel-xs text-theme-text-muted mt-1">{label}</div>
    </PixelFrame>
  );
}
