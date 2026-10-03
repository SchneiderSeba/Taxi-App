import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { useAuth } from './features/auth/useAuth';
import { useDriverFinances } from './features/profile/useDriverFinances';
import { useTrips } from './features/trips/useTrips';
import { serviceErrorMessage } from './lib/serviceError';
import { FullPageLoader } from './shared/ui/FullPageLoader';
import NotFoundPage from './shared/ui/NotFoundPage';
import { useToast } from './shared/ui/useToast';
import type { Expense, Trip, TripStatus, UserSettings } from './types';

const CustomerView = lazy(() => import('./components/CustomerView'));
const Login = lazy(() => import('./components/Login'));
const Payment = lazy(() => import('./components/Payment').then((module) => ({ default: module.Payment })));
const ProfileView = lazy(() => import('./components/ProfileView'));
const TripsView = lazy(() => import('./components/TripsView'));

function App() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitializing, logout, error: authError } = useAuth();
  const { trips, loading: tripsLoading, error: tripsError, addTrip, updateTrip } = useTrips();
  const {
    expenses,
    settings,
    loading: financesLoading,
    error: financesError,
    addExpense,
    updateSettings,
  } = useDriverFinances();
  const { notify } = useToast();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      notify(serviceErrorMessage(error instanceof Error ? error : null, 'No pudimos cerrar la sesión.'), 'error');
    }
  }, [logout, navigate, notify]);

  const handleAddTrip = useCallback(async (trip: Omit<Trip, 'id' | 'owner_id' | 'created_at'>) => {
    try {
      await addTrip(trip);
      notify('Viaje agregado correctamente.', 'success');
    } catch (error) {
      notify(serviceErrorMessage(error instanceof Error ? error : null, 'No pudimos agregar el viaje.'), 'error');
      throw error;
    }
  }, [addTrip, notify]);

  const handleUpdateTripStatus = useCallback(async (id: number, done: TripStatus, price?: number) => {
    try {
      await updateTrip(id, done, price);
      notify('Viaje actualizado correctamente.', 'success');
    } catch (error) {
      notify(serviceErrorMessage(error instanceof Error ? error : null, 'No pudimos actualizar el viaje.'), 'error');
      throw error;
    }
  }, [notify, updateTrip]);

  const handleAddExpense = useCallback(async (expense: Omit<Expense, 'id' | 'date' | 'owner_id'>) => {
    try {
      await addExpense(expense);
      notify('Gasto registrado.', 'success');
    } catch (error) {
      notify(serviceErrorMessage(error instanceof Error ? error : null, 'No pudimos registrar el gasto.'), 'error');
      throw error;
    }
  }, [addExpense, notify]);

  const handleUpdateSettings = useCallback(async (nextSettings: UserSettings) => {
    try {
      await updateSettings(nextSettings);
      notify('Configuración guardada en tu cuenta.', 'success');
    } catch (error) {
      notify(serviceErrorMessage(error instanceof Error ? error : null, 'No pudimos guardar la configuración.'), 'error');
      throw error;
    }
  }, [notify, updateSettings]);

  if (isInitializing) return <FullPageLoader label="Preparando TaxiTrack…" />;

  const metadataName = user?.user_metadata.full_name ?? user?.user_metadata.name;
  const userName = typeof metadataName === 'string'
    ? metadataName
    : user?.email?.split('@')[0] || 'Usuario';
  const today = new Date().toISOString().split('T')[0];
  const dailyExpenses = expenses
    .filter((expense) => expense.date === today)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const serviceError = authError || tripsError || financesError;

  const driverLayout = (currentView: 'trips' | 'profile', content: ReactNode) => (
    <ProtectedRoute>
      <Layout
        currentView={currentView}
        onNavigate={(view) => navigate(view === 'trips' ? '/trips' : '/profile')}
        onLogout={handleLogout}
        userName={userName}
      >
        {serviceError ? (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {serviceError}
          </div>
        ) : null}
        {(tripsLoading || financesLoading) ? (
          <div role="status" className="mb-5 rounded-xl border border-white/50 bg-white/60 p-3 text-sm font-medium text-slate-700 backdrop-blur">
            Sincronizando tus datos…
          </div>
        ) : null}
        {content}
      </Layout>
    </ProtectedRoute>
  );

  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/customer" element={<CustomerView />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/trips" replace /> : <Login />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? '/trips' : '/login'} replace />} />
        <Route
          path="/trips"
          element={driverLayout('trips', (
            <TripsView
              trips={trips}
              onAddTrip={handleAddTrip}
              onUpdateTripStatus={handleUpdateTripStatus}
              dailyExpenses={dailyExpenses}
            />
          ))}
        />
        <Route
          path="/profile"
          element={driverLayout('profile', (
            <ProfileView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              trips={trips}
            />
          ))}
        />
        <Route path="/payment" element={<Payment />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
