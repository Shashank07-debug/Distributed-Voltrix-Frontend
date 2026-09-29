import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsFadingOut(true), 150);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#070709] transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-voltrix-card border border-voltrix-violet/40 shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-pulse">
          <Zap className="w-8 h-8 text-voltrix-cyan animate-bounce" />
        </div>

        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white mb-1">
            VOLTRIX <span className="text-voltrix-cyan text-sm font-mono font-normal">v1.0</span>
          </h1>
          <p className="text-xs font-mono text-voltrix-muted">Initializing autonomous neural engine...</p>
        </div>

        {/* Voltage Progress Bar */}
        <div className="w-56 h-1.5 bg-voltrix-card rounded-full overflow-hidden border border-white/10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-voltrix-violet via-voltrix-cyan to-voltrix-highlight rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="font-mono text-xs text-voltrix-cyan">{progress}%</span>
      </div>
    </div>
  );
};
