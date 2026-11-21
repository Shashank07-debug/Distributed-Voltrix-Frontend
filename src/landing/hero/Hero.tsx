import React from 'react';
import { HeroDemo } from './HeroDemo';
import { Caret } from '../components/Caret';
import { Button } from '../components/Button';
import { ArrowRight, Cpu } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Hero: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const authenticated = isAuthenticated();

  const handleScrollToArch = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('architecture');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '#architecture');
    }
  };

  return (
    <section className="relative pt-10 sm:pt-16 lg:pt-20 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Hero Copy */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-xs font-mono text-[var(--landing-text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
            <span>Autonomous application generation</span>
          </div>

          {/* Headline with Reveal & Trailing Caret */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-[var(--landing-text-primary)] leading-[1.15]">
            <span className="block">Describe your vision.</span>
            <span className="block text-[var(--landing-text-secondary)] font-normal mt-1">
              Voltrix builds the code
              <Caret />
            </span>
          </h1>

          {/* Subheading / Value Proposition */}
          <p className="text-sm sm:text-base text-[var(--landing-text-secondary)] max-w-xl leading-relaxed">
            Turn a plain-language prompt into a working app. Browse the generated file tree, inspect every file in the editor, and deploy with your team, with progress streamed to you as it happens.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              to={authenticated ? '/projects' : '/signup'}
              variant="primary"
              size="lg"
            >
              <span>Launch App Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              href="#architecture"
              onClick={handleScrollToArch}
              variant="secondary"
              size="lg"
            >
              <Cpu className="w-4 h-4 text-[var(--landing-accent)]" />
              <span>Explore Architecture</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Workstation Demo */}
        <div className="lg:col-span-7 w-full">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
};
