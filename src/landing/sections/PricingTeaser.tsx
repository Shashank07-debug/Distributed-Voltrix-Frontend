import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Button } from '../components/Button';
import { Reveal } from '../components/Reveal';
import { ArrowRight, Check } from 'lucide-react';

export const PricingTeaser: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-left max-w-xl">
              <p className="text-xs font-mono font-medium text-[var(--landing-accent)]">
                Transparent Compute
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--landing-text-primary)]">
                Start free, upgrade when you need more
              </h2>
              <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                Free tier includes standard generation credits and containerized sandbox hosting. Upgrade as your team scales compute requirements.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[var(--landing-text-secondary)] font-mono">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[var(--landing-success)]" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[var(--landing-success)]" /> Instant workspace access
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Button to="/billing" variant="primary" size="lg">
                <span>View Plans &amp; Billing</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
