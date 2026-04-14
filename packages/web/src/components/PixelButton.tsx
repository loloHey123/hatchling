import { ButtonHTMLAttributes } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<string, string> = {
  primary: 'bg-theme-accent text-theme-bg hover:brightness-110',
  secondary: 'bg-theme-surface text-theme-text-muted hover:brightness-125',
  danger: 'bg-theme-danger text-white hover:brightness-110',
};

const sizes: Record<string, string> = {
  sm: 'text-pixel-sm px-3 py-2',
  md: 'text-pixel-base px-5 py-3',
  lg: 'text-pixel-lg px-6 py-4',
};

export function PixelButton({ variant = 'primary', size = 'md', className = '', ...props }: PixelButtonProps) {
  return (
    <button
      className={`font-pixel border-[3px] border-theme-border shadow-pixel-lg cursor-pointer
        active:shadow-pixel-pressed active:translate-x-[3px] active:translate-y-[3px]
        transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
