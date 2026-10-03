import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthProvider';
import { TripsProvider } from './features/trips/TripsProvider';
import { ErrorBoundary } from './shared/ui/ErrorBoundary';
import { ToastProvider } from './shared/ui/ToastProvider';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <TripsProvider>
            <App />
          </TripsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
