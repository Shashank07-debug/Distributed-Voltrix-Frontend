import React, { useState } from 'react';
import { RotateCw, ExternalLink, Globe, Sparkles } from 'lucide-react';

interface PreviewPaneProps {
  previewUrl: string | null;
  onDeploy?: () => void;
  isDeploying?: boolean;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  previewUrl,
  onDeploy,
  isDeploying,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);

  const handleRefresh = () => {
    setIframeError(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-full bg-[#070709] border-l border-voltrix-border">
      {/* Top Preview Bar */}
      <div className="px-3 py-2 border-b border-voltrix-border flex items-center justify-between bg-voltrix-card/40 text-xs">
        <div className="flex items-center gap-2 max-w-[70%]">
          <Globe className="w-3.5 h-3.5 text-voltrix-cyan shrink-0" />
          <span className="font-mono text-gray-300 truncate">
            {previewUrl || 'Not deployed yet'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {previewUrl && (
            <>
              <button
                onClick={handleRefresh}
                className="p-1.5 rounded-lg text-voltrix-muted hover:text-white hover:bg-white/5 transition-colors"
                title="Refresh preview"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-voltrix-muted hover:text-voltrix-cyan hover:bg-white/5 transition-colors"
                title="Open preview in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Main Preview Iframe or Fallback Card */}
      <div className="flex-1 relative bg-white">
        {previewUrl && !iframeError ? (
          <iframe
            key={iframeKey}
            src={previewUrl}
            title="Voltrix Live Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setIframeError(true)}
            className="w-full h-full border-none"
          />
        ) : (
          <div className="absolute inset-0 bg-[#070709] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-voltrix-cyan/10 border border-voltrix-cyan/30 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-voltrix-cyan" />
            </div>

            <h4 className="font-display text-sm font-bold text-white mb-1">
              {iframeError ? 'Preview Container Frame Error' : 'No Live Preview Active'}
            </h4>

            <p className="text-xs text-voltrix-muted max-w-sm mb-6">
              {iframeError
                ? 'The preview server could not be framed directly. Open the deployed application in a separate browser tab.'
                : 'Click "Deploy Preview" on the top bar to build and host your project in an isolated runner container.'}
            </p>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-voltrix-cyan text-black text-xs font-semibold hover:bg-voltrix-cyan-light transition-colors inline-flex items-center gap-1.5"
              >
                Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {!previewUrl && onDeploy && (
              <button
                onClick={onDeploy}
                disabled={isDeploying}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white text-xs font-semibold shadow-lg hover:scale-105 transition-all"
              >
                {isDeploying ? 'Deploying...' : 'Deploy Preview Now'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
