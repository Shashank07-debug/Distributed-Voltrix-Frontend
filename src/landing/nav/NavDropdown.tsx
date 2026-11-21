import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NavMenu } from './navData';
import { ChevronDown } from 'lucide-react';

export interface NavDropdownProps {
  menu: NavMenu;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  menu,
  isOpen,
  onOpen,
  onClose,
  triggerRef,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      onOpen();
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      onClose();
    }, 200);
  };

  // Keyboard navigation within menu
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      triggerRef.current?.focus();
      return;
    }

    const items = panelRef.current?.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]');
    if (!items || items.length === 0) return;

    const currentIndex = Array.from(items).indexOf(document.activeElement as HTMLAnchorElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        id={`nav-trigger-${menu.id}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`nav-menu-${menu.id}`}
        onClick={() => (isOpen ? onClose() : onOpen())}
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[var(--landing-radius-sm)] transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)] ${
          isOpen
            ? 'text-[var(--landing-text-primary)] bg-[var(--landing-surface-2)]'
            : 'text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface-1)]'
        }`}
      >
        <span>{menu.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 text-[var(--landing-text-muted)] ${
            isOpen ? 'rotate-180 text-[var(--landing-accent)]' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id={`nav-menu-${menu.id}`}
          role="menu"
          aria-labelledby={`nav-trigger-${menu.id}`}
          className={`absolute left-0 top-full pt-2 z-50 ${menu.widthClass || 'w-96'}`}
          onKeyDown={handleKeyDown}
        >
          <div className="bg-[var(--landing-surface-2)] border border-[var(--landing-border)] rounded-[var(--landing-radius-lg)] p-3 shadow-xl backdrop-blur-xl animate-in fade-in-0 slide-in-from-top-2 duration-180">
            <div
              className={`grid gap-4 ${
                menu.groups.length > 1 ? `grid-cols-${menu.groups.length}` : 'grid-cols-1'
              }`}
            >
              {menu.groups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1.5">
                  {group.groupName && (
                    <div className="px-2.5 py-1 text-[11px] font-mono text-[var(--landing-text-muted)] tracking-wider uppercase">
                      {group.groupName}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {group.items.map((item, itemIdx) => {
                      const Icon = item.icon;
                      const content = (
                        <div className="flex items-start gap-3 p-2 rounded-[var(--landing-radius-md)] hover:bg-[var(--landing-surface-3)] transition-colors group">
                          <div className="w-8 h-8 rounded-[var(--landing-radius-sm)] bg-[var(--landing-surface-1)] border border-[var(--landing-border)] flex items-center justify-center shrink-0 text-[var(--landing-text-secondary)] group-hover:text-[var(--landing-accent)] group-hover:border-[var(--landing-accent-subtle)] transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[var(--landing-text-primary)] group-hover:text-[var(--landing-accent)] transition-colors">
                              {item.title}
                            </div>
                            <p className="text-xs text-[var(--landing-text-muted)] line-clamp-1 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );

                      if (item.to) {
                        return (
                          <Link
                            key={itemIdx}
                            to={item.to}
                            role="menuitem"
                            tabIndex={0}
                            onClick={onClose}
                            className="block rounded-[var(--landing-radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
                          >
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <a
                          key={itemIdx}
                          href={item.href || '#'}
                          role="menuitem"
                          tabIndex={0}
                          onClick={() => {
                            onClose();
                            if (item.href?.startsWith('#')) {
                              const el = document.getElementById(item.href.replace('#', ''));
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="block rounded-[var(--landing-radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
                        >
                          {content}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
