import React from 'react';
import { Caret } from './Caret';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  caret?: boolean;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  caret = true,
  align = 'left',
  className = '',
}) => {
  return (
    <div
      className={`space-y-3 ${
        align === 'center' ? 'text-center mx-auto' : 'text-left'
      } ${className}`}
    >
      {eyebrow && (
        <p className="text-xs font-mono font-medium tracking-normal text-[var(--landing-accent)]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[var(--landing-text-primary)] leading-tight">
        {title}
        {caret && <Caret />}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-[var(--landing-text-secondary)] max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
