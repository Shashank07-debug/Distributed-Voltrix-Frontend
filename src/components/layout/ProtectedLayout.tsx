import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Navbar } from '../common/Navbar';

export const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface-base">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
