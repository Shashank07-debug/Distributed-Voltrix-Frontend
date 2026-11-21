import React from 'react';
import { Caret } from '../components/Caret';
import { Button } from '../components/Button';
import { Reveal } from '../components/Reveal';
import { ArrowRight, Cpu } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const FinalCta: React.FC = () => {
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
    <section className="py-20 sm:py-28 border-t border-[var(--landing-border)] bg-[var(--landing-surface-1)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--landing-text-primary)] leading-tight">
            Describe it. Ship it
            <Caret />
          </h2>
        </Reveal>

        <Reveal delayMs={100}>
          <p className="text-sm sm:text-base text-[var(--landing-text-secondary)] max-w-xl mx-auto leading-relaxed">
            Experience autonomous application generation built with developer precision. Monaco editor inspection, instant file trees, and isolated live previews.
          </p>
        </Reveal>

        <Reveal delayMs={180}>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
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
        </Reveal>
      </div>
    </section>
  );
};
