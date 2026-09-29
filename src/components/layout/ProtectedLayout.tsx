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
    <div className="min-h-screen flex flex-col bg-[#070709]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
