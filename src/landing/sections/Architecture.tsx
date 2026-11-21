import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';

export const Architecture: React.FC = () => {
  return (
    <section id="architecture" className="py-20 sm:py-28 border-t border-[var(--landing-border)] bg-[var(--landing-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <Reveal>
          <SectionHeading
            eyebrow="under the hood"
            title="real microservices, zero monolith chaos"
            highlightWord="microservices"
            description="every project runs on isolated kubernetes sandbox runners with dedicated storage and fast websocket pipelines."
          />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Plain Language Explanation */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <h3
              className="text-2xl font-bold text-[var(--landing-text-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              how your code actually gets built
            </h3>
            <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
              when you send a prompt, our gateway routes it to an AI planner that breaks down the project structure into clean react components.
            </p>
            <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
              isolated sandbox pods compile your dependencies, write files into MinIO storage, and stream preview updates back to your browser in milliseconds.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-text-primary)]">
                k8s sandbox pods
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--landing-accent)] text-[#090D0F] font-bold">
                minIO artifacts
              </span>
              <span className="px-3 py-1 rounded-full bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-text-primary)]">
                redis pub/sub
              </span>
            </div>
          </div>

          {/* Right: Restyled Inline-SVG with Chunky Pill Nodes & Lime Dashes */}
          <div className="lg:col-span-7">
            <div
              className="p-5 sm:p-7 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border-2 border-[var(--landing-border)] shadow-xl overflow-hidden"
              aria-label="Microservice architecture packet flow diagram"
            >
              <div className="sr-only">
                Browser Client communicates through API Gateway to AI Orchestrator and Workspace K8s pods, which stream live preview to the browser and save artifacts to MinIO.
              </div>

              <svg
                viewBox="0 0 640 340"
                className="w-full h-auto select-none"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="v2-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--landing-accent)" />
                  </marker>
                </defs>

                {/* Packet flow lines */}
                <path
                  d="M 120 170 L 220 170"
                  stroke="var(--landing-accent)"
                  strokeWidth="3"
                  className="landing-flow-anim"
                  markerEnd="url(#v2-arrow)"
                />
                <path
                  d="M 310 150 L 390 90"
                  stroke="var(--landing-border-strong)"
                  strokeWidth="2"
                  className="landing-flow-anim"
                  markerEnd="url(#v2-arrow)"
                />
                <path
                  d="M 310 190 L 390 250"
                  stroke="var(--landing-accent)"
                  strokeWidth="3"
                  className="landing-flow-anim"
                  markerEnd="url(#v2-arrow)"
                />
                <path
                  d="M 490 270 L 540 300"
                  stroke="var(--landing-border-strong)"
                  strokeWidth="2"
                  className="landing-flow-anim"
                  markerEnd="url(#v2-arrow)"
                />
                <path
                  d="M 490 230 L 540 190"
                  stroke="var(--landing-accent)"
                  strokeWidth="3"
                  className="landing-flow-anim"
                  markerEnd="url(#v2-arrow)"
                />

                {/* Node 1: Browser Client */}
                <g transform="translate(30, 140)">
                  <rect
                    width="90"
                    height="60"
                    rx="30"
                    fill="var(--landing-surface-2)"
                    stroke="var(--landing-border-strong)"
                    strokeWidth="2"
                  />
                  <text x="45" y="32" textAnchor="middle" fill="var(--landing-text-primary)" fontSize="11" fontFamily="var(--font-display)" fontWeight="700">Client</text>
                  <text x="45" y="46" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="9" fontFamily="monospace">Browser</text>
                </g>

                {/* Node 2: Gateway */}
                <g transform="translate(220, 140)">
                  <rect
                    width="90"
                    height="60"
                    rx="30"
                    fill="var(--landing-accent)"
                    stroke="#090D0F"
                    strokeWidth="2"
                  />
                  <text x="45" y="32" textAnchor="middle" fill="#090D0F" fontSize="12" fontFamily="var(--font-display)" fontWeight="800">Gateway</text>
                  <text x="45" y="46" textAnchor="middle" fill="#243037" fontSize="9" fontFamily="monospace">Auth / WSS</text>
                </g>

                {/* Node 3: AI Service */}
                <g transform="translate(390, 60)">
                  <rect
                    width="100"
                    height="60"
                    rx="30"
                    fill="var(--landing-surface-2)"
                    stroke="var(--landing-border-strong)"
                    strokeWidth="2"
                  />
                  <text x="50" y="32" textAnchor="middle" fill="var(--landing-text-primary)" fontSize="11" fontFamily="var(--font-display)" fontWeight="700">AI Planner</text>
                  <text x="50" y="46" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="9" fontFamily="monospace">Synthesis</text>
                </g>

                {/* Node 4: Workspace K8s */}
                <g transform="translate(390, 220)">
                  <rect
                    width="100"
                    height="60"
                    rx="30"
                    fill="var(--landing-surface-2)"
                    stroke="var(--landing-accent)"
                    strokeWidth="2"
                  />
                  <text x="50" y="32" textAnchor="middle" fill="var(--landing-accent)" fontSize="11" fontFamily="var(--font-display)" fontWeight="700">Workspace</text>
                  <text x="50" y="46" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="9" fontFamily="monospace">K8s Pods</text>
                </g>

                {/* Node 5: MinIO Storage */}
                <g transform="translate(540, 270)">
                  <rect
                    width="85"
                    height="50"
                    rx="25"
                    fill="var(--landing-surface-3)"
                    stroke="var(--landing-border-strong)"
                    strokeWidth="1.5"
                  />
                  <text x="42.5" y="27" textAnchor="middle" fill="var(--landing-text-primary)" fontSize="10" fontFamily="var(--font-display)" fontWeight="700">MinIO</text>
                  <text x="42.5" y="39" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="8" fontFamily="monospace">Storage</text>
                </g>

                {/* Node 6: Preview Runner */}
                <g transform="translate(540, 150)">
                  <rect
                    width="85"
                    height="50"
                    rx="25"
                    fill="var(--landing-surface-3)"
                    stroke="var(--landing-accent)"
                    strokeWidth="2"
                  />
                  <text x="42.5" y="27" textAnchor="middle" fill="var(--landing-text-primary)" fontSize="10" fontFamily="var(--font-display)" fontWeight="700">Preview</text>
                  <text x="42.5" y="39" textAnchor="middle" fill="var(--landing-accent)" fontSize="8" fontFamily="monospace">Runner</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
