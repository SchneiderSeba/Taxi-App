
import { Home, User, LogOut, Moon, Sun } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import BackGround from './UI/BackGround';

const DRIVER_BACKGROUND_COLORS = ['#059669', '#14b8a6', '#047857'];

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userName: string;
}

export default function Layout({ children, currentView, onNavigate, onLogout, userName }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Sincronizar darkMode con localStorage y clase 'dark' al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <BackGround
          colorStops={DRIVER_BACKGROUND_COLORS}
          blend={0.72}
          amplitude={0.75}
          speed={0.65}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/70 to-slate-50/95 dark:from-slate-950/30 dark:via-slate-950/75 dark:to-slate-950/95" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/70 shadow-sm backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-slate-950/75">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-900/20 sm:h-10 sm:w-10">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="block text-base font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-xl">TaxiTrack</span>
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300 sm:block">Conductor</span>
              </div>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => onNavigate('trips')}
                className={`flex min-h-[40px] items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold transition-all duration-200 sm:gap-2 sm:px-4 ${
                  currentView === 'trips'
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-900/15 dark:bg-white dark:text-slate-950'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Mis Viajes</span>
              </button>

              <button
                onClick={() => onNavigate('profile')}
                className={`flex min-h-[40px] items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold transition-all duration-200 sm:gap-2 sm:px-4 ${
                  currentView === 'profile'
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-900/15 dark:bg-white dark:text-slate-950'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Perfil</span>
              </button>

              <div className="ml-2 flex items-center gap-1 border-l border-slate-200/80 pl-2 dark:border-white/10 sm:ml-4 sm:gap-2 sm:pl-4">
                <span className="hidden max-w-[120px] truncate text-xs font-medium text-slate-600 dark:text-slate-300 md:inline">{userName}</span>
                <button
                  type="button"
                  onClick={() => setDarkMode((value) => !value)}
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  title={darkMode ? 'Usar modo claro' : 'Usar modo oscuro'}
                  aria-label={darkMode ? 'Usar modo claro' : 'Usar modo oscuro'}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={onLogout}
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
