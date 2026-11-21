import React from 'react';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Server, Database, Globe, Cpu, Radio, Box } from 'lucide-react';

export const Architecture: React.FC = () => {
  return (
    <section id="architecture" className="py-16 sm:py-24 border-t border-[var(--landing-border)] bg-[var(--landing-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <Reveal>
          <SectionHeading
            eyebrow="Distributed Infrastructure"
            title="Built as services, not a monolith"
            description="Voltrix distributes generation workloads across independent Kubernetes pods with MinIO artifact storage and WebSocket streaming."
          />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Descriptive text */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <h3 className="text-xl font-semibold text-[var(--landing-text-primary)]">
              Isolated sandboxes &amp; microservice dispatch
            </h3>
            <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
              When a user submits a prompt, the API Gateway authenticates the request and passes it to the AI Orchestrator service. Workspaces are dynamically provisioned in Kubernetes clusters with dedicated storage volumes.
            </p>
            <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
              Code artifacts compile inside lightweight containerized preview runners, isolating user code from the host system while streaming output directly to the Monaco editor.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-text-primary)]">
                Kubernetes Pods
              </span>
              <span className="px-2.5 py-1 rounded bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-accent)]">
                MinIO Object Storage
              </span>
              <span className="px-2.5 py-1 rounded bg-[var(--landing-surface-2)] border border-[var(--landing-border)] text-[var(--landing-text-primary)]">
                Redis Pub/Sub
              </span>
            </div>
          </div>

          {/* Right Column: Inline SVG Architecture Diagram */}
          <div className="lg:col-span-7">
            <div
              className="p-4 sm:p-6 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] shadow-xl overflow-hidden"
              aria-label="Microservices architecture diagram showing packet flow from Browser Client to API Gateway, AI Service, Workspace Runner, MinIO Storage, and Live Preview"
            >
              <div className="sr-only">
                Diagram: Client connects to API Gateway over HTTPS and WSS. Gateway routes requests to AI Service and Workspace Runner. Workspace Runner writes artifacts to MinIO storage and streams live DOM to the Live Preview runner.
              </div>

              <svg
                viewBox="0 0 640 360"
                className="w-full h-auto select-none"
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="arch-arrow"
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
                {/* 1. Client to Gateway */}
                <path
                  d="M 120 180 L 220 180"
                  stroke="var(--landing-accent)"
                  strokeWidth="2"
                  className="landing-flow-anim"
                  markerEnd="url(#arch-arrow)"
                />
                {/* 2. Gateway to AI Service */}
                <path
                  d="M 310 160 L 390 100"
                  stroke="var(--landing-border-strong)"
                  strokeWidth="1.5"
                  className="landing-flow-anim"
                  markerEnd="url(#arch-arrow)"
                />
                {/* 3. Gateway to Workspace Service */}
                <path
                  d="M 310 200 L 390 260"
                  stroke="var(--landing-accent)"
                  strokeWidth="2"
                  className="landing-flow-anim"
                  markerEnd="url(#arch-arrow)"
                />
                {/* 4. Workspace Service to MinIO */}
                <path
                  d="M 480 280 L 530 310"
                  stroke="var(--landing-border-strong)"
                  strokeWidth="1.5"
                  className="landing-flow-anim"
                  markerEnd="url(#arch-arrow)"
                />
                {/* 5. Workspace Service to Preview */}
                <path
                  d="M 480 240 L 530 200"
                  stroke="var(--landing-accent)"
                  strokeWidth="2"
                  className="landing-flow-anim"
                  markerEnd="url(#arch-arrow)"
                />

                {/* Node 1: Browser Client */}
                <g transform="translate(30, 150)">
                  <rect
                    width="90"
                    height="60"
                    rx="8"
                    fill="var(--landing-surface-2)"
                    stroke="var(--landing-border)"
                    strokeWidth="1"
                  />
                  <text x="45" y="32" textAnchor="middle" fill="var(--landing-text-primary)" fontSize="11" fontFamily="sans-serif" fontWeight="600">Client</text>
                  <text x="45" y="46" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="9" fontFamily="monospace">Browser</text>
                </g>

                {/* Node 2: Gateway */}
                <g transform="translate(220, 150)">
                  <rect
                    width="90"
                    height="60"
                    rx="8"
                    fill="var(--landing-surface-2)"
                    stroke="var(--landing-accent)"
                    strokeWidth="1"
                  />
                  <text x="45" y="32" textAnchor="middle" fill="var(--landing-accent)" fontSize="11" fontFamily="sans-serif" fontWeight="600">Gateway</text>
                  <text x="45" y="46" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="9" fontFamily="monospace">Auth / WSS</text>
                </g>

                {/* Node 3: AI Service */}
                <g transform="translate(390, 70)">
                  <rect
                    width="90"
                    height="60"
                    rx="8"
                    fill="var(--landing-surface-2)"
                    stroke="var(--landing-border)"
                    strokeWidth="1"
                  />
                  <text x="45" y="32" textAnchor="middle" fill="var(--landing-text-primary)" fontSize="11" fontFamily="sans-serif" fontWeight="600">AI Service</text>
                  <text x="45" y="46" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="9" fontFamily="monospace">Orchestrator</text>
                </g>

                {/* Node 4: Workspace Service */}
                <g transform="translate(390, 230)">
                  <rect
                    width="90"
                    height="60"
                    rx="8"
                    fill="var(--landing-surface-2)"
                    stroke="var(--landing-accent)"
                    strokeWidth="1.5"
                  />
                  <text x="45" y="32" textAnchor="middle" fill="var(--landing-accent)" fontSize="11" fontFamily="sans-serif" fontWeight="600">Workspace</text>
                  <text x="45" y="46" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="9" fontFamily="monospace">K8s Pods</text>
                </g>

                {/* Node 5: MinIO Storage */}
                <g transform="translate(530, 280)">
                  <rect
                    width="90"
                    height="60"
                    rx="8"
                    fill="var(--landing-surface-3)"
                    stroke="var(--landing-border)"
                    strokeWidth="1"
                  />
                  <text x="45" y="32" textAnchor="middle" fill="var(--landing-text-primary)" fontSize="11" fontFamily="sans-serif" fontWeight="600">MinIO</text>
                  <text x="45" y="46" textAnchor="middle" fill="var(--landing-text-muted)" fontSize="9" fontFamily="monospace">Artifacts</text>
                </g>

                {/* Node 6: Preview Runner */}
                <g transform="translate(530, 160)">
                  <rect
                    width="90"
                    height="60"
                    rx="8"
                    fill="var(--landing-surface-3)"
                    stroke="var(--landing-accent)"
                    strokeWidth="1"
                  />
                  <text x="45" y="32" textAnchor="middle" fill="var(--landing-text-primary)" fontSize="11" fontFamily="sans-serif" fontWeight="600">Preview</text>
                  <text x="45" y="46" textAnchor="middle" fill="var(--landing-accent)" fontSize="9" fontFamily="monospace">Runner</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
