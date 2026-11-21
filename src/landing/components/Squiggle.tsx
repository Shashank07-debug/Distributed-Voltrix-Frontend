import React from 'react';

export interface SquiggleProps {
  color?: 'lime' | 'coral' | 'bone' | 'dark';
  className?: string;
  width?: number | string;
}

export const Squiggle: React.FC<SquiggleProps> = ({
  color = 'lime',
  className = '',
  width = '100%',
}) => {
  const strokeColor = {
    lime: 'var(--landing-accent)',
    coral: 'var(--landing-pop-coral)',
    bone: 'var(--landing-bg-bone)',
    dark: 'var(--landing-text-dark)',
  }[color];

  return (
    <svg
      viewBox="0 0 140 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width }}
      className={`absolute left-0 -bottom-2 h-4 pointer-events-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path
        d="M 2 9 C 25 3, 45 15, 70 8 C 95 2, 115 16, 138 9"
        stroke={strokeColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="landing-squiggle-anim"
      />
    </svg>
  );
};
