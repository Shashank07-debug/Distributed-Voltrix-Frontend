import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { NAV_MENUS } from './navData';
import { NavDropdown } from './NavDropdown';
import { MobileDrawer } from './MobileDrawer';
import { Caret } from '../components/Caret';
import { Button } from '../components/Button';
import { Menu } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const triggerRefs = useRef<{ [key: string]: React.RefObject<HTMLButtonElement | null> }>({
    product: React.createRef(),
    resources: React.createRef(),
    pricing: React.createRef(),
    documentation: React.createRef(),
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= 16);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[role="menu"]') && !target.closest('button[aria-haspopup="menu"]')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const authenticated = isAuthenticated();

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-[background-color,border-color,height] duration-200 select-none ${
          isScrolled
            ? 'h-16 bg-[#0B0B0C]/80 border-b border-[var(--landing-border)] backdrop-blur-md shadow-sm'
            : 'h-[72px] bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Left Zone: Logo with Hover Caret */}
          <Link
            to={authenticated ? '/projects' : '/'}
            className="flex items-center gap-2 group rounded-[var(--landing-radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            aria-label="Voltrix home"
          >
            <Logo variant="full" size={26} />
            <span
              className={`transition-opacity duration-150 ${
                isLogoHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Caret staticCaret={false} />
            </span>
          </Link>

          {/* Center: Desktop Mega-Menu Nav Dropdowns */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {NAV_MENUS.map((menu) => (
              <NavDropdown
                key={menu.id}
                menu={menu}
                isOpen={activeDropdown === menu.id}
                onOpen={() => setActiveDropdown(menu.id)}
                onClose={() => {
                  if (activeDropdown === menu.id) setActiveDropdown(null);
                }}
                triggerRef={triggerRefs.current[menu.id]}
              />
            ))}
          </nav>

          {/* Right Zone: Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {authenticated ? (
              <Button to="/projects" variant="primary" size="md">
                Dashboard
              </Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="md">
                  Log in
                </Button>
                <Button to="/signup" variant="primary" size="md">
                  Get started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open menu"
              className="p-2 rounded-[var(--landing-radius-sm)] text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        isAuthenticated={authenticated}
      />
    </>
  );
};
