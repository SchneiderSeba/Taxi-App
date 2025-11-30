import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import TripsView from './components/TripsView';
import ProfileView from './components/ProfileView';
import { Trip, Expense, UserSettings } from './types';

import { clientSupaBase } from './supabase/client';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [refresh, setRefresh] = useState(false);
  const [userName] = useState('Usuario');
  const navigate = useNavigate();

  // Crear registro en UserProfile si no existe
  useEffect(() => {
    async function ensureUserProfile() {
      const { data: userData } = await clientSupaBase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data: profile, error } = await clientSupaBase
        .from('UsersProfile')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user profile', error);
        return;
      }

      if (!profile) {
        const payload = {
          owner_id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'Usuario',
          created_at: new Date().toISOString(),
          carModel: '',
          carPlate: '',
          pictureUrl: null
        };
        const { error: insertError } = await clientSupaBase
          .from('UsersProfile')
          .insert([payload])
          .select();
        if (insertError) {
          console.error('Error inserting user profile', insertError, payload);
        }
      }
    }
    if (isAuthenticated) {
      ensureUserProfile();
    }
  }, [isAuthenticated]);

  // Sincroniza el estado de autenticación con Supabase
  useEffect(() => {
    // Chequea usuario actual al montar
    clientSupaBase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setIsAuthenticated(true);
      }
    });
    // Suscribe a cambios de sesión
    const { data: listener } = clientSupaBase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // Cargar todos los viajes desde Supabase al iniciar
  useEffect(() => {
    if (!isAuthenticated) {
      setTrips([]);
      setLoadingTrips(false);
      return;
    } else {
      const fetchTrips = async () => {
        setLoadingTrips(true);
        const { data: userData } = await clientSupaBase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) {
          setTrips([]);
          setLoadingTrips(false);
          return;
        }
        const { data, error } = await clientSupaBase
          .from('Trips')
          .select('*')
          .eq('owner_id', userId);
        if (!error && data) {
          setTrips(data);
        }
        setLoadingTrips(false);

        console.log('User ID:', userId);
        console.log('Trips:', data);
      };
      fetchTrips();
      
    }
  }, [isAuthenticated]);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      gasUnitCost: 50,
      insuranceMonthly: 100,
      registrationMonthly: 50
    };
  });




  // Cargar todos los gastos desde Supabase al iniciar
  useEffect(() => {
    if (!isAuthenticated) {
      setExpenses([]);
      setLoadingExpenses(false);
      return;
    } else {
      const fetchExpenses = async () => {
        setLoadingExpenses(true);
        const { data: userData } = await clientSupaBase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) {
          setExpenses([]);
          setLoadingExpenses(false);
          return;
        }
        const { data, error } = await clientSupaBase
          .from('Expenses')
          .select('*')
          .eq('owner_id', userId);
        if (!error && data) {
          setExpenses(data);
        }
        setLoadingExpenses(false);
      };
      fetchExpenses();
    }
  }, [isAuthenticated]);


  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/trips');
  };

  const handleLogout = () => {
    clientSupaBase.auth.signOut();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleAddTrip = async (trip: Omit<Trip, 'id' | 'date' | 'owner_id'>) => {
    // Obtener el usuario autenticado
    const { data: userData } = await clientSupaBase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    // Insertar en Supabase con owner_id
    const { error } = await clientSupaBase.from('Trips').insert([
      {
        ...trip,
        owner_id: userId,
        done: false
      }
    ]);
    // Si no hay error, volver a hacer fetch de los viajes
    if (!error) {
      const { data: tripsData, error: tripsError } = await clientSupaBase
        .from('Trips')
        .select('*')
        .eq('owner_id', userId);
      if (!tripsError && tripsData) {
        setTrips(tripsData);
        // setRefresh(!refresh);
      }
    }
  };

  const handleUpdateTripStatus = async (id: number, done: Trip['done']) => {
    // Actualizar en Supabase
    const { data, error } = await clientSupaBase.from('Trips').update({ done }).eq('id', id).select();
    if (!error && data && data.length > 0) {
      setTrips(trips.map(trip => trip.id === id ? data[0] : trip));
      // setRefresh(!refresh);
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'date' | 'owner_id'>) => {
    // Obtener el usuario autenticado
    const { data: userData } = await clientSupaBase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    const newExpense = {
      ...expense,
      owner_id: userId,
      date: new Date().toISOString().split('T')[0]
    };
    const { error } = await clientSupaBase.from('Expenses').insert([newExpense]);
    // Si no hay error, volver a hacer fetch de los gastos
    if (!error) {
      const { data: expensesData, error: expensesError } = await clientSupaBase
        .from('Expenses')
        .select('*')
        .eq('owner_id', userId);
      if (!expensesError && expensesData) {
        setExpenses(expensesData);
      }
    }
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    // setRefresh(!refresh);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(exp => exp.date === today);
  const dailyExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/trips" replace /> : <Login onLogin={handleLogin} />
        }
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/trips' : '/login'} replace />}
      />
      <Route
        path="/trips"
        element={
          isAuthenticated ? (
            <Layout
              currentView="trips"
              onNavigate={view => navigate(view === 'trips' ? '/trips' : '/profile')}
              onLogout={handleLogout}
              userName={userName}
            >
              <TripsView
                trips={trips}
                onAddTrip={handleAddTrip}
                onUpdateTripStatus={handleUpdateTripStatus}
                dailyExpenses={dailyExpenses}
              />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <Layout
              currentView="profile"
              onNavigate={view => navigate(view === 'trips' ? '/trips' : '/profile')}
              onLogout={handleLogout}
              userName={userName}
            >
              <ProfileView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                trips={trips}
              />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
