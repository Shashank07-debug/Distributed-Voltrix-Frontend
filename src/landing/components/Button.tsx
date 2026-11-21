import React from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  href?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  href,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  }[size];

  const variantClasses = {
    primary:
      'bg-[var(--landing-accent)] text-[#0B0B0C] font-semibold hover:bg-[var(--landing-accent-hover)] active:translate-y-[1px] shadow-sm',
    secondary:
      'bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] hover:bg-[var(--landing-surface-3)] active:translate-y-[1px]',
    ghost:
      'bg-transparent text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface-2)]',
  }[variant];

  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-[var(--landing-radius-sm)] font-medium transition-[background-color,border-color,transform,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg)] cursor-pointer select-none ${sizeClasses} ${variantClasses} ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
};
