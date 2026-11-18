import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../store/useAuthStore';

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  user: User | null;
  onLogout: () => void;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({
  isOpen,
  onClose,
  triggerRef,
  user,
  onLogout,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  // Outside click listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, onClose, triggerRef]);

  // Focus the first item when menu opens
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow DOM node render
      const timeout = setTimeout(() => {
        itemsRef.current[0]?.focus();
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Keyboard navigation for WAI-ARIA Menu pattern
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = itemsRef.current.filter(
      (item): item is HTMLAnchorElement | HTMLButtonElement => item !== null
    );
    if (!items.length) return;

    const activeIndex = items.findIndex((item) => item === document.activeElement);

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = activeIndex === -1 || activeIndex === items.length - 1 ? 0 : activeIndex + 1;
        items[nextIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
        items[prevIndex]?.focus();
        break;
      }
      case 'Home': {
        event.preventDefault();
        items[0]?.focus();
        break;
      }
      case 'End': {
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      }
      case 'Tab': {
        // Tab closes menu per accessibility requirements
        onClose();
        break;
      }
      case 'Escape': {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
        break;
      }
      default:
        break;
    }
  };

  return (
    <div
      ref={menuRef}
      id="account-menu"
      role="menu"
      aria-labelledby="account-menu-button"
      onKeyDown={handleKeyDown}
      className="absolute right-0 top-full mt-2 w-56 py-1.5 bg-surface-panel border border-border-subtle rounded-xl shadow-2xl z-50 focus:outline-none"
    >
      {/* Header row: user's name & username */}
      <div className="px-4 py-2.5 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-primary truncate">
          {user?.name || 'Voltrix Developer'}
        </p>
        <p className="text-[11px] text-text-tertiary font-mono truncate mt-0.5">
          {user?.username}
        </p>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <Link
          to="/projects"
          role="menuitem"
          ref={(el) => { itemsRef.current[0] = el; }}
          onClick={onClose}
          className="w-full px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-raised flex items-center transition-colors focus-visible:outline-none focus-visible:bg-surface-raised focus-visible:text-text-primary"
        >
          Dashboard
        </Link>
        <Link
          to="/billing"
          role="menuitem"
          ref={(el) => { itemsRef.current[1] = el; }}
          onClick={onClose}
          className="w-full px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-raised flex items-center transition-colors focus-visible:outline-none focus-visible:bg-surface-raised focus-visible:text-text-primary"
        >
          Subscription Plan
        </Link>
      </div>

      <div className="border-t border-border-subtle pt-1 mt-1">
        <button
          type="button"
          role="menuitem"
          ref={(el) => { itemsRef.current[2] = el; }}
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full px-4 py-2 text-xs text-status-danger hover:bg-status-danger/10 flex items-center transition-colors text-left focus-visible:outline-none focus-visible:bg-status-danger/10"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};
