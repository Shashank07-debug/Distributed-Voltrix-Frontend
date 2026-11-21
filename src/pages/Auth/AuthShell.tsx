/**
 * AuthShell — shared layout for /login and /signup.
 *
 * Desktop (≥900px): two columns.
 *   Left  → form card, vertically centred.
 *   Right → brand panel with logo, tagline + squiggle, mini CSS editor visual, 2 stickers.
 * Mobile (<900px): single column, brand panel hidden, small logo on top.
 *
 * No typing animation. One 200ms fade-in on load (opacity + translateY only).
 * Layout: min-h-[100dvh], env(safe-area-inset-*), no horizontal scroll.
 */
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../../components/Logo';

/* ─── Squiggle under "vision" ─────────────────────────────────────────────── */
const SquiggleSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 120 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M2 10 C12 2, 22 14, 32 7 C42 0, 52 12, 62 7 C72 2, 82 12, 92 7 C102 2, 112 10, 118 6"
      stroke="#06B6D4"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Static mini-editor product visual ───────────────────────────────────── */
const MiniEditorVisual: React.FC = () => (
  <div className="w-full rounded-xl border border-white/10 bg-[#0B0B0F] overflow-hidden text-[11px] font-mono select-none shadow-2xl">
    {/* Window chrome */}
    <div className="h-8 px-3 bg-[#111116] border-b border-white/[0.06] flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-white/10" />
        <span className="w-2 h-2 rounded-full bg-white/10" />
        <span className="w-2 h-2 rounded-full bg-white/10" />
        <span className="ml-2 text-[10px] text-white/30">app.tsx</span>
      </div>
      {/* deployed badge */}
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[10px] text-[#06B6D4]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
        deployed
      </span>
    </div>
    {/* Code lines */}
    <div className="px-4 py-3 space-y-1 leading-relaxed">
      {[
        { n: 1, tokens: [{ t: 'import', c: '#06B6D4' }, { t: ' { useVoltrix }', c: '#A0A0AB' }, { t: " from", c: '#06B6D4' }, { t: " 'voltrix'", c: '#10B981' }] },
        { n: 2, tokens: [{ t: '', c: '' }] },
        { n: 3, tokens: [{ t: 'export function', c: '#06B6D4' }, { t: ' App', c: '#fff' }, { t: '() {', c: '#A0A0AB' }] },
        { n: 4, tokens: [{ t: '  const', c: '#06B6D4' }, { t: ' { build } = ', c: '#A0A0AB' }, { t: 'useVoltrix', c: '#fff' }, { t: '();', c: '#A0A0AB' }] },
        { n: 5, tokens: [{ t: '  return', c: '#06B6D4' }, { t: ' <App />', c: '#A0A0AB' }] },
        { n: 6, tokens: [{ t: '}', c: '#A0A0AB' }] },
      ].map(({ n, tokens }) => (
        <div key={n} className="flex gap-3">
          <span className="text-white/20 w-4 text-right shrink-0">{n}</span>
          <span>
            {tokens.map((tk, i) =>
              tk.t ? (
                <span key={i} style={{ color: tk.c }}>{tk.t}</span>
              ) : (
                <span key={i}>&nbsp;</span>
              )
            )}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Sticker chip ─────────────────────────────────────────────────────────── */
const Sticker: React.FC<{ label: string; rotate?: string }> = ({
  label,
  rotate = 'rotate-0',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#06B6D4] text-[11px] font-medium tracking-wide ${rotate} select-none`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
    {label}
  </span>
);

/* ─── Brand panel (right column) ───────────────────────────────────────────── */
const BrandPanel: React.FC = () => (
  <div className="relative flex flex-col justify-between h-full px-10 py-12 overflow-hidden">
    {/* Subtle grid background */}
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 0v1H0V0h32zM0 0v32h1V0H0z' fill='rgba(255,255,255,1)'/%3E%3C/svg%3E\")",
      }}
      aria-hidden="true"
    />
    {/* Subtle radial glow */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full opacity-10 pointer-events-none"
      style={{
        background:
          'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)',
      }}
      aria-hidden="true"
    />

    {/* Top: logo */}
    <div className="relative z-10">
      <Logo variant="full" size={28} />
    </div>

    {/* Middle: tagline + visual */}
    <div className="relative z-10 space-y-8">
      {/* Tagline */}
      <div>
        <p className="font-display font-semibold text-2xl leading-snug text-white/90 tracking-tight">
          describe your{' '}
          <span className="relative inline-block">
            vision
            <SquiggleSvg className="absolute -bottom-2 left-0 w-full h-3" />
          </span>
          .
          <br />
          <span className="text-white/50 font-normal">voltrix builds the code.</span>
        </p>
      </div>

      {/* Stickers — above the editor so no overlap */}
      <div className="flex flex-wrap gap-2">
        <Sticker label="no setup required" rotate="-rotate-1" />
        <Sticker label="monaco included" rotate="rotate-1" />
      </div>

      {/* Product visual */}
      <MiniEditorVisual />
    </div>

    {/* Bottom: subtle footer copy */}
    <p className="relative z-10 text-[11px] text-white/20 font-mono mt-6">
      voltrix.ai · autonomous app builder
    </p>
  </div>
);

/* ─── Props ─────────────────────────────────────────────────────────────────── */
export interface AuthShellProps {
  children: React.ReactNode;
  /** Passed through to the server-error banner inside the form column */
  serverError?: string | null;
}

/* ─── Shell ─────────────────────────────────────────────────────────────────── */
export const AuthShell: React.FC<AuthShellProps> = ({ children, serverError }) => {
  const shellRef = useRef<HTMLDivElement>(null);

  /* 200ms fade-in — respects prefers-reduced-motion */
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    // rAF ensures the initial style is painted before transitioning
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, []);

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col bg-[#0B0B0F] text-[#ECECF1] overflow-x-hidden"
      style={{
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* ── Navbar-lite ───────────────────────────────────────────────────── */}
      <header className="shrink-0 w-full px-5 sm:px-8 h-14 flex items-center justify-between border-b border-white/[0.06]">
        <Link
          to="/"
          className="inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
          aria-label="Voltrix home"
        >
          <Logo variant="full" size={22} />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#A0A0AB] hover:text-[#ECECF1] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] px-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Back to home
        </Link>
      </header>

      {/* ── Two-column body ───────────────────────────────────────────────── */}
      <div
        ref={shellRef}
        className="flex-1 w-full grid grid-cols-1 min-[900px]:grid-cols-2"
      >
        {/* Left: form column */}
        <div className="flex flex-col items-center justify-center px-5 sm:px-10 py-10 min-[900px]:py-16">
          <div className="w-full max-w-[420px] space-y-5">
            {/* Server error banner */}
            {serverError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] text-sm leading-relaxed"
              >
                {serverError}
              </div>
            )}

            {/* Form content injected by child pages */}
            {children}
          </div>

          {/* Privacy & terms footer */}
          <p className="mt-10 text-[11px] text-[#6B6B76] text-center">
            By continuing you agree to Voltrix's{' '}
            <a
              href="/privacy"
              className="underline underline-offset-2 hover:text-[#A0A0AB] transition-colors"
            >
              Privacy Policy
            </a>{' '}
            &amp;{' '}
            <a
              href="/terms"
              className="underline underline-offset-2 hover:text-[#A0A0AB] transition-colors"
            >
              Terms of Service
            </a>
            .
          </p>
        </div>

        {/* Right: brand panel — hidden below 900px */}
        <div className="hidden min-[900px]:block border-l border-white/[0.06] bg-[#0F1117]">
          <div className="sticky top-0 h-[100dvh] overflow-auto">
            <BrandPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
