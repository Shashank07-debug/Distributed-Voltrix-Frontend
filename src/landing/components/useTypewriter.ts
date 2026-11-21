import { useEffect, useRef, useState, useCallback } from 'react';

export type TypeSpeedProfile = 'display' | 'heading' | 'body' | 'chip' | 'footer';

export interface UseTypewriterOptions {
  text: string;
  profile?: TypeSpeedProfile;
  delayMs?: number;
  startTrigger?: boolean; // manual trigger or wait for intersection
  keepCaretBlinking?: boolean;
  onComplete?: () => void;
  onWordComplete?: (word: string, index: number) => void;
}

// Shared IntersectionObserver for all TypeText instances
let sharedObserver: IntersectionObserver | null = null;
const observerCallbacks = new Map<Element, () => void>();

function getSharedObserver(): IntersectionObserver {
  if (!sharedObserver && typeof window !== 'undefined') {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cb = observerCallbacks.get(entry.target);
            if (cb) {
              cb();
              observerCallbacks.delete(entry.target);
              sharedObserver?.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.35 }
    );
  }
  return sharedObserver!;
}

export function registerTypewriterIntersection(element: Element, callback: () => void): () => void {
  const obs = getSharedObserver();
  observerCallbacks.set(element, callback);
  obs.observe(element);
  return () => {
    observerCallbacks.delete(element);
    obs.unobserve(element);
  };
}

export function getProfileBaseSpeed(profile: TypeSpeedProfile, textLength: number): number {
  switch (profile) {
    case 'display':
      return 45; // 40-55ms
    case 'heading':
      return 30; // 28-35ms
    case 'body':
      // Hard cap: total time <= 1400ms
      if (textLength > 0 && textLength * 12 > 1400) {
        return Math.max(5, Math.floor(1400 / textLength));
      }
      return 12; // 10-14ms
    case 'chip':
      return 20; // 18-22ms
    case 'footer':
      return 40;
    default:
      return 25;
  }
}
