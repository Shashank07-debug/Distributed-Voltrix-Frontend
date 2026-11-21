import React, { useEffect, useRef, useState } from 'react';

// Target full text:
// "describe your vision. voltrix builds the code."
// Part 1: "describe your " (14 chars)
// Part 2: "vision" (6 chars, highlighted in lime, squiggle anchored underneath)
// Part 3: ". voltrix builds the code." (26 chars)

const PART1 = 'describe your ';
const HIGHLIGHT = 'vision';
const PART3 = '. voltrix builds the code.';
const FULL_TEXT = `${PART1}${HIGHLIGHT}${PART3}`;

export const HeroHeading: React.FC = () => {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const textWrapperRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const squigglePathRef = useRef<SVGPathElement>(null);
  const charSpansRef = useRef<HTMLSpanElement[]>([]);

  const isCompletedRef = useRef(false);
  const animFrameIdRef = useRef<number | null>(null);
  const [caretBlinking, setCaretBlinking] = useState(false);

  // Check prefers-reduced-motion
  const isReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const totalChars = FULL_TEXT.length;
    const highlightEndIdx = PART1.length + HIGHLIGHT.length - 1; // index 19 (after 'n' in vision)

    // Position caret after a specific character span
    const updateCaretPosition = (charIdx: number) => {
      const caret = caretRef.current;
      const textWrapper = textWrapperRef.current;
      const span = charSpansRef.current[charIdx];
      if (!caret || !textWrapper || !span) return;

      const wrapperRect = textWrapper.getBoundingClientRect();
      const spanRect = span.getBoundingClientRect();

      const x = spanRect.right - wrapperRect.left + 2;
      const y = spanRect.top - wrapperRect.top + (spanRect.height * 0.15);
      caret.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const drawSquiggle = () => {
      if (squigglePathRef.current) {
        squigglePathRef.current.style.transition = 'stroke-dashoffset 500ms cubic-bezier(0.16, 1, 0.3, 1)';
        squigglePathRef.current.style.strokeDashoffset = '0';
      }
    };

    const finishInstantly = () => {
      if (isCompletedRef.current) return;
      isCompletedRef.current = true;

      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }

      // Reveal all characters
      charSpansRef.current.forEach((span) => {
        if (span) span.style.opacity = '1';
      });

      // Draw squiggle immediately
      drawSquiggle();

      // Position caret at the end of "code" (or last character)
      updateCaretPosition(totalChars - 1);
      setCaretBlinking(true);
    };

    // If reduced motion is requested, finish immediately
    if (isReducedMotion) {
      finishInstantly();
      return;
    }

    // Single rAF typing loop
    let currentIndex = 0;
    let lastTime = performance.now();
    let currentDelay = 80; // start within 150ms of first paint
    let isPaused = false;

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Global skip on click, tap, any key, or scroll
    const handleSkip = () => {
      finishInstantly();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleSkip);
    }
    window.addEventListener('keydown', handleSkip, { once: true, passive: true });
    window.addEventListener('scroll', handleSkip, { once: true, passive: true });
    window.addEventListener('touchstart', handleSkip, { once: true, passive: true });

    const handleResize = () => {
      if (isCompletedRef.current) {
        updateCaretPosition(totalChars - 1);
      } else if (currentIndex > 0) {
        updateCaretPosition(currentIndex - 1);
      }
    };
    window.addEventListener('resize', handleResize);

    const tick = (now: number) => {
      if (isCompletedRef.current) return;

      if (isPaused) {
        animFrameIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = now - lastTime;
      if (elapsed >= currentDelay) {
        lastTime = now;

        if (currentIndex < totalChars) {
          const span = charSpansRef.current[currentIndex];
          if (span) span.style.opacity = '1';

          updateCaretPosition(currentIndex);

          // If finished typing 'vision', draw the hand-drawn squiggle under it
          if (currentIndex === highlightEndIdx) {
            drawSquiggle();
          }

          const typedChar = FULL_TEXT[currentIndex];
          currentIndex++;

          // Natural speed: 40-55ms per character with +/-30% jitter
          const baseSpeed = 40 + Math.random() * 15;
          const jitter = baseSpeed * (0.7 + Math.random() * 0.6);
          currentDelay = jitter;

          // 200ms pause after period
          if (typedChar === '.') {
            currentDelay += 200;
          }

          animFrameIdRef.current = requestAnimationFrame(tick);
        } else {
          // Finished typing all characters
          isCompletedRef.current = true;
          drawSquiggle();
          updateCaretPosition(totalChars - 1);
          setCaretBlinking(true);
        }
      } else {
        animFrameIdRef.current = requestAnimationFrame(tick);
      }
    };

    // Start typing loop
    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (container) container.removeEventListener('click', handleSkip);
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('scroll', handleSkip);
      window.removeEventListener('touchstart', handleSkip);
      window.removeEventListener('resize', handleResize);
    };
  }, [isReducedMotion]);

  let globalIdx = 0;

  return (
    <div className="relative">
      {/* Screen Reader Full Announcement */}
      <span className="sr-only">{FULL_TEXT}</span>

      <h1
        ref={containerRef}
        aria-label={FULL_TEXT}
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--landing-text-primary)] leading-[1.04] select-none cursor-pointer"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <span ref={textWrapperRef} aria-hidden="true" className="relative inline select-none">
          {/* Part 1: "describe your " */}
          {PART1.split('').map((char) => {
            const idx = globalIdx++;
            return (
              <span
                key={idx}
                ref={(el) => {
                  if (el) charSpansRef.current[idx] = el;
                }}
                style={{ opacity: 0 }}
              >
                {char}
              </span>
            );
          })}

          {/* Part 2: "vision" in lime with squiggle anchored to its box */}
          <span className="relative inline-block text-[var(--landing-accent)]">
            {HIGHLIGHT.split('').map((char) => {
              const idx = globalIdx++;
              return (
                <span
                  key={idx}
                  ref={(el) => {
                    if (el) charSpansRef.current[idx] = el;
                  }}
                  style={{ opacity: 0 }}
                >
                  {char}
                </span>
              );
            })}

            {/* Hand-drawn squiggle strictly anchored to vision box */}
            <svg
              viewBox="0 0 140 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-0 -bottom-2 w-full h-4 pointer-events-none overflow-visible"
              aria-hidden="true"
            >
              <path
                ref={squigglePathRef}
                d="M 2 9 C 25 3, 45 15, 70 8 C 95 2, 115 16, 138 9"
                stroke="var(--landing-accent)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: '120',
                  strokeDashoffset: isReducedMotion ? '0' : '120',
                }}
              />
            </svg>
          </span>

          {/* Part 3: ". voltrix builds the code." */}
          {PART3.split('').map((char) => {
            const idx = globalIdx++;
            return (
              <span
                key={idx}
                ref={(el) => {
                  if (el) charSpansRef.current[idx] = el;
                }}
                style={{ opacity: 0 }}
              >
                {char}
              </span>
            );
          })}

          {/* Block Caret following the active character */}
          <span
            ref={caretRef}
            aria-hidden="true"
            className={`landing-caret absolute top-0 left-0 pointer-events-none ${
              caretBlinking && !isReducedMotion ? 'animate-pulse' : ''
            }`}
            style={{
              transform: 'translate3d(0, 0, 0)',
              transition: 'transform 0.04s linear',
            }}
          />
        </span>
      </h1>
    </div>
  );
};
