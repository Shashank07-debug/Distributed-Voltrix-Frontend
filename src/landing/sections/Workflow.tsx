import React, { useState } from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { MessageSquareCode, Cpu, SearchCode, Rocket } from 'lucide-react';

export const Workflow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Describe',
      subtitle: 'Formulate your requirements',
      description: 'Detail functional requirements, layouts, data models, or third-party integrations in plain text.',
      icon: MessageSquareCode,
    },
    {
      num: '02',
      title: 'Generate',
      subtitle: 'Distributed planning & synthesis',
      description: 'Worker nodes plan project file structures, resolve dependencies, and stream typed code.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Inspect',
      subtitle: 'Monaco editor verification',
      description: 'Review syntax, modify components live, and inspect the real-time compiled browser preview.',
      icon: SearchCode,
    },
    {
      num: '04',
      title: 'Deploy',
      subtitle: 'Containerized team release',
      description: 'Publish your application to isolated sandbox runners ready for team collaboration and testing.',
      icon: Rocket,
    },
  ];

  return (
    <section id="workflow" className="py-16 sm:py-24 border-t border-[var(--landing-border)] bg-[var(--landing-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal>
          <SectionHeading
            eyebrow="Workflow"
            title="From a sentence to a running app"
            description="A transparent four-stage lifecycle that keeps developers in complete control of generated artifacts."
          />
        </Reveal>

        {/* Timeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <Reveal key={idx} delayMs={idx * 80}>
                <div
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`p-5 rounded-[var(--landing-radius-lg)] border transition-all duration-200 cursor-pointer h-full flex flex-col justify-between ${
                    isActive
                      ? 'bg-[var(--landing-surface-2)] border-[var(--landing-accent)]'
                      : 'bg-[var(--landing-surface-1)] border-[var(--landing-border)] hover:border-[var(--landing-border-hover)]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[var(--landing-text-muted)]">
                        {step.num}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-[var(--landing-radius-sm)] flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[var(--landing-accent)] text-[#0B0B0C]'
                            : 'bg-[var(--landing-surface-2)] text-[var(--landing-text-secondary)]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-[var(--landing-text-primary)]">
                        {step.title}
                      </h3>
                      <p className="text-xs font-mono text-[var(--landing-accent)] mt-0.5">
                        {step.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--landing-border)] flex items-center justify-between text-[11px] font-mono text-[var(--landing-text-muted)]">
                    <span>Stage {idx + 1}</span>
                    <span className={isActive ? 'text-[var(--landing-accent)] font-medium' : ''}>
                      {isActive ? 'Selected' : 'Hover to view'}
                    </span>
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
