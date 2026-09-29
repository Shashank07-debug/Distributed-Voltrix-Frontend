import React from 'react';

interface WebGLFallbackProps {
  className?: string;
  variant?: 'hero' | 'calm' | 'particles';
}

export const WebGLFallback: React.FC<WebGLFallbackProps> = ({ className = '', variant = 'hero' }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#070709] ${className}`}>
      {/* Animated gradient mesh glows */}
      <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-voltrix-violet/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] rounded-full bg-voltrix-cyan/20 blur-[120px] animate-pulse-glow [animation-delay:1.5s]" />
      
      {variant === 'hero' && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-voltrix-highlight/10 blur-[100px]" />
      )}

      {/* Grid line overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/80 pointer-events-none" />
    </div>
  );
};
