import React from 'react';
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
  const renderedTitle = highlightWord && title.includes(highlightWord) ? (
    <>{
      title.split(highlightWord).map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < title.split(highlightWord).length - 1 && (
            <span className="relative inline-block whitespace-nowrap text-[var(--landing-accent)]">
              {highlightWord}
              <Squiggle color={theme === 'bone' ? 'dark' : 'lime'} />
            </span>
          )}
        </React.Fragment>
      ))
    }</>
  ) : (
    title
  );

  return (
    <div className={`space-y-3 ${align === 'center' ? 'text-center mx-auto' : 'text-left'} ${className}`}> 
      {eyebrow && (
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight uppercase bg-[var(--landing-accent-subtle)] text-[var(--landing-accent)] border border-[var(--landing-accent)]/20">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] ${theme === 'bone' ? 'text-[var(--landing-text-dark)]' : 'text-[var(--landing-text-primary)]'}`} style={{ fontFamily: 'var(--font-display)' }}>
        {renderedTitle}
      </h2>
      {description && (
        <p className={`text-sm sm:text-base max-w-2xl leading-relaxed ${theme === 'bone' ? 'text-[var(--landing-text-dark-muted)]' : 'text-[var(--landing-text-secondary)]'}`}>
          {description}
        </p>
      )}
    </div>
  );
};