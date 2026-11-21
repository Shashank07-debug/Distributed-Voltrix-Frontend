import React, { useState } from 'react';
import {
  RotateCw,
  ExternalLink,
  Globe,
  Sparkles,
  Rocket,
  Smartphone,
  Tablet,
  Monitor,
  Lock,
} from 'lucide-react';

interface PreviewPaneProps {
  previewUrl: string | null;
  onDeploy?: () => void;
  isDeploying?: boolean;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  previewUrl,
  onDeploy,
  isDeploying = false,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleRefresh = () => {
    setIframeError(false);
    setIframeKey((prev) => prev + 1);
  };

  const deviceWidthMap = {
    desktop: 'w-full',
    tablet: 'w-[768px] max-w-full shadow-2xl border-x border-[var(--landing-border)]',
    mobile: 'w-[375px] max-w-full shadow-2xl border-x border-[var(--landing-border)]',
  };

  return (
    <div className="flex flex-col h-full bg-[var(--landing-surface-1)] select-none overflow-hidden">
      {/* ── Browser-Style Toolbar (40px) ──────────────────────────────────── */}
      <div className="h-10 min-h-10 max-h-10 box-border px-3 border-b border-[var(--landing-border)] flex items-center justify-between bg-[var(--landing-bg-ink)] shrink-0 gap-2">
        {/* Left: URL Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--landing-surface-1)] border border-[var(--landing-border)] text-[11px] font-mono text-[var(--landing-text-secondary)] max-w-[60%] sm:max-w-[70%] truncate">
          <Lock className="w-2.5 h-2.5 text-[var(--landing-accent)] shrink-0" />
          <span className="truncate">{previewUrl || 'preview container'}</span>
        </div>

        {/* Center/Right: Device Mode Toggles & Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Device Toggles (visible when deployed) */}
          {previewUrl && (
            <div className="hidden sm:flex items-center gap-0.5 bg-[var(--landing-surface-1)] p-0.5 rounded-lg border border-[var(--landing-border)] mr-1">
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                className={`p-1 rounded-md transition-colors ${
                  deviceMode === 'desktop'
                    ? 'bg-white/10 text-[var(--landing-accent)]'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('tablet')}
                className={`p-1 rounded-md transition-colors ${
                  deviceMode === 'tablet'
                    ? 'bg-white/10 text-[var(--landing-accent)]'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                className={`p-1 rounded-md transition-colors ${
                  deviceMode === 'mobile'
                    ? 'bg-white/10 text-[var(--landing-accent)]'
                    : 'text-[var(--landing-text-secondary)] hover:text-white'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {previewUrl && (
            <>
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1.5 rounded-lg text-[var(--landing-text-secondary)] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Reload preview frame"
                aria-label="Reload preview frame"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-[var(--landing-text-secondary)] hover:text-[var(--landing-accent)] hover:bg-white/5 transition-colors"
                title="Open preview in new tab"
                aria-label="Open preview in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* ── Main Preview Iframe or Empty State ─────────────────────────────── */}
      <div className="flex-1 relative bg-[var(--landing-bg-ink)] flex items-center justify-center overflow-hidden">
        {previewUrl && !iframeError ? (
          <div className={`h-full ${deviceWidthMap[deviceMode]} transition-all duration-200 bg-white`}>
            <iframe
              key={iframeKey}
              src={previewUrl}
              title="Voltrix Live Application Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onError={() => setIframeError(true)}
              className="w-full h-full border-none"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none bg-[var(--landing-surface-1)]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--landing-accent-subtle)] border border-[var(--landing-accent)]/30 flex items-center justify-center mb-4">
              <Globe className="w-7 h-7 text-[var(--landing-accent)]" />
            </div>

            <h4 className="font-display text-base font-bold text-[var(--landing-text-primary)] mb-1">
              {iframeError ? 'preview container frame error' : 'no live preview active.'}
            </h4>

            <p className="text-xs text-[var(--landing-text-secondary)] max-w-xs mb-6 leading-relaxed font-sans">
              {iframeError
                ? 'The application could not be framed directly. Try opening in a separate browser tab.'
                : 'deploy this project to run your code inside an isolated runner container and see it update in real time.'}
            </p>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-5 rounded-full bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] text-[#090D0F] font-bold text-xs uppercase tracking-wider font-mono shadow-sm inline-flex items-center gap-2 transition-transform active:scale-95"
              >
                <span>open in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {!previewUrl && onDeploy && (
              <button
                type="button"
                onClick={onDeploy}
                disabled={isDeploying}
                className="h-11 px-6 rounded-full bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] text-[#090D0F] font-bold text-xs uppercase tracking-wider font-mono shadow-sm flex items-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Rocket className="w-4 h-4 text-[#090D0F]" />
                <span>{isDeploying ? 'deploying runner...' : 'deploy preview'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
