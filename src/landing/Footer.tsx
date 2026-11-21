import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Squiggle } from './components/Squiggle';
import {
  DEVELOPER_NAME,
  DEVELOPER_URL,
  LINKEDIN_URL,
  GITHUB_URL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from './config/developer';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.63 1.63 0 1 0-.01-3.26 1.63 1.63 0 0 0 .01 3.26m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface FooterLink {
  label: string;
  href?: string;
  to?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const Footer: React.FC = () => {
  const columns: FooterColumn[] = [
    {
      title: 'Product',
      links: [
        { label: 'Overview', href: '#overview' },
        { label: 'Workflow', href: '#workflow' },
        { label: 'Features', href: '#features' },
        { label: 'Architecture', href: '#architecture' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: '#resources' },
        { label: 'Tutorials', href: '#resources' },
        { label: 'Templates', href: '#resources' },
        { label: 'Contact', href: '#contact' },
      ],
    },
    {
      title: 'Pricing',
      links: [
        { label: 'Plans & Tiers', to: '/billing' },
        { label: 'Compute Units', to: '/billing' },
        { label: 'Billing Portal', to: '/billing' },
      ],
    },
    {
      title: 'Documentation',
      links: [
        { label: 'Quickstart', href: '#overview' },
        { label: 'Your first app', href: '#workflow' },
        { label: 'API Reference', href: '#architecture' },
        { label: 'FAQ', href: '#overview' },
      ],
    },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (href?.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-bg-ink)] text-xs text-[var(--landing-text-muted)] select-none overflow-hidden relative pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 relative z-10 space-y-14">
        {/* Contact Section */}
        <div id="contact" className="p-8 sm:p-10 rounded-[var(--landing-radius-lg)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] text-left space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight uppercase bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] border border-[var(--landing-accent)]/20">
              get in touch
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--landing-text-primary)] leading-[1.08]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              let's{' '}
              <span className="relative inline-block text-[var(--landing-accent)]">
                talk.
                <Squiggle color="lime" />
              </span>
            </h2>
            <p className="text-sm text-[var(--landing-text-secondary)] max-w-xl font-sans leading-relaxed">
              have an idea, want to collaborate, or have feedback on voltrix? reach out directly across any of these channels.
            </p>
          </div>

          {/* Three Link Pills in Sticker / Chip Style */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* LinkedIn */}
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${DEVELOPER_NAME} on LinkedIn (opens in new tab)`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] hover:border-[var(--landing-accent)] hover:text-[var(--landing-accent)] hover:shadow-[3px_3px_0px_#D4FF32] transition-all duration-150 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <LinkedinIcon className="w-4 h-4 text-[var(--landing-accent)] shrink-0" />
              <span className="font-semibold">{DEVELOPER_NAME}</span>
            </a>

            {/* GitHub */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shashank07-debug on GitHub (opens in new tab)"
              className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] hover:border-[var(--landing-accent)] hover:text-[var(--landing-accent)] hover:shadow-[3px_3px_0px_#D4FF32] transition-all duration-150 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <GithubIcon className="w-4 h-4 text-[var(--landing-accent)] shrink-0" />
              <span className="font-semibold">Shashank07-debug</span>
            </a>

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`@${INSTAGRAM_HANDLE} on Instagram (opens in new tab)`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[var(--landing-border)] bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] hover:border-[var(--landing-pop-coral)] hover:text-[var(--landing-pop-coral)] hover:shadow-[3px_3px_0px_#FF5C5C] transition-all duration-150 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-pop-coral)]"
            >
              <InstagramIcon className="w-4 h-4 text-[var(--landing-pop-coral)] shrink-0" />
              <span className="font-semibold">@{INSTAGRAM_HANDLE}</span>
            </a>
          </div>
        </div>

        {/* Navigation Grid (matching Navbar groups) */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand Column (2 Cols) */}
          <div className="col-span-2 space-y-3">
            <Link to="/" className="inline-block" aria-label="Voltrix home">
              <Logo variant="full" size={24} />
            </Link>
            <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed max-w-sm">
              autonomous application builder for makers who want to build and ship fast.
            </p>
            <div className="pt-2 font-mono text-[11px] text-[var(--landing-text-muted)]">
              made for the late-night builders
            </div>
          </div>

          {/* 4 Navigation Link Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--landing-text-primary)] font-bold">
                {col.title}
              </div>
              <ul className="space-y-2">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="py-1 inline-block text-[var(--landing-text-secondary)] hover:text-[var(--landing-accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href || '#'}
                        onClick={(e) => handleSmoothScroll(e, link.href)}
                        className="py-1 inline-block text-[var(--landing-text-secondary)] hover:text-[var(--landing-accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Credit Bar: left "© 2026 Voltrix", right "Developed by Shashank M N" */}
        <div className="mt-14 pt-6 border-t border-[var(--landing-border)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs max-sm:text-center">
          <div>&copy; 2026 Voltrix</div>

          {/* "Developed by Shashank M N" Credit Line */}
          <div className="flex items-center gap-1.5 text-[var(--landing-text-muted)]">
            <span>Developed by</span>
            <a
              href={DEVELOPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${DEVELOPER_NAME} on GitHub (opens in new tab)`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center relative text-[var(--landing-text-primary)] font-semibold font-mono hover:text-[var(--landing-accent)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
            >
              <span>{DEVELOPER_NAME}</span>
              <span className="absolute left-0 bottom-2 w-full h-[2px] bg-[var(--landing-accent)]/80 rounded-full" />
            </a>
          </div>

          <div className="flex items-center gap-4 text-[var(--landing-text-muted)] text-[11px]">
            <a
              href="#overview"
              onClick={(e) => handleSmoothScroll(e, '#overview')}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-[var(--landing-accent)] transition-colors"
            >
              privacy
            </a>
            <a
              href="#overview"
              onClick={(e) => handleSmoothScroll(e, '#overview')}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center hover:text-[var(--landing-accent)] transition-colors"
            >
              terms
            </a>
          </div>
        </div>
      </div>

      {/* Giant Cropped Wordmark Across Bottom */}
      <div
        className="w-full text-center font-black tracking-tighter text-[#162024] text-[18vw] leading-none select-none pointer-events-none -mb-8 sm:-mb-14 overflow-hidden"
        style={{ fontFamily: 'var(--font-display)' }}
        aria-hidden="true"
      >
        VOLTRIX
      </div>
    </footer>
  );
};
