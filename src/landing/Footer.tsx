import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

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
        { label: 'Community', href: '#resources' },
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
        { label: 'API Reference', href: '#architecture' },
        { label: 'Kubernetes Pods', href: '#architecture' },
        { label: 'FAQ', href: '#overview' },
      ],
    },
  ];

  return (
    <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-surface-1)] text-xs text-[var(--landing-text-muted)] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand info (2 Cols) */}
          <div className="col-span-2 space-y-3">
            <Link to="/" className="inline-block" aria-label="Voltrix home">
              <Logo variant="full" size={24} />
            </Link>
            <p className="text-xs text-[var(--landing-text-secondary)] leading-relaxed max-w-sm">
              Autonomous application builder transforming natural language prompts into live, verifiable code.
            </p>
            <div className="pt-2 font-mono text-[11px] text-[var(--landing-text-muted)]">
              &copy; {new Date().getFullYear()} Voltrix Platform Inc.
            </div>
          </div>

          {/* 4 Link columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-2.5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--landing-text-primary)] font-semibold">
                {col.title}
              </div>
              <ul className="space-y-1.5">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href || '#'}
                        onClick={(e) => {
                          if (link.href?.startsWith('#')) {
                            e.preventDefault();
                            const el = document.getElementById(link.href.replace('#', ''));
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
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

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[var(--landing-border)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <div>Distributed application synthesis on isolated container sandboxes.</div>
          <div className="flex items-center gap-4 text-[var(--landing-text-muted)]">
            <a href="#overview" className="hover:text-[var(--landing-text-primary)] transition-colors">
              Privacy Notice
            </a>
            <a href="#overview" className="hover:text-[var(--landing-text-primary)] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
