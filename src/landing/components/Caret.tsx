import React from 'react';

export interface CaretProps {
  className?: string;
  staticCaret?: boolean;
}

export const Caret: React.FC<CaretProps> = ({ className = '', staticCaret = false }) => {
  return (
    <span
      className={`landing-caret ${staticCaret ? '!animation-none' : ''} ${className}`}
      aria-hidden="true"
    />
  );
};
