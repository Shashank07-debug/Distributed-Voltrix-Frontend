import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowRight,
  Terminal,
  Layers,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Presentational Hero Workbench Preview.
 * Pure static mockup with no API calls, no Monaco dependency, and no fake performance figures.
 */
const HeroWorkbenchPreview: React.FC = () => {
  return (
    <div className="w-full rounded-xl border border-border-subtle bg-surface-panel overflow-hidden shadow-2xl">
      {/* Top Window Chrome */}
      <div className="h-10 px-4 bg-surface-raised border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="ml-2 font-mono text-xs text-text-tertiary">
            voltrix-workspace: metrics-dashboard
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] bg-accent-teal-subtle text-accent-teal border border-accent-teal/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
            ready
          </span>
        </div>
      </div>

      {/* Prompt Instruction Bar */}
      <div className="px-4 py-2.5 bg-surface-base/80 border-b border-border-subtle flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-text-secondary truncate">
          <span className="text-accent-teal font-semibold">$</span>
          <span className="text-text-primary truncate">
            voltrix generate "Real-time metrics dashboard with telemetry stream"
          </span>
        </div>
        <span className="text-[11px] text-text-tertiary hidden sm:inline font-mono">
          [synced]
        </span>
      </div>

      {/* Editor & Preview Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px]">
        {/* Left: Static Syntax Highlighted Code Editor */}
        <div className="md:col-span-6 bg-surface-base p-4 border-b md:border-b-0 md:border-r border-border-subtle font-mono text-[11px] leading-relaxed text-text-secondary select-none overflow-x-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle text-[11px] text-text-tertiary">
            <span>src/Dashboard.tsx</span>
            <span className="text-[10px] text-text-tertiary">TypeScript React</span>
          </div>
          <div className="space-y-1">
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">1</span>
              <span><span className="text-accent-teal">import</span> {'{'} useStream {'}'} <span className="text-accent-teal">from</span> <span className="text-emerald-400">'@voltrix/stream'</span>;</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">2</span>
              <span><span className="text-accent-teal">import</span> {'{'} MetricsCard {'}'} <span className="text-accent-teal">from</span> <span className="text-emerald-400">'./MetricsCard'</span>;</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">3</span>
              <span className="text-text-tertiary">// Generated application component</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">4</span>
              <span><span className="text-accent-teal">export function</span> <span className="text-white font-medium">Dashboard</span>() {'{'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">5</span>
              <span>  <span className="text-accent-teal">const</span> {'{'} telemetry, status {'}'} = <span className="text-white">useStream</span>(<span className="text-emerald-400">'/api/telemetry'</span>);</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">6</span>
              <span>  <span className="text-accent-teal">return</span> (</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">7</span>
              <span>    &lt;<span className="text-accent-teal">div</span> <span className="text-text-secondary">className</span>=<span className="text-emerald-400">"grid grid-cols-2 gap-3"</span>&gt;</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">8</span>
              <span>      &lt;<span className="text-white">MetricsCard</span> <span className="text-text-secondary">label</span>=<span className="text-emerald-400">"Active Nodes"</span> <span className="text-text-secondary">value</span>={'{'}telemetry.nodes{'}'} /&gt;</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">9</span>
              <span>      &lt;<span className="text-white">MetricsCard</span> <span className="text-text-secondary">label</span>=<span className="text-emerald-400">"Throughput"</span> <span className="text-text-secondary">value</span>={'{'}telemetry.ops{'}'} /&gt;</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">10</span>
              <span>    &lt;/<span className="text-accent-teal">div</span>&gt;</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">11</span>
              <span>  );</span>
            </div>
            <div className="flex gap-3">
              <span className="text-text-tertiary w-5 text-right shrink-0">12</span>
              <span>{'}'}</span>
            </div>
          </div>
        </div>

        {/* Right: Live Preview Panel */}
        <div className="md:col-span-6 bg-surface-panel p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle text-[11px] text-text-tertiary font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                preview: localhost:5173
              </span>
              <ExternalLink className="w-3 h-3 text-text-tertiary" />
            </div>

            {/* Mini Dashboard Rendered Output */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-text-primary">System Telemetry</h4>
                  <p className="text-[11px] text-text-tertiary">Real-time node status</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <Check className="w-3 h-3" /> healthy
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 min-w-0">
                <div className="p-2 rounded-lg bg-surface-base border border-border-subtle min-w-0">
                  <div className="text-[10px] text-text-tertiary uppercase font-mono truncate">Active Nodes</div>
                  <div className="text-sm sm:text-base font-semibold text-text-primary mt-0.5">64</div>
                  <div className="text-[10px] text-accent-teal mt-0.5 font-mono truncate">operational</div>
                </div>
                <div className="p-2 rounded-lg bg-surface-base border border-border-subtle min-w-0">
                  <div className="text-[10px] text-text-tertiary uppercase font-mono truncate">Throughput</div>
                  <div className="text-sm sm:text-base font-semibold text-text-primary mt-0.5">14.2k</div>
                  <div className="text-[10px] text-text-secondary mt-0.5 font-mono truncate">events / sec</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-base border border-border-subtle font-mono text-[11px] space-y-1">
                <div className="text-[10px] text-text-tertiary uppercase mb-1">Recent Execution</div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>worker-pool-ingress</span>
                  <span className="text-text-tertiary">ready</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>sse-stream-router</span>
                  <span className="text-text-tertiary">connected</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-border-subtle flex items-center justify-between font-mono text-[10px] text-text-tertiary">
            <span>Branch: main</span>
            <span>TypeScript 5.x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Initialize Lenis Smooth Scrolling
      const lenis = new Lenis({
        duration: 1.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Connect Lenis to GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);

      // GSAP Hero Text Reveal
      if (heroTextRef.current) {
        gsap.fromTo(
          heroTextRef.current.children,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
        );
      }

      // GSAP ScrollTrigger Feature Section
      if (featureSectionRef.current) {
        gsap.fromTo(
          '.feature-card-item',
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featureSectionRef.current,
              start: 'top 85%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      return () => {
        lenis.destroy();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-surface-base text-text-primary">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div ref={heroTextRef} className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised border border-border-subtle text-text-secondary text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
              <span>Autonomous Application Generation</span>
            </div>

            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] text-text-primary">
              Describe your vision.
              <span className="block text-text-secondary font-normal mt-1">Voltrix builds the code.</span>
            </h1>

            <p className="text-sm sm:text-base text-text-secondary max-w-lg leading-relaxed">
              Transform natural language prompts into live, production-grade applications. Instant file trees, Monaco editor inspection, and multi-role team deployment in real time.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/signup"
                className="min-h-[44px] px-5 rounded-md bg-text-primary text-surface-base hover:bg-white text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>Launch App Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <a
                href="#features"
                className="min-h-[44px] px-4 rounded-md border border-border-subtle bg-surface-panel hover:bg-surface-raised hover:border-border-hover text-text-secondary hover:text-text-primary text-xs font-mono transition-colors flex items-center justify-center"
              >
                Explore Architecture
              </a>
            </div>
          </div>

          {/* Right Column: Presentational Workbench Preview */}
          <div className="lg:col-span-7">
            <HeroWorkbenchPreview />
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section id="features" ref={featureSectionRef} className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-subtle">
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="text-xs font-mono text-accent-teal uppercase tracking-wider">Architecture</div>
          <h2 className="font-sans text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            Engineered for developer velocity
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Voltrix bridges the gap between natural language intention and compiled source code through streaming execution pipelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="feature-card-item rounded-xl p-6 bg-surface-panel border border-border-subtle hover:border-border-hover transition-colors space-y-4">
            <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center text-text-primary">
              <Terminal className="w-5 h-5 text-accent-teal" />
            </div>
            <h3 className="font-sans text-base font-semibold text-text-primary">Streaming SSE Pipeline</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Watch code generation unfold stream-by-stream with structured reasoning logs, incremental file edits, and real-time execution feedback.
            </p>
          </div>

          <div className="feature-card-item rounded-xl p-6 bg-surface-panel border border-border-subtle hover:border-border-hover transition-colors space-y-4">
            <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center text-text-primary">
              <Layers className="w-5 h-5 text-accent-teal" />
            </div>
            <h3 className="font-sans text-base font-semibold text-text-primary">Integrated Workspace Layout</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Full developer workstation featuring prompt instruction on the left, Monaco editor in the center, and live sandboxed preview on the right.
            </p>
          </div>

          <div className="feature-card-item rounded-xl p-6 bg-surface-panel border border-border-subtle hover:border-border-hover transition-colors space-y-4">
            <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center text-text-primary">
              <ShieldCheck className="w-5 h-5 text-accent-teal" />
            </div>
            <h3 className="font-sans text-base font-semibold text-text-primary">Role-Based Access</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Collaborate securely across Owner, Editor, and Viewer permission levels with granular prompt execution and deployment controls.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="rounded-xl p-6 sm:p-12 bg-surface-panel border border-border-subtle text-center space-y-5">
          <h2 className="font-sans text-2xl sm:text-3xl font-semibold text-text-primary">
            Ready to build with Voltrix?
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
            Transform natural language descriptions into live web applications with instant sandboxed execution.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-md bg-text-primary text-surface-base hover:bg-white text-xs font-medium transition-colors w-full sm:w-auto"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
