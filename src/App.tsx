import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navigation from './components/common/Navigation';
import { useErrorHandler } from './hooks/useErrorHandler';
import { useTheme } from './hooks/useTheme';
import { ToastProvider } from './components/ui/Toast';
import { Loading } from './components/ui';
import { lazyLoad } from './utils/lazyLoad';
import { PerformanceMonitor } from './components/dev/PerformanceMonitor';
import './App.css';

// Lazy load pages for code splitting
const Home = lazyLoad(() => import('./pages/Home'));
const About = lazyLoad(() => import('./pages/About'));
const ComponentDemo = lazyLoad(() => import('./pages/ComponentDemo'), {
  minLoadingTime: 300, // Longer loading for heavy component
});
const ApiExample = lazyLoad(() => import('./components/examples/ApiExample'));
const LoginPage = lazyLoad(() => import('./pages/LoginPage'));
const RegisterPage = lazyLoad(() => import('./pages/RegisterPage'));
const DashboardPage = lazyLoad(() => import('./pages/DashboardPage'));
const ProfilePage = lazyLoad(() => import('./pages/ProfilePage'));
const NotFound = lazyLoad(() => import('./pages/NotFound'));
const ServerError = lazyLoad(() => import('./pages/ServerError'));

const App: React.FC = () => {
  const { handleError } = useErrorHandler();
  
  // Initialize theme system
  useTheme();

  const handleGlobalError = (error: Error, errorInfo: any) => {
    handleError(error, {
      severity: 'critical',
      showToast: false, // ErrorBoundary shows its own UI
      context: {
        componentStack: errorInfo.componentStack,
        type: 'react-error-boundary',
      },
    });
  };

  return (
    <ToastProvider position="top-right">
      <ErrorBoundary onError={handleGlobalError}>
        <Router>
          <div className="App">
            <ErrorBoundary
              onError={handleGlobalError}
              fallback={
                <div style={{ padding: '2rem' }}>
                  <ServerError />
                </div>
              }
            >
              <Navigation />
            </ErrorBoundary>
            
            <main style={{ padding: '2rem' }}>
              <ErrorBoundary onError={handleGlobalError}>
                <Suspense fallback={<Loading text="Loading page..." />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/components" element={<ComponentDemo />} />
                    <Route path="/api-examples" element={<ApiExample />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/error" element={<ServerError />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
      <PerformanceMonitor />
    </ToastProvider>
  );
};

export default App;
