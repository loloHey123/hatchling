import { ButtonHTMLAttributes } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<string, string> = {
  primary: 'bg-[#78c850] text-white hover:bg-[#8ad860] text-shadow-pixel',
  secondary: 'bg-[#e8e8e8] text-[#666] hover:bg-[#d8d8d8]',
  danger: 'bg-[#f85888] text-white hover:bg-[#ff6898] text-shadow-pixel',
};

const sizes: Record<string, string> = {
  sm: 'text-[8px] px-3 py-2',
  md: 'text-[10px] px-5 py-3',
  lg: 'text-[12px] px-6 py-4',
};

export function PixelButton({ variant = 'primary', size = 'md', className = '', ...props }: PixelButtonProps) {
  return (
    <button
      className={`font-pixel border-[3px] border-[#333] shadow-[4px_4px_0_#333] cursor-pointer
        active:shadow-[1px_1px_0_#333] active:translate-x-[3px] active:translate-y-[3px]
        transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
