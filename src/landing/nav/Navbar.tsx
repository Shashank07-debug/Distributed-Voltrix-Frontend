import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { NAV_MENUS } from './navData';
import { NavDropdown } from './NavDropdown';
import { MobileDrawer } from './MobileDrawer';
import { Caret } from '../components/Caret';
import { Button } from '../components/Button';
import { Menu, Sparkles } from 'lucide-react';
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
      setIsScrolled(window.scrollY >= 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* Floating Pill Navbar */}
      <div className="fixed top-3 sm:top-4 inset-x-0 mx-auto max-w-5xl px-3 sm:px-4 z-50 pointer-events-none">
        <header
          className={`pointer-events-auto mx-auto rounded-full border transition-all duration-200 px-3 sm:px-5 flex items-center justify-between select-none ${
            isScrolled
              ? 'h-14 bg-[#090D0F]/90 border-[var(--landing-accent)]/20 shadow-xl backdrop-blur-xl'
              : 'h-14 sm:h-16 bg-[#090D0F]/75 border-[var(--landing-border)] backdrop-blur-md shadow-md'
          }`}
        >
          {/* Left Zone: Logo with Hover Caret */}
          <Link
            to={authenticated ? '/projects' : '/'}
            className="flex items-center gap-2 group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
            aria-label="Voltrix home"
          >
            <Logo variant="full" size={24} />
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
          <div className="hidden md:flex items-center gap-2">
            {authenticated ? (
              <Button to="/projects" variant="primary" size="sm" magnetic>
                <span>Workspace</span>
              </Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button to="/signup" variant="primary" size="sm" magnetic>
                  <span>Get started</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#090D0F]" />
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
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--landing-accent)]"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        isAuthenticated={authenticated}
      />
    </>
  );
};
