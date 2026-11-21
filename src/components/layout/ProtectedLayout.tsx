import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { AppNavbar } from './AppNavbar';

export const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const isWorkspace =
    location.pathname.startsWith('/projects/') && location.pathname !== '/projects';

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--landing-bg-ink)] text-[var(--landing-text-primary)] selection:bg-[var(--landing-accent)] selection:text-black">
      {!isWorkspace && <AppNavbar mode="dashboard" />}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};
