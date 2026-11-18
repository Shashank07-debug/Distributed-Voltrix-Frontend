import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
  serverError?: string | null;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
  serverError,
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-surface-base px-4 py-10 sm:py-16 text-text-primary">
      {/* Brand Logo Header */}
      <Link
        to="/"
        className="inline-flex items-center mb-6 transition-opacity hover:opacity-90 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal"
        aria-label="Voltrix Home"
      >
        <Logo variant="full" size={26} />
      </Link>

      {/* Heading & Subtitle */}
      <div className="w-full text-center mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          {subtitle}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-[400px] bg-surface-panel border border-border-subtle rounded-xl p-6 sm:p-8 shadow-sm">
        {serverError && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-lg bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs leading-relaxed"
          >
            {serverError}
          </div>
        )}
        {children}
      </div>

      {/* Bottom Switch Link */}
      <p className="mt-6 text-center text-xs text-text-secondary">
        {footerText}{' '}
        <Link
          to={footerLinkTo}
          className="text-text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal rounded px-0.5"
        >
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
};
