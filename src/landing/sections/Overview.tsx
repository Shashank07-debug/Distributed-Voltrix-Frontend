import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { FolderTree, Code2, Users2 } from 'lucide-react';

export const Overview: React.FC = () => {
  const capabilities = [
    {
      icon: FolderTree,
      title: 'Instant file trees',
      description: 'Generates cohesive directory architectures with type definitions and component boundaries.',
    },
    {
      icon: Code2,
      title: 'Editor-grade inspection',
      description: 'Every generated source file is editable and inspectable in Monaco with syntax highlighting.',
    },
    {
      icon: Users2,
      title: 'Team deployment',
      description: 'Stream builds across distributed microservices with role-based workspace permissions.',
    },
  ];

  return (
    <section id="overview" className="py-16 sm:py-20 border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal>
          <SectionHeading
            eyebrow="Platform Overview"
            title="Engineered for autonomous development"
            description="Voltrix translates natural language requirements into complete, production-grade applications with zero boilerplate overhead."
          />
        </Reveal>

        {/* 3 Compact Fact Rows with subtle rule lines */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--landing-border)] border border-[var(--landing-border)] rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)]">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={idx} delayMs={idx * 100}>
                <div className="p-6 sm:p-8 space-y-3">
                  <div className="w-9 h-9 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--landing-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
