import React from 'react';
import { Caret } from './Caret';
import { Squiggle } from './Squiggle';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  highlightWord?: string;
  description?: string;
  caret?: boolean;
  align?: 'left' | 'center';
  className?: string;
  theme?: 'dark' | 'bone';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  highlightWord,
  description,
  caret = true,
  align = 'left',
  className = '',
  theme = 'dark',
}) => {
  const renderTitle = () => {
    if (!highlightWord || !title.includes(highlightWord)) {
      return (
        <>
          {title}
          {caret && <Caret variant={theme === 'bone' ? 'dark' : 'lime'} />}
        </>
      );
    }

    const parts = title.split(highlightWord);
    return (
      <>
        {parts[0]}
        <span className="relative inline-block whitespace-nowrap text-[var(--landing-accent)] font-semibold">
          {highlightWord}
          <Squiggle color={theme === 'bone' ? 'dark' : 'lime'} />
        </span>
        {parts[1]}
        {caret && <Caret variant={theme === 'bone' ? 'dark' : 'lime'} />}
      </>
    );
  };

  return (
    <div
      className={`space-y-3 ${
        align === 'center' ? 'text-center mx-auto' : 'text-left'
      } ${className}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-normal uppercase bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] border border-[var(--landing-accent)]/20">
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] ${
          theme === 'bone' ? 'text-[var(--landing-text-dark)]' : 'text-[var(--landing-text-primary)]'
        }`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {renderTitle()}
      </h2>
      {description && (
        <p
          className={`text-sm sm:text-base max-w-2xl leading-relaxed ${
            theme === 'bone'
              ? 'text-[var(--landing-text-dark-muted)]'
              : 'text-[var(--landing-text-secondary)]'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
};
