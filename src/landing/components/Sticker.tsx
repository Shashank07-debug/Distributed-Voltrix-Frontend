import React from 'react';

export interface StickerProps {
  children: React.ReactNode;
  variant?: 'lime' | 'coral' | 'bone' | 'ink';
  rotate?: number;
  className?: string;
  icon?: React.ReactNode;
}

export const Sticker: React.FC<StickerProps> = ({
  children,
  variant = 'lime',
  rotate = 0,
  className = '',
  icon,
}) => {
  const variantStyles = {
    lime: 'bg-[var(--landing-accent)] text-[#090D0F] border-[#090D0F]',
    coral: 'bg-[var(--landing-pop-coral)] text-white border-[#090D0F]',
    bone: 'bg-[var(--landing-bg-bone)] text-[#090D0F] border-[#090D0F]',
    ink: 'bg-[var(--landing-surface-2)] text-[var(--landing-text-primary)] border-[var(--landing-accent)]',
  }[variant];

  return (
    <span
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`landing-sticker ${variantStyles} ${className}`}
      aria-hidden="true"
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
