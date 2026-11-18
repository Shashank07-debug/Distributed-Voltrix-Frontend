import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Logo } from '../Logo';
import { AccountMenu } from './AccountMenu';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isWorkspace = location.pathname.startsWith('/projects/');

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  const accountMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Close menus on route change without cascading effect renders
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
  }

  // Passive scroll listener for the 8px threshold
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY >= 8;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Viewport resize listener: close mobile menu when viewport grows to md or above
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Escape key listener for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  if (isWorkspace) {
    // Hide standard navbar inside full-screen workspace page
    return null;
  }

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  // Workflow anchor scroll handler: smooth scrolls on '/', navigates from other pages
  const handleWorkflowClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('features');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      window.history.pushState(null, '', '#features');
    }
    // If on another page, Link to="/#features" handles navigation to /#features
  };

  const homeLink = isAuthenticated() ? '/projects' : '/';
  const isHomeActive = location.pathname === '/';
  const isPricingActive = location.pathname === '/billing';

  return (
    <header
      className={`sticky top-0 z-50 w-full pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-150 ${
        isScrolled
          ? 'bg-surface-base border-b border-border-subtle shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
        {/* Left Zone: Brand Logo & Left-aligned Nav Links */}
        <div className="flex items-center gap-8">
          <Link
            to={homeLink}
            className="flex items-center transition-opacity hover:opacity-90 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
            aria-label="Voltrix Home"
          >
            <span className="hidden sm:inline-block">
              <Logo variant="full" size={26} />
            </span>
            <span className="inline-block sm:hidden">
              <Logo variant="mark" size={26} />
            </span>
          </Link>

          {/* Desktop Left-aligned Text-only Nav Links */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium"
            aria-label="Main navigation"
          >
            <Link
              to="/"
              aria-current={isHomeActive ? 'page' : undefined}
              className={`transition-colors py-1 px-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal ${
                isHomeActive
                  ? 'text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/#features"
              onClick={handleWorkflowClick}
              className="text-text-secondary hover:text-text-primary transition-colors py-1 px-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal"
            >
              Workflow
            </Link>
            <Link
              to="/billing"
              aria-current={isPricingActive ? 'page' : undefined}
              className={`transition-colors py-1 px-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal ${
                isPricingActive
                  ? 'text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Pricing & Billing
            </Link>
          </nav>
        </div>

        {/* Right Zone: Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated() ? (
            /* Logged In: ONE circular 36px avatar button */
            <div className="relative">
              <button
                ref={accountMenuButtonRef}
                id="account-menu-button"
                type="button"
                aria-haspopup="menu"
                aria-expanded={isAccountMenuOpen}
                aria-controls="account-menu"
                aria-label="Account menu"
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                className={`w-9 h-9 rounded-full bg-surface-raised hover:bg-surface-overlay border flex items-center justify-center font-mono text-xs font-semibold text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base ${
                  isAccountMenuOpen ? 'border-border-hover ring-1 ring-border-hover' : 'border-border-subtle'
                }`}
              >
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </button>

              <AccountMenu
                isOpen={isAccountMenuOpen}
                onClose={() => setIsAccountMenuOpen(false)}
                triggerRef={accountMenuButtonRef}
                user={user}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            /* Logged Out: Ghost Log in + Filled Get started */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="h-9 px-4 rounded-full text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="h-9 px-4.5 rounded-full text-sm font-medium text-surface-base bg-text-primary hover:bg-white transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button (44x44px touch target) */}
        <div className="flex md:hidden items-center">
          <button
            ref={mobileMenuButtonRef}
            id="mobile-menu-button"
            type="button"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Panel (Full width, min 48px link heights, text-base) */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav-panel"
          role="region"
          aria-labelledby="mobile-menu-button"
          className="md:hidden border-t border-border-subtle bg-surface-base px-4 py-4 space-y-4 shadow-2xl max-h-[calc(100vh-56px)] overflow-y-auto"
        >
          {/* Stacked Nav Links */}
          <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
            <Link
              to="/"
              aria-current={isHomeActive ? 'page' : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`min-h-[48px] flex items-center px-3 rounded-lg text-base font-medium transition-colors ${
                isHomeActive
                  ? 'bg-surface-panel text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/#features"
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleWorkflowClick(e);
              }}
              className="min-h-[48px] flex items-center px-3 rounded-lg text-base font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              Workflow
            </Link>
            <Link
              to="/billing"
              aria-current={isPricingActive ? 'page' : undefined}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`min-h-[48px] flex items-center px-3 rounded-lg text-base font-medium transition-colors ${
                isPricingActive
                  ? 'bg-surface-panel text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
              }`}
            >
              Pricing & Billing
            </Link>
          </nav>

          {/* Divider */}
          <div className="border-t border-border-subtle pt-3">
            {isAuthenticated() ? (
              /* Mobile Logged In Actions */
              <div className="space-y-2">
                <div className="px-3.5 py-2.5 bg-surface-panel rounded-lg border border-border-subtle mb-3">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user?.name || 'Voltrix Developer'}
                  </p>
                  <p className="text-xs text-text-tertiary font-mono truncate mt-0.5">
                    {user?.username}
                  </p>
                </div>

                <Link
                  to="/projects"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full min-h-[48px] flex items-center justify-center px-4 rounded-lg text-sm font-medium bg-surface-raised border border-border-subtle text-text-primary hover:bg-surface-overlay transition-colors"
                >
                  Dashboard
                </Link>

                <Link
                  to="/billing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full min-h-[48px] flex items-center justify-center px-4 rounded-lg text-sm font-medium bg-surface-raised border border-border-subtle text-text-primary hover:bg-surface-overlay transition-colors"
                >
                  Subscription Plan
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full min-h-[48px] flex items-center justify-center px-4 rounded-lg text-sm font-medium text-status-danger bg-status-danger/10 hover:bg-status-danger/20 transition-colors mt-2"
                >
                  Sign out
                </button>
              </div>
            ) : (
              /* Mobile Logged Out Actions */
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full min-h-[48px] flex items-center justify-center px-4 rounded-full text-sm font-medium text-text-primary bg-surface-raised border border-border-subtle hover:bg-surface-overlay transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full min-h-[48px] flex items-center justify-center px-4 rounded-full text-sm font-medium text-surface-base bg-text-primary hover:bg-white transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
