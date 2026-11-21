import React, { useState } from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Squiggle } from '../components/Squiggle';
import { Reveal } from '../components/Reveal';
import { MessageSquareCode, Cpu, SearchCode, Rocket } from 'lucide-react';

export const Workflow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'say it',
      subtitle: 'prompt in plain english',
      description: 'tell voltrix what you are trying to build. layout, state, components, or user flows.',
      icon: MessageSquareCode,
    },
    {
      num: '02',
      title: 'watch it build',
      subtitle: 'streaming file plan',
      description: 'distributed worker nodes plan directory architecture and write clean typed code.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'poke around',
      subtitle: 'monaco code inspection',
      description: 'inspect the full file tree in an editor you already know. tweak anything you want.',
      icon: SearchCode,
    },
    {
      num: '04',
      title: 'ship it',
      subtitle: 'instant live preview',
      description: 'your app boots inside an isolated container preview sandbox ready to share.',
      icon: Rocket,
    },
  ];

  return (
    /* Full-bleed Bone Contrast Band */
    <section id="workflow" className="py-20 sm:py-28 bg-[var(--landing-bg-bone)] text-[#090D0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <Reveal>
          <SectionHeading
            theme="bone"
            eyebrow="how it works"
            title="from a sentence to a running app"
            highlightWord="running app"
            description="four transparent stages. no hidden magic or locked-in code."
          />
        </Reveal>

        {/* Big Numbered Step Cards on Bone Background */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;

            return (
              <Reveal key={idx} delayMs={idx * 90}>
                <div
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`p-6 rounded-[var(--landing-radius-lg)] border-2 transition-all duration-200 cursor-pointer h-full flex flex-col justify-between ${
                    isActive
                      ? 'bg-white border-[#090D0F] shadow-[4px_4px_0px_#090D0F] -translate-y-1'
                      : 'bg-[#EDEAE1] border-[#090D0F]/15 hover:border-[#090D0F]/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-3xl font-extrabold tracking-tight text-[#090D0F]"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {step.num}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[var(--landing-accent)] text-[#090D0F] border border-[#090D0F]'
                            : 'bg-white/80 text-[#090D0F]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <div className="relative inline-block">
                        <h3
                          className="text-xl font-bold text-[#090D0F]"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {step.title}
                        </h3>
                        {isActive && <Squiggle color="dark" />}
                      </div>
                      <p className="text-xs font-mono font-semibold text-[#53626C] mt-1">
                        {step.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-[#354047] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-[#090D0F]/10 flex items-center justify-between text-[11px] font-mono text-[#72808A]">
                    <span>Stage {idx + 1}</span>
                    <span className={isActive ? 'font-bold text-[#090D0F]' : ''}>
                      {isActive ? 'Active' : 'Hover'}
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
