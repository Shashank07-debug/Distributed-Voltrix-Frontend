import React, { useEffect, useRef, useState } from 'react';

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  delayMs = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion: instant reveal
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    // Check if element is already in the viewport on mount (above the fold)
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setIsVisible(true);
        return;
      }
    }

    // Play once using IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: '220ms',
        transitionDelay: `${delayMs}ms`,
      }}
      className={`transition-[opacity,transform] ease-out will-change-[opacity,transform] ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3.5'
      } ${className}`}
    >
      {children}
    </div>
  );
};
