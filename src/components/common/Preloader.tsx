import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let fallbackTimeoutId: ReturnType<typeof setTimeout>;

    // Lock body scroll during preloader
    document.body.style.overflow = 'hidden';

    const checkReducedMotion = () => {
      try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch {
        return false;
      }
    };

    const isReduced = checkReducedMotion();

    if (isReduced) {
      // Reduced motion: immediate fade out
      setIsFadingOut(true);
      setTimeout(() => {
        document.body.style.overflow = '';
        onComplete();
      }, 200);
      return;
    }

    // 1. Wait for document.fonts.ready & hero asset initialization with a 4s hard safety fallback
    const fontPromise = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();

    // 4-second maximum safety timer to prevent trapping user on slow connections
    fallbackTimeoutId = setTimeout(() => {
      if (isMounted) setIsReady(true);
    }, 4000);

    fontPromise.then(() => {
      if (isMounted) setIsReady(true);
    });

    // 2. Animate voltage progress bar smoothly
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (isMounted) {
            setTimeout(() => setIsFadingOut(true), 150);
            setTimeout(() => {
              document.body.style.overflow = '';
              onComplete();
            }, 500);
          }
          return 100;
        }

        // Fast progress increment up to 85%, then wait for real readiness if not ready yet
        if (prev >= 85 && !isReady) {
          return 85;
        }

        return prev + Math.floor(Math.random() * 12) + 6;
      });
    }, 40);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(fallbackTimeoutId);
      document.body.style.overflow = '';
    };
  }, [onComplete, isReady]);

  return (
    <div
      aria-hidden="true"
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
