import { ReactNode } from 'react';

export function PixelFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border-[3px] border-[#333] shadow-[4px_4px_0_#333] p-4 ${className}`}>
      {children}
    </div>
  );
}
