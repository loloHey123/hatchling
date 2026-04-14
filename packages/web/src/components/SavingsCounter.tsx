import { PixelFrame } from './PixelFrame';

export function SavingsCounter({ amount, label }: { amount: number; label: string }) {
  return (
    <PixelFrame className="text-center">
      <div className="text-2xl mb-1">💰</div>
      <div className="text-xl font-bold text-theme-success font-body">
        ${(amount / 100).toFixed(0)}
      </div>
      <div className="text-xs text-theme-text-muted font-body mt-0.5">{label}</div>
    </PixelFrame>
  );
}
