import React from 'react';
import './tokens.css';
import { Navbar } from './nav/Navbar';
import { Hero } from './hero/Hero';
import { Overview } from './sections/Overview';
import { Workflow } from './sections/Workflow';
import { Features } from './sections/Features';
import { Architecture } from './sections/Architecture';
import { PricingTeaser } from './sections/PricingTeaser';
import { FinalCta } from './sections/FinalCta';
import { Footer } from './Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--landing-bg-ink)] text-[var(--landing-text-primary)] flex flex-col font-sans selection:bg-[var(--landing-accent)] selection:text-black relative">
      {/* Skip-to-content accessibility link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--landing-accent)] focus:text-[#090D0F] focus:font-bold focus:rounded-full shadow-lg"
      >
        Skip to content
      </a>

      {/* Static Subtle SVG Grain Texture Overlay (3.5% Opacity, Disabled below 768px for GPU efficiency) */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] select-none z-40 hidden md:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Floating Sticky Navbar */}
      <Navbar />

      {/* Page Sections */}
      <main id="main-content" className="flex-1 relative z-10">
        <Hero />
        <div className="section-contained">
          <Overview />
        </div>
        <div className="section-contained">
          <Workflow />
        </div>
        <div className="section-contained">
          <Features />
        </div>
        <div className="section-contained">
          <Architecture />
        </div>
        <div className="section-contained">
          <PricingTeaser />
        </div>
        <div className="section-contained">
          <FinalCta />
        </div>
      </main>

      {/* Footer with Giant Wordmark & Developed by Credit */}
      <Footer />
    </div>
  );
};

export default LandingPage;
