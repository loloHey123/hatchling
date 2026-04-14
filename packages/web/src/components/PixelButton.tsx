import { ButtonHTMLAttributes } from 'react';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<string, string> = {
  primary: 'bg-theme-accent text-theme-bg hover:brightness-110 shadow-soft-md hover:shadow-soft-lg',
  secondary: 'bg-theme-surface text-theme-text-muted hover:bg-theme-surface-hover hover:text-theme-text shadow-soft-sm',
  danger: 'bg-theme-danger text-white hover:brightness-110 shadow-soft-md',
};

const sizes: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
};

export function PixelButton({ variant = 'primary', size = 'md', className = '', ...props }: PixelButtonProps) {
  return (
    <button
      className={`font-bold font-body border-2 border-theme-border rounded-button cursor-pointer
        active:scale-[0.97] active:shadow-soft-sm
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
