import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-route-transition min-h-screen">
      <Outlet />
    </div>
  );
};
