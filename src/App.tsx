import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import TripsView from './components/TripsView';
import ProfileView from './components/ProfileView';
import CostumerView from './components/CostumerView';
import { Trip, Expense, UserSettings } from './types';

import { clientSupaBase } from './supabase/client';
import { TripProvider, useTripContext } from './Context/TripContext';
import { UserProvider, useUserContext } from './Context/UserContext';
import { Payment } from './components/Payment';

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [refresh, setRefresh] = useState(false);
  const [userName] = useState('Usuario');
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useUserContext();
  const { trips, setTrips } = useTripContext();


  const [expenses, setExpenses] = useState<Expense[]>([]);

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
      return;
    } else {
      const fetchExpenses = async () => {
        const { data: userData } = await clientSupaBase.auth.getUser();
        const userId = userData?.user?.id;
        if (!userId) {
          setExpenses([]);
          return;
        }
        const { data, error } = await clientSupaBase
          .from('Expenses')
          .select('*')
          .eq('owner_id', userId);
        if (!error && data) {
          setExpenses(data);
        }
      };
      fetchExpenses();
    }
  }, [isAuthenticated]);


  const handleLogout = () => {
    clientSupaBase.auth.signOut();
    setIsAuthenticated(false);
    navigate('/login');
  };

  const handleAddTrip = async (trip: Omit<Trip, 'id' | 'owner_id' | 'created_at'>) => {
    // Obtener el usuario autenticado
    const { data: userData } = await clientSupaBase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;
    
    // Insertar en Supabase con owner_id
    // Si el trip tiene 'address', lo usamos como 'destination'
    const payload: any = {
      name: trip.name,
      price: trip.price,
      done: trip.done ?? 'pending',
      owner_id: userId
    };
    
    // Si viene de AddTripModal (tiene address), usar address como destination
    if (trip.address) {
      payload.destination = trip.address;
    }
    
    // Si viene de CostumerView (tiene pickup y destination), usarlos directamente
    if (trip.pickup) payload.pickup = trip.pickup;
    if (trip.destination) payload.destination = trip.destination;
    
    const { error } = await clientSupaBase.from('Trips').insert([payload]);
    
    // Si no hay error, volver a hacer fetch de los viajes
    if (!error) {
      const { data: tripsData, error: tripsError } = await clientSupaBase
        .from('Trips')
        .select('*')
        .eq('owner_id', userId);
      if (!tripsError && tripsData) {
        setTrips(tripsData);
      }
    } else {
      console.error('Error inserting trip:', error);
      console.error('Payload that failed:', payload);
      alert(`Error al crear el viaje: ${error.message || 'Error desconocido'}`);
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
    <UserProvider>
      <TripProvider>
        <Routes>
                <Route
                  path="/customer"
                  element={<CostumerView />}
              />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/trips" replace /> : <Login />
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

          <Route path="/payment" element={<Payment />} />

      </Routes>
     </TripProvider>
    </UserProvider>
  );
}

export default App;
