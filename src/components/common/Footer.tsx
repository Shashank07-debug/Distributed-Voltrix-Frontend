import React from 'react';
import { Zap, Globe, MessageSquare, Disc as Discord } from 'lucide-react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border-subtle bg-surface-base py-12 text-text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent-teal" />
            <span className="font-sans font-semibold text-sm tracking-tight text-text-primary">VOLTRIX</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed max-w-xs">
            Autonomous AI application builder. Translating natural language specifications into live, inspected web applications.
          </p>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold text-text-primary mb-3">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/projects" className="hover:text-text-primary transition-colors">Workspace Editor</Link></li>
            <li><Link to="/billing" className="hover:text-text-primary transition-colors">Pricing & Plans</Link></li>
            <li><a href="#features" className="hover:text-text-primary transition-colors">Architecture Engine</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold text-text-primary mb-3">Developers</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#docs" className="hover:text-text-primary transition-colors">Documentation</a></li>
            <li><a href="#api" className="hover:text-text-primary transition-colors">Gateway API</a></li>
            <li><a href="#status" className="hover:text-text-primary transition-colors">System Status</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs font-semibold text-text-primary mb-3">Community</h4>
          <div className="flex items-center gap-4 text-text-secondary">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-accent-teal transition-colors" title="GitHub">
              <Globe className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-accent-teal transition-colors" title="Community">
              <MessageSquare className="w-4 h-4" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-accent-teal transition-colors" title="Discord">
              <Discord className="w-4 h-4" />
            </a>
          </div>
          <p className="text-[11px] font-mono mt-4 text-text-tertiary">
            &copy; {CURRENT_YEAR} Voltrix Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};
