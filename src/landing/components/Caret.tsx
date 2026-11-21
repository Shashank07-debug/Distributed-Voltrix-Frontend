import React from 'react';

export interface CaretProps {
  className?: string;
  staticCaret?: boolean;
  variant?: 'lime' | 'dark';
}

export const Caret: React.FC<CaretProps> = ({
  className = '',
  staticCaret = false,
  variant = 'lime',
}) => {
  return (
    <span
      className={`landing-caret ${
        variant === 'dark' ? 'landing-caret-bone' : ''
      } ${staticCaret ? '!animation-none' : ''} ${className}`}
      aria-hidden="true"
    />
  );
};
