import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FullPageLoader } from '../../shared/ui/FullPageLoader';
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { accountType, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <FullPageLoader label="Restaurando tu sesión…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (accountType !== 'driver') return <Navigate to="/customer" replace />;
  return children;
}

export function CustomerProtectedRoute({ children }: { children: ReactNode }) {
  const { accountType, isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <FullPageLoader label="Restaurando tu sesión…" />;
  if (!isAuthenticated) return <Navigate to="/customer/login" replace state={{ from: location.pathname }} />;
  if (accountType !== 'customer') return <Navigate to="/trips" replace />;
  return children;
}
