import React, { useState } from 'react';
import { HeroDemo } from './HeroDemo';
import { Caret } from '../components/Caret';
import { Squiggle } from '../components/Squiggle';
import { Sticker } from '../components/Sticker';
import { Button } from '../components/Button';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Hero: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const authenticated = isAuthenticated();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
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
          {/* Eyebrow with attitude */}
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight bg-[var(--landing-accent)] text-[#090D0F] border border-[#090D0F]">
              AI APP BUILDER
            </span>
            <span className="text-xs font-mono text-[var(--landing-text-muted)]">
              // autonomous generation
            </span>
          </div>

          {/* Headline with Squiggle & Block Caret */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--landing-text-primary)] leading-[1.02]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            describe your{' '}
            <span className="relative inline-block whitespace-nowrap text-[var(--landing-accent)]">
              vision
              <Squiggle color="lime" />
            </span>
            .<br />
            <span className="text-[var(--landing-text-secondary)] font-medium">
              voltrix builds the code
              <Caret />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[var(--landing-text-secondary)] max-w-lg leading-relaxed font-sans">
            say what you want to make in plain english. get a real, working app you can open, edit, and ship in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
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

        {/* Right Column: Workstation Demo with Floating Stickers */}
        <div className="lg:col-span-7 w-full relative">
          {/* Floating Sticker 1 (Top Left) */}
          <div
            style={{
              transform: `translate3d(${parallax.x * -0.6}px, ${parallax.y * -0.6}px, 0)`,
            }}
            className="absolute -top-3 sm:-top-5 -left-2 sm:-left-4 z-20 transition-transform duration-100 ease-out hidden sm:block"
          >
            <Sticker variant="lime" rotate={-4} icon={<Sparkles className="w-3 h-3 text-[#090D0F]" />}>
              no setup required
            </Sticker>
          </div>

          {/* Floating Sticker 2 (Top Right) */}
          <div
            style={{
              transform: `translate3d(${parallax.x * 0.8}px, ${parallax.y * 0.8}px, 0)`,
            }}
            className="absolute -top-4 sm:-top-6 right-6 sm:right-10 z-20 transition-transform duration-100 ease-out hidden sm:block"
          >
            <Sticker variant="coral" rotate={3}>
              monaco included
            </Sticker>
          </div>

          {/* Floating Sticker 3 (Bottom Right) */}
          <div
            style={{
              transform: `translate3d(${parallax.x * 0.5}px, ${parallax.y * 0.5}px, 0)`,
            }}
            className="absolute -bottom-3 sm:-bottom-4 right-4 z-20 transition-transform duration-100 ease-out hidden sm:block"
          >
            <Sticker variant="bone" rotate={-2}>
              ships in minutes
            </Sticker>
          </div>

          {/* The Demo Window */}
          <HeroDemo />
        </div>
      </div>

      {/* Marquee Strip under Hero */}
      <div className="mt-14 sm:mt-18 pt-6 border-t border-[var(--landing-border)] overflow-hidden select-none">
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
