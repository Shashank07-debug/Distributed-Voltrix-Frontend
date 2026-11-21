import React, { useState } from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { FolderTree, Code2, Activity, Users, ShieldCheck } from 'lucide-react';

export const Features: React.FC = () => {
  const [expandedFolder, setExpandedFolder] = useState(true);

  return (
    <section id="features" className="py-20 sm:py-28 border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <Reveal>
          <SectionHeading
            eyebrow="the goods"
            title="everything you need to build tonight"
            highlightWord="tonight"
            description="not a toy chatbot. voltrix gives you full files, an industry-standard editor, and isolated live previews."
          />
        </Reveal>

        {/* Bento Grid - Widget / Sticker Sheet Aesthetic */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1: Instant File Trees (Ink surface, 7 Cols) */}
          <Reveal className="md:col-span-7">
            <div className="h-full p-7 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-accent)] hover:shadow-[4px_4px_0px_#D4FF32] transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)]">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3
                  className="text-2xl font-bold text-[var(--landing-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  instant file trees
                </h3>
                <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed max-w-md">
                  clean modular react project layouts with separate components, hooks, and types. no single 2,000-line spaghetti files.
                </p>
              </div>

              {/* Interactive Mini File Tree */}
              <div
                className="mt-6 p-4 rounded-[16px] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] font-mono text-xs cursor-pointer select-none"
                onClick={() => setExpandedFolder(!expandedFolder)}
              >
                <div className="text-[11px] text-[var(--landing-text-muted)] flex items-center justify-between pb-2 border-b border-[var(--landing-border)] mb-2">
                  <span>src/components/</span>
                  <span className="text-[10px] text-[var(--landing-accent)] font-semibold">
                    {expandedFolder ? 'click to collapse -' : 'click to expand +'}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[var(--landing-text-primary)] flex items-center gap-2 font-medium">
                    <span className="text-[var(--landing-accent)]">📁</span>
                    <span>dashboard/</span>
                  </div>
                  {expandedFolder && (
                    <div className="pl-4 space-y-1 text-[var(--landing-text-secondary)] border-l-2 border-[var(--landing-border)] ml-2">
                      <div className="hover:text-[var(--landing-accent)]">📄 MetricCard.tsx</div>
                      <div className="hover:text-[var(--landing-accent)]">📄 ActivityStream.tsx</div>
                      <div className="hover:text-[var(--landing-accent)]">📄 DataGrid.tsx</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Monaco Editor (Bone contrast surface, 5 Cols) */}
          <Reveal className="md:col-span-5" delayMs={100}>
            <div className="h-full p-7 rounded-[var(--landing-radius-lg)] bg-[var(--landing-bg-bone)] text-[#090D0F] border-2 border-[#090D0F] hover:shadow-[4px_4px_0px_#090D0F] transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-white border border-[#090D0F] flex items-center justify-center text-[#090D0F]">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3
                  className="text-2xl font-bold text-[#090D0F]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  monaco editor
                </h3>
                <p className="text-sm text-[#4A565E] leading-relaxed">
                  the same core engine that powers VS Code. syntax highlighting, autocomplete, and error diagnostics out of the box.
                </p>
              </div>

              {/* Dark Code Snippet Window */}
              <div className="mt-6 p-3.5 rounded-[16px] bg-[#090D0F] border border-black font-mono text-[11px] text-[var(--landing-text-secondary)] leading-relaxed space-y-1">
                <div>
                  <span className="text-[var(--landing-accent)] font-semibold">export type</span> Role = <span className="text-amber-300">'builder'</span>;
                </div>
                <div>
                  <span className="text-[var(--landing-accent)]">const</span> ready = (r: Role) =&gt; r === <span className="text-amber-300">'builder'</span>;
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 3: Real-Time Streaming (Ink surface, 4 Cols) */}
          <Reveal className="md:col-span-4" delayMs={140}>
            <div className="h-full p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)]">
                  <Activity className="w-4 h-4" />
                </div>
                <h3
                  className="text-lg font-bold text-[var(--landing-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  real-time streaming
                </h3>
                <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed">
                  watch files stream into the tree line by line. no mystery spin-wheels.
                </p>
              </div>

              <div className="mt-5 p-3 rounded-[12px] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] font-mono text-[10px] space-y-1">
                <div className="text-[var(--landing-text-muted)] text-[9px] uppercase font-bold">telemetry stream</div>
                <div className="text-[var(--landing-accent)]">&gt; worker-plan: 8 files resolved</div>
                <div className="text-[var(--landing-success)]">&gt; compiler: 0 type errors</div>
              </div>
            </div>
          </Reveal>

          {/* Card 4: Multi-Role Team Deployment (Lime Pop Card, 4 Cols) */}
          <Reveal className="md:col-span-4" delayMs={180}>
            <div className="h-full p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-accent)] text-[#090D0F] border-2 border-[#090D0F] shadow-[3px_3px_0px_#090D0F] hover:shadow-[5px_5px_0px_#090D0F] transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-[#090D0F] text-[var(--landing-accent)] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3
                  className="text-lg font-bold text-[#090D0F]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  team deployment
                </h3>
                <p className="text-xs text-[#2A343A] font-medium leading-relaxed">
                  share workspaces with teammates. collaborate as Owner, Editor, or Viewer.
                </p>
              </div>

              {/* Role Chips */}
              <div className="mt-5 flex flex-wrap gap-1.5 font-mono text-[10.5px]">
                <span className="px-2.5 py-1 rounded-full bg-[#090D0F] text-[var(--landing-accent)] font-bold">
                  Owner
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#090D0F]/15 text-[#090D0F] font-bold border border-[#090D0F]/30">
                  Editor
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#090D0F]/10 text-[#090D0F]/80 font-medium">
                  Viewer
                </span>
              </div>
            </div>
          </Reveal>

          {/* Card 5: Strict Output & Coral Pop (Ink surface, 4 Cols) */}
          <Reveal className="md:col-span-4" delayMs={220}>
            <div className="h-full p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-pop-coral)] transition-all duration-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-[var(--landing-pop-coral-subtle)] border border-[var(--landing-pop-coral)]/30 flex items-center justify-center text-[var(--landing-pop-coral)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3
                  className="text-lg font-bold text-[var(--landing-text-primary)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  typed & accessible
                </h3>
                <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed">
                  strict typescript compilation and accessible semantic HTML generated by default.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--landing-border)] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[var(--landing-text-muted)]">TypeScript strict</span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--landing-pop-coral)] text-white font-bold text-[10px]">
                  WCAG AA
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
