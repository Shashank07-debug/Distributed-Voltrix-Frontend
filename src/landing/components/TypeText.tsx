import React, { useEffect, useRef, useState } from 'react';
import {
  TypeSpeedProfile,
  getProfileBaseSpeed,
  registerTypewriterIntersection,
} from './useTypewriter';
import { Caret } from './Caret';
import { Squiggle } from './Squiggle';

export interface TypeTextProps {
  text: string;
  profile?: TypeSpeedProfile;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  className?: string;
  delayMs?: number;
  showCaret?: boolean;
  keepCaretBlinking?: boolean;
  caretVariant?: 'lime' | 'dark';
  highlightWord?: string;
  withSquiggle?: boolean;
  squiggleColor?: 'lime' | 'coral' | 'bone' | 'dark';
  onComplete?: () => void;
  autoStart?: boolean;
}

export const TypeText: React.FC<TypeTextProps> = ({
  text,
  profile = 'heading',
  as: Tag = 'span',
  className = '',
  delayMs = 0,
  showCaret = true,
  keepCaretBlinking = false,
  caretVariant = 'lime',
  highlightWord,
  withSquiggle = false,
  squiggleColor = 'lime',
  onComplete,
  autoStart = false,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const charSpansRef = useRef<HTMLSpanElement[]>([]);
  const isTypingRef = useRef(false);
  const hasFinishedRef = useRef(false);

  const [isCompleted, setIsCompleted] = useState(false);
  const [showSquiggle, setShowSquiggle] = useState(false);
  const [caretState, setCaretState] = useState<'typing' | 'blinking' | 'static'>(
    keepCaretBlinking ? 'typing' : 'blinking'
  );

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isLongBody = profile === 'body' && text.length > 160;
  // If long body, split by words; otherwise by characters
  const tokens = isLongBody ? text.split(' ') : text.split('');

  const finishImmediately = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    isTypingRef.current = false;

    charSpansRef.current.forEach((span) => {
      if (span) span.style.opacity = '1';
    });

    setIsCompleted(true);
    if (withSquiggle) setShowSquiggle(true);

    if (keepCaretBlinking) {
      setCaretState('typing');
    } else {
      setTimeout(() => setCaretState('static'), 1800);
    }
    onComplete?.();
  };

  const startTyping = () => {
    if (hasFinishedRef.current || isTypingRef.current) return;
    isTypingRef.current = true;

    if (reducedMotion) {
      finishImmediately();
      return;
    }

    let currentIndex = 0;
    const baseSpeed = getProfileBaseSpeed(profile, text.length);
    let timeoutId: number | null = null;
    let isPaused = false;

    const onVisibilityChange = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const step = () => {
      if (!isTypingRef.current) return;

      if (isPaused) {
        timeoutId = window.setTimeout(step, 100);
        return;
      }

      if (currentIndex < tokens.length) {
        const span = charSpansRef.current[currentIndex];
        if (span) span.style.opacity = '1';

        const token = tokens[currentIndex];
        currentIndex++;

        // Natural jitter (+/-30%)
        const jitter = baseSpeed * (0.7 + Math.random() * 0.6);
        let nextDelay = jitter;

        // Pause after sentence-ending punctuation
        if (token === '.' || token === '?' || token === '!' || token === ',') {
          nextDelay += 180 + Math.random() * 80;
        }

        // Trigger squiggle right after highlighted word finishes
        if (
          withSquiggle &&
          highlightWord &&
          !showSquiggle &&
          tokens.slice(0, currentIndex).join(isLongBody ? ' ' : '').includes(highlightWord)
        ) {
          setShowSquiggle(true);
        }

        timeoutId = window.setTimeout(step, nextDelay);
      } else {
        hasFinishedRef.current = true;
        isTypingRef.current = false;
        setIsCompleted(true);
        if (withSquiggle) setShowSquiggle(true);

        if (keepCaretBlinking) {
          setCaretState('typing');
        } else {
          // Blink 3 times (~1800ms) then rest
          setTimeout(() => setCaretState('static'), 1800);
        }

        document.removeEventListener('visibilitychange', onVisibilityChange);
        onComplete?.();
      }
    };

    timeoutId = window.setTimeout(step, delayMs);
  };

  useEffect(() => {
    if (reducedMotion) {
      finishImmediately();
      return;
    }

    if (autoStart) {
      const t = setTimeout(startTyping, delayMs);
      return () => clearTimeout(t);
    }

    const unobserve = registerTypewriterIntersection(containerRef.current!, () => {
      startTyping();
    });

    return () => unobserve();
  }, [autoStart, delayMs, reducedMotion]);

  // Global skip listener on click or keydown
  useEffect(() => {
    const handleSkip = () => {
      if (isTypingRef.current && !hasFinishedRef.current) {
        finishImmediately();
      }
    };

    window.addEventListener('keydown', handleSkip, { once: true });
    return () => window.removeEventListener('keydown', handleSkip);
  }, []);

  return (
    <Tag
      ref={containerRef as React.Ref<any>}
      onClick={finishImmediately}
      className={`relative inline-block cursor-text ${className}`}
      aria-label={text}
    >
      {/* Visual typed layer (aria-hidden to avoid screen reader stutter) */}
      <span aria-hidden="true" className="select-text">
        {highlightWord && text.includes(highlightWord) ? (
          // Segment with highlighted word
          (() => {
            const parts = text.split(highlightWord);
            let globalCharIdx = 0;

            return (
              <>
                {parts[0].split('').map((char, i) => {
                  const idx = globalCharIdx++;
                  return (
                    <span
                      key={idx}
                      ref={(el) => {
                        if (el) charSpansRef.current[idx] = el;
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.05s ease' }}
                    >
                      {char}
                    </span>
                  );
                })}

                <span className="relative inline-block whitespace-nowrap text-[var(--landing-accent)] font-semibold">
                  {highlightWord.split('').map((char, i) => {
                    const idx = globalCharIdx++;
                    return (
                      <span
                        key={idx}
                        ref={(el) => {
                          if (el) charSpansRef.current[idx] = el;
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.05s ease' }}
                      >
                        {char}
                      </span>
                    );
                  })}
                  {showSquiggle && <Squiggle color={squiggleColor} />}
                </span>

                {parts[1]?.split('').map((char, i) => {
                  const idx = globalCharIdx++;
                  return (
                    <span
                      key={idx}
                      ref={(el) => {
                        if (el) charSpansRef.current[idx] = el;
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.05s ease' }}
                    >
                      {char}
                    </span>
                  );
                })}
              </>
            );
          })()
        ) : isLongBody ? (
          // Word-by-word reveal for long body paragraphs
          tokens.map((word, wIdx) => (
            <span
              key={wIdx}
              ref={(el) => {
                if (el) charSpansRef.current[wIdx] = el;
              }}
              style={{ opacity: 0, transition: 'opacity 0.08s ease' }}
              className="inline-block mr-[0.25em]"
            >
              {word}
            </span>
          ))
        ) : (
          // Standard character-by-character reveal
          tokens.map((char, cIdx) => (
            <span
              key={cIdx}
              ref={(el) => {
                if (el) charSpansRef.current[cIdx] = el;
              }}
              style={{ opacity: 0, transition: 'opacity 0.05s ease' }}
            >
              {char}
            </span>
          ))
        )}

        {/* Trailing Caret */}
        {showCaret && (
          <Caret
            variant={caretVariant}
            staticCaret={caretState === 'static' || reducedMotion}
            className="ml-1 align-middle"
          />
        )}
      </span>
    </Tag>
  );
};
