import React from 'react';
import { Button } from '../components/Button';
import { Reveal } from '../components/Reveal';
import { ArrowRight, Check } from 'lucide-react';

export const PricingTeaser: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border-2 border-[var(--landing-border)] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-[var(--landing-accent)]/40 transition-colors">
            <div className="space-y-3 text-left max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)]">
                pricing &amp; tiers
              </span>
              <h2
                className="text-3xl sm:text-4xl font-bold text-[var(--landing-text-primary)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                start free, pay when you scale
              </h2>
              <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed font-sans">
                free tier includes full access to autonomous generation and sandbox previews. upgrade compute units when your team needs more concurrent workers.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[var(--landing-text-secondary)] font-mono">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[var(--landing-accent)]" /> no card upfront
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[var(--landing-accent)]" /> instant workspace
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Button to="/billing" variant="primary" size="lg" magnetic>
                <span>view plans &amp; billing</span>
                <ArrowRight className="w-4 h-4 text-[#090D0F]" />
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
