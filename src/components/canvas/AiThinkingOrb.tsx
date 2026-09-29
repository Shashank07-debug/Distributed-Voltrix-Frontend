import React from 'react';

interface AiThinkingOrbProps {
  label?: string;
  size?: 'sm' | 'md';
}

export const AiThinkingOrb: React.FC<AiThinkingOrbProps> = ({
  label = 'Voltrix AI is thinking...',
  size = 'md',
}) => {
  const orbSizes = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-voltrix-card/90 border border-voltrix-violet/30 shadow-lg backdrop-blur-md">
      {/* Multi-layered animated glowing pulse orb */}
      <div className={`relative flex items-center justify-center ${orbSizes}`}>
        <span className="absolute inline-flex h-full w-full rounded-full bg-voltrix-cyan opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-voltrix-violet via-voltrix-cyan to-voltrix-highlight shadow-[0_0_12px_#8B5CF6]" />
      </div>
      {label && <span className="text-xs font-mono font-medium text-voltrix-violet-light tracking-wide">{label}</span>}
    </div>
  );
};
