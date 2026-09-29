import React, { useId } from 'react';

export interface LogoProps {
  variant?: 'mark' | 'full';
  size?: number; // px height of the mark, default 32
  glow?: boolean;
  mono?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'mark',
  size = 32,
  glow = false,
  mono = false,
  className = '',
}) => {
  const gradientId = useId().replace(/:/g, '_');

  const glowStyle: React.CSSProperties = glow
    ? {
        filter:
          'drop-shadow(0 0 12px rgba(124,58,237,.45)) drop-shadow(0 0 24px rgba(34,211,238,.25))',
      }
    : {};

  const markSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        ...glowStyle,
      }}
      className="inline-block align-middle transition-transform"
      aria-hidden="true"
    >
      {!mono && (
        <defs>
          <linearGradient
            id={gradientId}
            x1="56"
            y1="88"
            x2="456"
            y2="440"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      )}
      <path
        fill={mono ? '#111111' : `url(#${gradientId})`}
        fillRule="evenodd"
        d="M56 88 H168 L256 272 L344 88 H456 L256 428 Z M340 154 L284 246 H320 L290 334 L354 234 H318 Z"
      />
      <circle cx="256" cy="452" r="20" fill={mono ? '#111111' : '#22D3EE'} />
    </svg>
  );

  if (variant === 'full') {
    const fontSize = Math.max(14, Math.round(size * 0.45));

    return (
      <div
        className={`inline-flex items-center gap-2.5 select-none min-w-[96px] ${className}`}
        aria-label="Voltrix"
        role="img"
      >
        {markSvg}
        <span
          className="font-display font-semibold tracking-[-0.02em] leading-none text-current"
          style={{ fontSize: `${fontSize}px` }}
        >
          Voltrix
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      aria-label="Voltrix"
      role="img"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {markSvg}
    </div>
  );
};

export default Logo;
