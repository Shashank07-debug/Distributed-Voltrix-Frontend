import React from 'react';
import { Zap, Globe, MessageSquare, Disc as Discord } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-voltrix-border bg-[#070709] py-12 text-voltrix-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-voltrix-cyan" />
            <span className="font-display font-bold text-xl text-white">VOLTRIX</span>
          </div>
          <p className="text-xs leading-relaxed">
            The next-generation autonomous AI software builder. Turning natural language prompts into live production applications in seconds.
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white mb-3 tracking-wider uppercase">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/projects" className="hover:text-white transition-colors">Workspace Editor</Link></li>
            <li><Link to="/billing" className="hover:text-white transition-colors">Pricing & Tokens</Link></li>
            <li><a href="#features" className="hover:text-white transition-colors">Architecture Engine</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white mb-3 tracking-wider uppercase">Developers</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#docs" className="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#api" className="hover:text-white transition-colors">Gateway API</a></li>
            <li><a href="#status" className="hover:text-white transition-colors">System Status</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white mb-3 tracking-wider uppercase">Community</h4>
          <div className="flex items-center gap-4 text-gray-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-voltrix-cyan transition-colors" title="GitHub">
              <Globe className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-voltrix-cyan transition-colors" title="Community">
              <MessageSquare className="w-5 h-5" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-voltrix-cyan transition-colors" title="Discord">
              <Discord className="w-5 h-5" />
            </a>
          </div>
          <p className="text-[11px] font-mono mt-4 text-white/40">
            &copy; {new Date().getFullYear()} Voltrix Inc. Built with React, Three.js & Tailwind.
          </p>
        </div>
      </div>
    </footer>
  );
};
