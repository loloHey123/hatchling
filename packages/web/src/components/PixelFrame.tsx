import { ReactNode } from 'react';

export function PixelFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-theme-surface border-[3px] border-theme-border shadow-pixel-lg p-4 ${className}`}>
      {children}
    </div>
  );
}
