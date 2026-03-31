import { PixelFrame } from './PixelFrame';

export function SavingsCounter({ amount, label }: { amount: number; label: string }) {
  return (
    <PixelFrame className="text-center">
      <div className="text-[18px]">💰</div>
      <div className="text-[14px] font-bold text-[#78c850] mt-1">
        ${(amount / 100).toFixed(0)}
      </div>
      <div className="text-[7px] text-[#888] mt-1">{label}</div>
    </PixelFrame>
  );
}
