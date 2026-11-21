import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'coral';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  href?: string;
  children: React.ReactNode;
  magnetic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  to,
  href,
  children,
  className = '',
  magnetic = false,
  ...props
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!magnetic || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    if (!magnetic) return;
    setOffset({ x: 0, y: 0 });
  };

  const sizeClasses = {
    sm: 'h-8 px-3.5 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-7 text-base font-semibold',
  }[size];

  const variantClasses = {
    primary:
      'bg-[var(--landing-accent)] text-[#090D0F] font-bold hover:bg-[var(--landing-accent-hover)] active:scale-[0.98] shadow-sm border border-[#090D0F]/20',
    coral:
      'bg-[var(--landing-pop-coral)] text-white font-bold hover:bg-[var(--landing-pop-coral-hover)] active:scale-[0.98] shadow-sm',
    secondary:
      'bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] border border-[var(--landing-border)] hover:border-[var(--landing-border-hover)] hover:bg-[var(--landing-surface-3)] active:scale-[0.98]',
    ghost:
      'bg-transparent text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface-1)] active:scale-[0.98]',
  }[variant];

  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-full font-sans transition-[background-color,border-color,transform,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-bg)] cursor-pointer select-none ${sizeClasses} ${variantClasses} ${className}`;

  const style: React.CSSProperties = magnetic
    ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }
    : {};

  if (to) {
    return (
      <Link
        to={to}
        ref={buttonRef as React.Ref<HTMLAnchorElement>}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className={baseClasses}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        ref={buttonRef as React.Ref<HTMLAnchorElement>}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className={baseClasses}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef as React.Ref<HTMLButtonElement>}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={baseClasses}
      {...props}
    >
      {children}
    </button>
  );
};
