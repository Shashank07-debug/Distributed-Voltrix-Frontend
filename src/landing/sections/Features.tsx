import React, { useState } from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { FolderTree, Code2, Activity, Users, ShieldCheck } from 'lucide-react';

export const Features: React.FC = () => {
  const [expandedFolder, setExpandedFolder] = useState(true);

  return (
    <section id="features" className="py-16 sm:py-24 border-t border-[var(--landing-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal>
          <SectionHeading
            eyebrow="Capabilities"
            title="Engineered for developer clarity"
            description="Every layer of Voltrix is built to provide verifiable, maintainable code rather than black-box abstractions."
          />
        </Reveal>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card 1: Instant File Trees (7 Cols) */}
          <Reveal className="md:col-span-7">
            <div className="h-full p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] transition-colors flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)]">
                  <FolderTree className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--landing-text-primary)]">
                  Instant file trees
                </h3>
                <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed max-w-md">
                  Modular multi-file structures created on demand. Separation of concerns with dedicated components, hooks, utilities, and strict TypeScript types.
                </p>
              </div>

              {/* Interactive Mini File Tree */}
              <div
                className="mt-6 p-3 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] font-mono text-xs cursor-pointer select-none"
                onClick={() => setExpandedFolder(!expandedFolder)}
              >
                <div className="text-[11px] text-[var(--landing-text-muted)] flex items-center justify-between pb-1.5 border-b border-[var(--landing-border)] mb-2">
                  <span>src/components/</span>
                  <span className="text-[10px] text-[var(--landing-accent)]">Click to {expandedFolder ? 'collapse' : 'expand'}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[var(--landing-text-primary)] flex items-center gap-2">
                    <span className="text-[var(--landing-accent)]">📁</span>
                    <span>dashboard/</span>
                  </div>
                  {expandedFolder && (
                    <div className="pl-4 space-y-1 text-[var(--landing-text-secondary)] border-l border-[var(--landing-border)] ml-2">
                      <div className="hover:text-[var(--landing-accent)]">📄 MetricCard.tsx</div>
                      <div className="hover:text-[var(--landing-accent)]">📄 ActivityStream.tsx</div>
                      <div className="hover:text-[var(--landing-accent)]">📄 DataGrid.tsx</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Monaco Editor Inspection (5 Cols) */}
          <Reveal className="md:col-span-5" delayMs={100}>
            <div className="h-full p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)]">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--landing-text-primary)]">
                  Monaco code inspection
                </h3>
                <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                  Deep integration with the Monaco editor gives you full TypeScript autocomplete, lint diagnostics, and instant manual overrides.
                </p>
              </div>

              {/* Mini Syntax Highlighted Block */}
              <div className="mt-6 p-3 rounded-[var(--landing-radius-md)] bg-[#0E0E10] border border-[var(--landing-border)] font-mono text-[11px] text-[var(--landing-text-secondary)] leading-relaxed space-y-1">
                <div><span className="text-[var(--landing-accent)]">export type</span> UserRole = <span className="text-amber-300">'owner'</span> | <span className="text-amber-300">'editor'</span>;</div>
                <div><span className="text-[var(--landing-accent)]">const</span> isPermitted = (role: UserRole) =&gt; role !== <span className="text-amber-300">'viewer'</span>;</div>
              </div>
            </div>
          </Reveal>

          {/* Card 3: Real-Time Streaming Progress (4 Cols) */}
          <Reveal className="md:col-span-4" delayMs={150}>
            <div className="h-full p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)]">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--landing-text-primary)]">
                  Real-time streaming
                </h3>
                <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                  Monitor the distributed pipeline through live WebSocket and SSE telemetry streams.
                </p>
              </div>

              {/* Streaming Log Simulation */}
              <div className="mt-6 p-2.5 rounded-[var(--landing-radius-md)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] font-mono text-[10px] space-y-1">
                <div className="text-[var(--landing-text-muted)] text-[9px]">SAMPLE STREAM</div>
                <div className="text-[var(--landing-accent)]">&gt; worker-plan: resolved 8 files</div>
                <div className="text-[var(--landing-success)]">&gt; compiler: 0 type errors</div>
              </div>
            </div>
          </Reveal>

          {/* Card 4: Multi-Role Team Deployment (4 Cols) */}
          <Reveal className="md:col-span-4" delayMs={200}>
            <div className="h-full p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)]">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--landing-text-primary)]">
                  Multi-role team deployment
                </h3>
                <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                  Collaborative workspaces supporting Owner, Editor, and Viewer permission boundaries.
                </p>
              </div>

              {/* Role Chips */}
              <div className="mt-6 flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-1 rounded bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-text-primary)]">
                  Owner
                </span>
                <span className="px-2 py-1 rounded bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-accent)] font-medium">
                  Editor
                </span>
                <span className="px-2 py-1 rounded bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-text-muted)]">
                  Viewer
                </span>
              </div>
            </div>
          </Reveal>

          {/* Card 5: Strict TypeScript & Standards (4 Cols) */}
          <Reveal className="md:col-span-4" delayMs={250}>
            <div className="h-full p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-2)] border border-[var(--landing-border)] flex items-center justify-center text-[var(--landing-accent)]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--landing-text-primary)]">
                  Typed, readable output
                </h3>
                <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                  Strict type boundaries and ARIA accessibility primitives baked into every generated component.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[var(--landing-border)] flex items-center justify-between text-[11px] font-mono text-[var(--landing-text-muted)]">
                <span>TypeScript strict: true</span>
                <span className="text-[var(--landing-success)] font-medium">WCAG 2.1 AA</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
