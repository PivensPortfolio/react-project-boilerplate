import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navigation from './components/common/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import ComponentDemo from './pages/ComponentDemo';
import ApiExample from './components/examples/ApiExample';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import { useErrorHandler } from './hooks/useErrorHandler';
import { useTheme } from './hooks/useTheme';
import './App.css';

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
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/components" element={<ComponentDemo />} />
                <Route path="/api-examples" element={<ApiExample />} />
                <Route path="/error" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
