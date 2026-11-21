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
    <div className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text-primary)] flex flex-col font-sans selection:bg-[var(--landing-accent)] selection:text-black">
      {/* Subtle GPU-cheap background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] select-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Sticky Navbar with Dropdowns */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1 relative z-10">
        <Hero />
        <Overview />
        <Workflow />
        <Features />
        <Architecture />
        <PricingTeaser />
        <FinalCta />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
