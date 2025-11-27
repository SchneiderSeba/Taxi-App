
import { Home, User, LogOut } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userName: string;
}

export default function Layout({ children, currentView, onNavigate, onLogout, userName }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TaxiTrack</span>
            </div>

            <nav className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('trips')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === 'trips'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200'
                    : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Mis Viajes</span>
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentView === 'profile'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200'
                    : 'text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </button>

              <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-200 hidden sm:inline">{userName}</span>
                {/* Switch dark mode */}
                <label className="flex items-center cursor-pointer select-none">
                  <span className="mr-2">🌞</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={() => setDarkMode((v) => !v)}
                      className="sr-only"
                    />
                    <div className="block w-12 h-7 rounded-full bg-gray-400 dark:bg-gray-700 transition-colors"></div>
                    <div
                      className={`dot absolute left-1 top-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 transition-transform duration-300 ${darkMode ? 'translate-x-5' : ''}`}
                    ></div>
                  </div>
                  <span className="ml-2">🌙</span>
                </label>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
