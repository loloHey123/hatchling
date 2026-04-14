import { ReactNode, HTMLAttributes } from 'react';

interface PixelFrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function PixelFrame({ children, className = '', ...props }: PixelFrameProps) {
  return (
    <div className={`bg-theme-surface border-2 border-theme-border rounded-card shadow-soft-md p-4 transition-colors ${className}`} {...props}>
      {children}
    </div>
  );
}
