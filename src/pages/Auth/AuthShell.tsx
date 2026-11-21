/**
 * AuthShell — V5.1 Gen Z redesign.
 *
 * Token source: src/landing/tokens.css (--landing-* vars, .landing-sticker, .landing-squiggle-anim)
 * Fonts: Space Grotesk (display), Plus Jakarta Sans (sans), JetBrains Mono (mono) — loaded in index.html
 *
 * Desktop ≥900px: 2 columns. Left = form column. Right = brand panel.
 * Mobile <900px: single column, brand panel hidden.
 * Navbar-lite: logo left, "Back to home" right.
 * Layout: min-h-[100dvh], env(safe-area-inset-*), no horizontal scroll.
 * Fade-in: 200ms opacity + translateY via .page-route-transition class (defined in tokens.css).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/Logo';
import '../../landing/tokens.css';

/* ─── Squiggle — same path as the landing Squiggle component ─────────────── */
const Squiggle: React.FC = () => (
  <svg
    viewBox="0 0 140 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%' }}
    className="absolute left-0 -bottom-2 h-4 pointer-events-none overflow-visible landing-squiggle-anim"
    aria-hidden="true"
  >
    <path
      d="M 2 9 C 25 3, 45 15, 70 8 C 95 2, 115 16, 138 9"
      stroke="var(--landing-accent)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Landing sticker (exact .landing-sticker class from tokens.css) ───────── */
const Sticker: React.FC<{
  children: React.ReactNode;
  variant?: 'lime' | 'coral';
  rotate?: number;
}> = ({ children, variant = 'lime', rotate = 0 }) => {
  const colors =
    variant === 'lime'
      ? 'bg-[var(--landing-accent)] text-[#090D0F] border-[#090D0F]'
      : 'bg-[var(--landing-pop-coral)] text-white border-[#090D0F]';
  return (
    <span
      className={`landing-sticker ${colors}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
};

/* ─── Static mini code editor — matches landing hero demo style ─────────────── */
const MiniEditorVisual: React.FC = () => (
  <div className="w-full rounded-xl border border-[var(--landing-border)] bg-[var(--landing-bg-ink)] overflow-hidden font-mono text-[11px] select-none shadow-2xl">
    {/* Window chrome */}
    <div className="h-9 px-3 bg-[var(--landing-surface-1)] border-b border-[var(--landing-border)] flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        <span className="ml-2 text-[10px] text-[var(--landing-text-secondary)]">app.tsx</span>
      </div>
      {/* Deployed badge — matches landing hero "ready" badge */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] border border-[var(--landing-accent)]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--landing-accent)]" />
        deployed
      </span>
    </div>
    {/* Code lines — same color scheme as landing hero */}
    <div className="px-4 py-3 space-y-1 leading-relaxed text-[var(--landing-text-secondary)]">
      {[
        { n: 1, parts: [{ t: 'import', c: '#9BA6AD' }, { t: ' { useVoltrix }', c: '#9BA6AD' }, { t: " from", c: '#9BA6AD' }, { t: " 'voltrix'", c: '#10B981' }] },
        { n: 2, parts: [] },
        { n: 3, parts: [{ t: 'export function', c: '#9BA6AD' }, { t: ' App', c: '#F8F9FA' }, { t: '() {', c: '#9BA6AD' }] },
        { n: 4, parts: [{ t: '  const', c: '#9BA6AD' }, { t: ' { build } = ', c: '#9BA6AD' }, { t: 'useVoltrix', c: '#F8F9FA' }, { t: '();', c: '#9BA6AD' }] },
        { n: 5, parts: [{ t: '  return', c: '#9BA6AD' }, { t: ' <App />', c: '#D4FF32' }] },
        { n: 6, parts: [{ t: '}', c: '#9BA6AD' }] },
      ].map(({ n, parts }) => (
        <div key={n} className="flex gap-3">
          <span className="text-[var(--landing-text-secondary)] opacity-30 w-4 text-right shrink-0">{n}</span>
          <span>
            {parts.length === 0
              ? <>&nbsp;</>
              : parts.map((p, i) => <span key={i} style={{ color: p.c }}>{p.t}</span>)}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Brand panel (right column, ≥900px) ──────────────────────────────────── */
const BrandPanel: React.FC = () => (
  <div className="relative flex flex-col justify-between h-full px-10 py-12 overflow-hidden bg-[var(--landing-surface-1)]">
    {/* Subtle grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 0v1H0V0h32zM0 0v32h1V0H0z' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")",
      }}
      aria-hidden="true"
    />
    {/* Noise grain */}
    <div
      className="absolute inset-0 opacity-[0.03] pointer-events-none hidden md:block"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
      aria-hidden="true"
    />
    {/* Subtle lime glow */}
    <div
      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full opacity-[0.07] pointer-events-none"
      style={{ background: 'radial-gradient(circle, #D4FF32 0%, transparent 70%)' }}
      aria-hidden="true"
    />

    {/* Logo */}
    <div className="relative z-10">
      <Logo variant="full" size={26} />
    </div>

    {/* Middle: tagline + stickers + editor */}
    <div className="relative z-10 space-y-6">
      {/* Tagline with squiggle on "vision" */}
      <div>
        <p className="font-display font-semibold text-[26px] leading-snug text-[var(--landing-text-primary)] tracking-tight">
          describe your{' '}
          <span className="relative inline-block">
            vision
            <Squiggle />
          </span>
          .
          <br />
          <span className="text-[var(--landing-text-secondary)] font-medium text-xl">
            voltrix builds the code.
          </span>
        </p>
      </div>

      {/* Stickers — above editor, never overlapping */}
      <div className="flex flex-wrap gap-2">
        <Sticker variant="lime" rotate={-2}>no setup required</Sticker>
        <Sticker variant="coral" rotate={1}>monaco included</Sticker>
      </div>

      {/* Product visual */}
      <MiniEditorVisual />
    </div>

    {/* Bottom wordmark */}
    <p className="relative z-10 font-mono text-[11px] text-[var(--landing-text-secondary)] opacity-40 mt-6">
      voltrix.ai · autonomous app builder
    </p>
  </div>
);

/* ─── Shell props ─────────────────────────────────────────────────────────── */
export interface AuthShellProps {
  children: React.ReactNode;
  serverError?: string | null;
}

/* ─── AuthShell ───────────────────────────────────────────────────────────── */
export const AuthShell: React.FC<AuthShellProps> = ({ children, serverError }) => {
  return (
    <div
      className="page-route-transition min-h-[100dvh] w-full flex flex-col bg-[var(--landing-bg-ink)] text-[var(--landing-text-primary)] overflow-x-hidden"
      style={{
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ── Navbar-lite ──────────────────────────────────────────────────── */}
      <header className="shrink-0 w-full px-5 sm:px-8 h-14 flex items-center justify-between border-b border-[var(--landing-border)]">
        <Link
          to="/"
          className="inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)]"
          aria-label="Voltrix home"
        >
          <Logo variant="full" size={22} />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent-ring)] px-1 interactive-motion"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Back to home
        </Link>
      </header>

      {/* ── Two-column body ───────────────────────────────────────────────── */}
      <div className="flex-1 w-full grid grid-cols-1 min-[900px]:grid-cols-2">
        {/* Left: form column */}
        <div className="flex flex-col items-center justify-center px-5 sm:px-10 py-10 min-[900px]:py-16">
          <div className="w-full max-w-[440px] space-y-5">
            {/* Server error banner */}
            {serverError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm leading-relaxed"
              >
                {serverError}
              </div>
            )}
            {children}
          </div>

          {/* Privacy & terms */}
          <p className="mt-10 text-[11px] text-[var(--landing-text-secondary)] opacity-50 text-center">
            By continuing you agree to our{' '}
            <a href="/privacy" className="underline underline-offset-2 hover:opacity-100 transition-opacity">Privacy</a>
            {' '}&amp;{' '}
            <a href="/terms" className="underline underline-offset-2 hover:opacity-100 transition-opacity">Terms</a>
            .
          </p>
        </div>

        {/* Right: brand panel — hidden <900px */}
        <div className="hidden min-[900px]:block border-l border-[var(--landing-border)]">
          <div className="sticky top-0 h-[100dvh] overflow-auto">
            <BrandPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
