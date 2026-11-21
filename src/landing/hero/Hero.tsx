import React, { useState, useEffect, useRef } from 'react';
import { HeroDemo } from './HeroDemo';
import { Caret } from '../components/Caret';
import { Squiggle } from '../components/Squiggle';
import { Sticker } from '../components/Sticker';
import { Button } from '../components/Button';
import { TypeText } from '../components/TypeText';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const CYCLING_WORDS = ['vision', 'idea', 'app', 'side project', 'startup'];

export const Hero: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const authenticated = isAuthenticated();

  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [introStep, setIntroStep] = useState(0); // 0=navbar, 1=eyebrow, 2=H1, 3=sub, 4=ctas, 5=demo, 6=stickers/finished
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [cyclingWord, setCyclingWord] = useState('vision');
  const [isCyclingPaused, setIsCyclingPaused] = useState(false);
  const [hasIntroFinished, setHasIntroFinished] = useState(false);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Master Intro Choreography
  useEffect(() => {
    if (reducedMotion) {
      setIntroStep(6);
      setHasIntroFinished(true);
      return;
    }

    const t1 = setTimeout(() => setIntroStep(1), 150); // eyebrow
    const t2 = setTimeout(() => setIntroStep(2), 500); // H1
    const t3 = setTimeout(() => setIntroStep(3), 2200); // sub
    const t4 = setTimeout(() => setIntroStep(4), 3000); // CTAs
    const t5 = setTimeout(() => setIntroStep(5), 3300); // demo window
    const t6 = setTimeout(() => {
      setIntroStep(6); // stickers
      setHasIntroFinished(true);
    }, 3600);

    const handleSkip = () => {
      setIntroStep(6);
      setHasIntroFinished(true);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };

    window.addEventListener('keydown', handleSkip, { once: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      window.removeEventListener('keydown', handleSkip);
    };
  }, [reducedMotion]);

  // Flourish: Backspace cycling of highlighted word after intro completes
  useEffect(() => {
    if (!hasIntroFinished || reducedMotion || isCyclingPaused) return;

    let isMounted = true;
    const interval = setInterval(() => {
      if (document.hidden || isCyclingPaused) return;

      const nextIdx = (activeWordIdx + 1) % CYCLING_WORDS.length;
      const targetWord = CYCLING_WORDS[nextIdx];

      // Backspace simulation
      let currentLen = cyclingWord.length;
      const backspaceTimer = setInterval(() => {
        if (!isMounted) return;
        currentLen--;
        setCyclingWord((prev) => prev.slice(0, currentLen));

        if (currentLen <= 0) {
          clearInterval(backspaceTimer);
          // Type new word
          let typeIdx = 0;
          const typeTimer = setInterval(() => {
            if (!isMounted) return;
            typeIdx++;
            setCyclingWord(targetWord.slice(0, typeIdx));
            if (typeIdx >= targetWord.length) {
              clearInterval(typeTimer);
              setActiveWordIdx(nextIdx);
            }
          }, 60);
        }
      }, 40);
    }, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [hasIntroFinished, activeWordIdx, cyclingWord.length, isCyclingPaused, reducedMotion]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    setParallax({ x, y });
  };

  const handleScrollToWorkflow = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('workflow');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '#workflow');
    }
  };

  const capabilities = [
    'instant file trees',
    'monaco editor',
    'live preview',
    'real-time streaming',
    'team deploys',
    'kubernetes-ready',
    'zero boilerplate',
    'typed react output',
  ];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative pt-24 sm:pt-28 lg:pt-32 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Bold Editorial Copy */}
        <div className="lg:col-span-5 space-y-6 text-left relative z-10">
          {/* Eyebrow Chip (types at 0.15s) */}
          <div
            className={`transition-[opacity,transform] duration-300 ${
              introStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="inline-flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight bg-[var(--landing-accent)] text-[#090D0F] border border-[#090D0F]">
                AI APP BUILDER
              </span>
              <span className="text-xs font-mono text-[var(--landing-text-muted)]">
                // autonomous generation
              </span>
            </div>
          </div>

          {/* H1 (types at 0.50s) with Squiggle & Block Caret */}
          <div className="relative">
            {/* Screen Reader Full Announcement */}
            <span className="sr-only">describe your vision. voltrix builds the code.</span>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--landing-text-primary)] leading-[1.02] select-none"
              style={{ fontFamily: 'var(--font-display)' }}
              onMouseEnter={() => setIsCyclingPaused(true)}
              onMouseLeave={() => setIsCyclingPaused(false)}
            >
              <span>describe your </span>
              <span className="relative inline-block whitespace-nowrap text-[var(--landing-accent)] min-w-[4ch]">
                {hasIntroFinished ? cyclingWord : 'vision'}
                <Squiggle color="lime" />
              </span>
              .<br />
              <span className="text-[var(--landing-text-secondary)] font-medium">
                voltrix builds the code
                <Caret variant="lime" className="ml-1.5" />
              </span>
            </h1>
          </div>

          {/* Subheading (types at 2.20s) */}
          <div
            className={`transition-[opacity,transform] duration-400 ${
              introStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <p className="text-base sm:text-lg text-[var(--landing-text-secondary)] max-w-lg leading-relaxed font-sans">
              say what you want to make in plain english. get a real, working app you can open, edit, and ship in minutes.
            </p>
          </div>

          {/* CTAs (rise at 3.00s with stagger) */}
          <div
            className={`flex flex-wrap items-center gap-3 pt-2 transition-[opacity,transform] duration-400 ${
              introStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <Button
              to={authenticated ? '/projects' : '/signup'}
              variant="primary"
              size="lg"
              magnetic
            >
              <span>Launch App Builder</span>
              <ArrowRight className="w-4 h-4 text-[#090D0F]" />
            </Button>
            <Button
              href="#workflow"
              onClick={handleScrollToWorkflow}
              variant="secondary"
              size="lg"
            >
              <span>See how it works</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Workstation Demo with Coordinated Entrance */}
        <div
          className={`lg:col-span-7 w-full relative transition-[opacity,transform] duration-500 ease-out ${
            introStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Safe-Anchored Floating Stickers (Overshoot entrance at 3.60s) */}
          <div
            style={{
              transform: `translate3d(${parallax.x * -0.6}px, ${parallax.y * -0.6}px, 0)`,
            }}
            className={`absolute -top-7 left-2 z-20 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hidden lg:block ${
              introStep >= 6 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <Sticker variant="lime" rotate={-3} icon={<Sparkles className="w-3 h-3 text-[#090D0F]" />}>
              no setup required
            </Sticker>
          </div>

          <div
            style={{
              transform: `translate3d(${parallax.x * 0.7}px, ${parallax.y * 0.7}px, 0)`,
            }}
            className={`absolute -top-7 right-4 z-20 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hidden lg:block ${
              introStep >= 6 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <Sticker variant="coral" rotate={2}>
              monaco included
            </Sticker>
          </div>

          <div
            style={{
              transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.4}px, 0)`,
            }}
            className={`absolute -bottom-8 right-1 z-20 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hidden md:block ${
              introStep >= 6 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <Sticker variant="bone" rotate={-2}>
              ships in minutes
            </Sticker>
          </div>

          {/* The Demo Window */}
          <HeroDemo />
        </div>
      </div>

      {/* Marquee Strip under Hero with Fade Masks */}
      <div
        className="mt-14 sm:mt-18 pt-6 border-t border-[var(--landing-border)] overflow-hidden select-none relative"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="sr-only">
          Supported capabilities: {capabilities.join(', ')}.
        </div>
        <div className="landing-marquee-track flex items-center gap-8 text-xs font-mono tracking-wide text-[var(--landing-text-muted)] uppercase">
          {[...capabilities, ...capabilities, ...capabilities].map((cap, i) => (
            <div key={i} className="flex items-center gap-8 shrink-0 hover:text-[var(--landing-accent)] transition-colors">
              <span>{cap}</span>
              <Star className="w-2.5 h-2.5 text-[var(--landing-accent)] fill-[var(--landing-accent)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
