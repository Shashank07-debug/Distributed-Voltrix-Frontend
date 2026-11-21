import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Terminal, Cpu, Sparkles } from 'lucide-react';

export const Overview: React.FC = () => {
  const personas = ['students', 'indie hackers', 'designers', 'first-time makers'];

  const capabilities = [
    {
      title: 'plain english to react',
      description:
        'type what you want to build. voltrix writes components, connects state, and arranges everything neatly into clean files.',
      icon: Terminal,
    },
    {
      title: 'monaco code inspection',
      description:
        'open and inspect every single generated file inside a full Monaco editor. tweak code in place with zero lock-in.',
      icon: Cpu,
    },
    {
      title: 'instant live preview',
      description:
        'hot-reloading iframe runs your code in an isolated sandbox. test buttons, type into inputs, and share the live URL.',
      icon: Sparkles,
    },
  ];

  return (
    <section id="overview" className="py-20 sm:py-24 border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal>
          {/* Header clean 2-column layout on desktop (>=900px), stacked below 900px */}
          <div className="grid grid-cols-1 min-[900px]:grid-cols-12 gap-6 items-end">
            <div className="min-[900px]:col-span-7">
              <SectionHeading
                eyebrow="zero fluff"
                title="built for people who make things"
                highlightWord="make"
                description="no enterprise gatekeeping. describe what you want, inspect the files, tweak the code, and show it to the world."
              />
            </div>

            {/* Persona Chips */}
            <div className="min-[900px]:col-span-5 flex flex-wrap items-center gap-2 justify-start min-[900px]:justify-end">
              <span className="text-xs font-mono text-[var(--landing-text-muted)] mr-1 shrink-0">
                made for:
              </span>
              {personas.map((persona, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-mono font-medium border border-[var(--landing-border-strong)] bg-[var(--landing-surface-2)] text-[var(--landing-text-secondary)] hover:text-[var(--landing-accent)] hover:border-[var(--landing-accent)] transition-colors select-none"
                >
                  {persona}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 3 Bold Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={idx} delayMs={idx * 80}>
                <div className="p-7 rounded-[var(--landing-radius-lg)] border border-[var(--landing-border)] bg-[var(--landing-surface-1)] hover:border-[var(--landing-accent)]/50 hover:-translate-y-1 transition-all duration-200 h-full flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3
                      className="text-lg font-bold text-[var(--landing-text-primary)]"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
