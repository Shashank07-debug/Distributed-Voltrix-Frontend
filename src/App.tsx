import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { PublicLayout } from './components/layout/PublicLayout';
import { ProtectedLayout } from './components/layout/ProtectedLayout';

import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { SignupPage } from './pages/Auth/SignupPage';
import { ProjectsDashboard } from './pages/Dashboard/ProjectsDashboard';
import { WorkspacePage } from './pages/Workspace/WorkspacePage';
import { BillingPage } from './pages/Billing/BillingPage';

import { CustomCursor } from './components/common/CustomCursor';
import { Preloader } from './components/common/Preloader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

export const App: React.FC = () => {
  const [showPreloader, setShowPreloader] = useState<boolean>(() => {
    // Show preloader only on initial fresh session load
    return !sessionStorage.getItem('voltrix_visited');
  });

  const handlePreloaderComplete = () => {
    sessionStorage.setItem('voltrix_visited', 'true');
    setShowPreloader(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
        <CustomCursor />
        
        {/* Global Toast Notifications */}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0D0E15',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#F3F4F6',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />

        <Routes>
          {/* Public Marketing Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/projects" element={<ProjectsDashboard />} />
            <Route path="/billing" element={<BillingPage />} />
          </Route>

          {/* Full Screen Workspace Route */}
          <Route element={<ProtectedLayout />}>
            <Route path="/projects/:projectId" element={<WorkspacePage />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
