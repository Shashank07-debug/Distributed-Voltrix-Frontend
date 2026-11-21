import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_MENUS } from './navData';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '../components/Button';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('product');
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Focus trap and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore later
    triggerRef.current = document.activeElement as HTMLElement;

    // Body scroll lock
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first interactive element inside drawer
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const timeout = setTimeout(() => {
      const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
        if (!focusableElements || focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeout);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 right-0 w-full max-w-sm h-full h-[100dvh] bg-[var(--landing-surface-1)] border-l border-[var(--landing-border)] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--landing-border)] min-h-[56px]">
          <span className="font-mono text-xs text-[var(--landing-text-muted)] uppercase tracking-wider">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[var(--landing-radius-sm)] text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible Accordion Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 [scrollbar-width:thin]">
          {NAV_MENUS.map((menu) => {
            const isExpanded = expandedMenu === menu.id;
            return (
              <div
                key={menu.id}
                className="border border-[var(--landing-border)] rounded-[var(--landing-radius-md)] bg-[var(--landing-surface-2)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedMenu(isExpanded ? null : menu.id)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between p-4 min-h-[44px] text-left text-sm font-medium text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface-3)] transition-colors"
                >
                  <span>{menu.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--landing-text-muted)] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[var(--landing-accent)]' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="p-2 pt-0 space-y-1 bg-[var(--landing-surface-2)]">
                    {menu.groups.flatMap((g) => g.items).map((item, idx) => {
                      const Icon = item.icon;
                      const content = (
                        <div className="flex items-center gap-3 p-3 min-h-[44px] rounded-[var(--landing-radius-sm)] hover:bg-[var(--landing-surface-3)] transition-colors text-xs">
                          <Icon className="w-4 h-4 text-[var(--landing-accent)] shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-[var(--landing-text-primary)] truncate">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-[var(--landing-text-muted)] truncate">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      );

                      if (item.to) {
                        return (
                          <Link
                            key={idx}
                            to={item.to}
                            onClick={onClose}
                            className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
                          >
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <a
                          key={idx}
                          href={item.href || '#'}
                          onClick={(e) => {
                            onClose();
                            if (item.href?.startsWith('#')) {
                              e.preventDefault();
                              const targetId = item.href.slice(1);
                              const el = document.getElementById(targetId);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth' });
                                window.history.pushState(null, '', item.href);
                              }
                            }
                          }}
                          className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--landing-accent)]"
                        >
                          {content}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pinned Bottom Actions */}
        <div className="p-4 border-t border-[var(--landing-border)] space-y-2 bg-[var(--landing-surface-1)]">
          {isAuthenticated ? (
            <Button to="/projects" variant="primary" size="md" className="w-full min-h-[44px]">
              Go to Workspace
            </Button>
          ) : (
            <>
              <Button to="/login" variant="secondary" size="md" className="w-full min-h-[44px]">
                Log in
              </Button>
              <Button to="/signup" variant="primary" size="md" className="w-full min-h-[44px]">
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
