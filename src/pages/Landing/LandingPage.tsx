import React, { useEffect, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  Zap,
  Sparkles,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Code,
  Globe,
  Rocket,
  CheckCircle2,
} from 'lucide-react';
import { WebGLFallback } from '../../components/canvas/WebGLFallback';

// Lazy-load Three.js 3D Hero Canvas for maximum performance code-splitting
const HeroCanvas = React.lazy(() => import('../../components/canvas/HeroCanvas'));

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const featureSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect reduced motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // 1. Initialize Lenis Smooth Scrolling
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
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

      // 2. GSAP Hero Text Reveal
      if (heroTextRef.current) {
        gsap.fromTo(
          heroTextRef.current.children,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
        );
      }

      // 3. GSAP ScrollTrigger Feature Section Pinning / Transform
      if (featureSectionRef.current) {
        gsap.fromTo(
          '.feature-card-item',
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.2,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: featureSectionRef.current,
              start: 'top 80%',
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
    <div ref={containerRef} className="relative min-h-screen bg-[#070709] text-white overflow-hidden">
      {/* Background Subtle Grain */}
      <div className="absolute inset-0 bg-noise pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div ref={heroTextRef} className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-voltrix-violet/15 border border-voltrix-violet/30 text-voltrix-cyan text-xs font-mono tracking-wide shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Zap className="w-3.5 h-3.5 text-voltrix-cyan animate-pulse" />
              <span>Awwwards-Caliber Autonomous AI Builder</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Describe Your Vision.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-voltrix-violet via-voltrix-cyan to-voltrix-highlight">
                Voltrix
              </span>{' '}
              Builds The Code.
            </h1>

            <p className="text-sm sm:text-base text-voltrix-muted max-w-xl leading-relaxed">
              Transform natural language prompts into live, production-grade applications. Instant file trees, Monaco editor inspection, and multi-role team deployment in real time.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-voltrix-violet via-voltrix-cyan to-voltrix-violet bg-[length:200%_auto] text-white font-display font-semibold text-sm shadow-[0_0_35px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] transition-all hover:scale-105 flex items-center gap-2 group"
              >
                <span>Launch App Builder</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#features"
                className="px-6 py-4 rounded-2xl bg-voltrix-card hover:bg-voltrix-card-hover border border-voltrix-border text-xs font-mono font-medium text-gray-300 hover:text-white transition-all"
              >
                Explore Engine Architecture
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-4 font-mono text-xs text-voltrix-muted">
              <div>
                <span className="font-display text-xl font-bold text-white block">60 FPS</span>
                <span>Shader WebGL Engine</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold text-white block">&lt; 100ms</span>
                <span>Streaming Latency</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold text-white block">100%</span>
                <span>Sandboxed Preview</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive WebGL Canvas */}
          <div className="lg:col-span-5 h-[480px] sm:h-[540px] relative rounded-3xl overflow-hidden glass-panel border border-voltrix-border shadow-[0_0_50px_rgba(139,92,246,0.2)]">
            <Suspense fallback={<WebGLFallback variant="hero" />}>
              <HeroCanvas />
            </Suspense>

            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-voltrix-card/90 border border-voltrix-border backdrop-blur-md flex items-center justify-between text-xs font-mono">
              <span className="text-voltrix-cyan flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                3D Neural Mesh Online
              </span>
              <span className="text-gray-400">Drag to rotate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Strip */}
      <div className="py-6 border-y border-voltrix-border bg-[#0D0E15]/60 backdrop-blur-md overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee font-mono text-xs text-voltrix-muted tracking-widest uppercase gap-12">
          <span>⚡ REACT 18 + VITE + TYPESCRIPT</span>
          <span>⚡ MONACO READ-ONLY CODE INSPECTOR</span>
          <span>⚡ REAL-TIME SSE STREAMING</span>
          <span>⚡ THREE.JS WEBGL MESH SCENE</span>
          <span>⚡ GSAP SCROLL TRIGGER STORYTELLING</span>
          <span>⚡ MULTI-ROLE TEAM COLLABORATION</span>
          <span>⚡ REACT 18 + VITE + TYPESCRIPT</span>
          <span>⚡ MONACO READ-ONLY CODE INSPECTOR</span>
        </div>
      </div>

      {/* Features Showcase Section */}
      <section id="features" ref={featureSectionRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Engineered For Pure Developer Velocity
          </h2>
          <p className="text-xs sm:text-sm text-voltrix-muted">
            Voltrix bridges the gap between natural language intention and compiled source code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card-item rounded-3xl p-8 glass-panel-interactive border border-voltrix-border space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-voltrix-violet/20 border border-voltrix-violet/40 flex items-center justify-center text-voltrix-violet-light">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">Autonomous SSE Stream</h3>
            <p className="text-xs text-voltrix-muted leading-relaxed">
              Watch code generation unfold stream-by-stream. Handles THOUGHT breakdowns, FILE_EDIT triggers, and TOOL_LOG executions.
            </p>
          </div>

          <div className="feature-card-item rounded-3xl p-8 glass-panel-interactive border border-voltrix-border space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-voltrix-cyan/20 border border-voltrix-cyan/40 flex items-center justify-center text-voltrix-cyan">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">3-Pane Workspace Layout</h3>
            <p className="text-xs text-voltrix-muted leading-relaxed">
              Linear-density design featuring prompt chat on the left, Monaco file editor in the center, and live sandboxed preview iframe on the right.
            </p>
          </div>

          <div className="feature-card-item rounded-3xl p-8 glass-panel-interactive border border-voltrix-border space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-voltrix-highlight/20 border border-voltrix-highlight/40 flex items-center justify-center text-voltrix-highlight">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">Role-Based Access</h3>
            <p className="text-xs text-voltrix-muted leading-relaxed">
              Manage collaborators with OWNER, EDITOR, and VIEWER roles. Restrict prompt execution and deployment permissions seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 relative">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-voltrix-card via-[#141622] to-voltrix-card border border-voltrix-violet/40 shadow-[0_0_60px_rgba(139,92,246,0.25)] text-center space-y-6">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
            Ready to build at the speed of thought?
          </h2>
          <p className="text-xs sm:text-sm text-voltrix-muted max-w-xl mx-auto">
            Join thousands of developers turning ideas into live production code with Voltrix AI.
          </p>
          <div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white font-display font-semibold text-sm shadow-xl hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Start Building Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
