import { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import TripsView from './components/TripsView';
import ProfileView from './components/ProfileView';
import { Trip, Expense, UserSettings } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'trips' | 'profile'>('trips');
  const [userName] = useState('Usuario');

  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('trips');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : {
      gasUnitCost: 50,
      insuranceMonthly: 100,
      registrationMonthly: 50
    };
  });

  useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('trips');
  };

  const handleAddTrip = (trip: Omit<Trip, 'id' | 'date'>) => {
    const newTrip: Trip = {
      ...trip,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0]
    };
    setTrips([...trips, newTrip]);
  };

  const handleUpdateTripStatus = (id: string, status: Trip['status']) => {
    setTrips(trips.map(trip => trip.id === id ? { ...trip, status } : trip));
  };

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses([...expenses, newExpense]);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(exp => exp.date === today);
  const dailyExpenses = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
      userName={userName}
    >
      {currentView === 'trips' ? (
        <TripsView
          trips={trips}
          onAddTrip={handleAddTrip}
          onUpdateTripStatus={handleUpdateTripStatus}
          dailyExpenses={dailyExpenses}
        />
      ) : (
        <ProfileView
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          expenses={expenses}
          onAddExpense={handleAddExpense}
          trips={trips}
        />
      )}
    </Layout>
  );
}

export default App;
