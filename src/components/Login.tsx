import { Chrome } from 'lucide-react';
import { useState } from 'react';
import BackGround from './UI/BackGround';
import { serviceErrorMessage } from '../lib/serviceError';
import { sendMagicLink, signInWithGoogle, signInWithPassword } from '../features/auth/auth.service';


export default function Login() {
  const [registerEmail, setRegisterEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    if (!registerEmail || !password) {
      setRegisterError('Completa todos los campos.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signInWithPassword(registerEmail.trim(), password);
    } catch (error) {
      setRegisterError(serviceErrorMessage(error instanceof Error ? error : null));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    setRegisterError('');
    setRegisterSuccess('');
    if (!registerEmail.trim()) {
      setRegisterError('Ingresa tu correo para recibir el enlace.');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendMagicLink(registerEmail.trim());
      setRegisterSuccess('Revisa tu correo para continuar.');
    } catch (error) {
      setRegisterError(serviceErrorMessage(error instanceof Error ? error : null));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterByGoogle = async () => {
    setRegisterError('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setRegisterError(serviceErrorMessage(error instanceof Error ? error : null));
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="fixed top-0 left-0 w-full h-full z-0">
      <BackGround
        colorStops={["#059669", "#14b8a6", "#047857"]}
        blend={0.8}
        amplitude={0.8}
        speed={0.8}
      />
    </div>
    
      <div className="relative z-10 min-h-screen bg-transparent flex items-center justify-center p-3 sm:p-4 transition-colors">
        
        <div className="max-w-md w-full">

          
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600 dark:bg-emerald-800 rounded-xl mb-3 sm:mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">TaxiTrack</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Gestiona tus viajes y ganancias</p>
          </div>

          <div className="bg-white/25 dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Iniciar sesión</h2>

            <button
              onClick={handleRegisterByGoogle}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white/25 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg px-4 sm:px-6 py-3 sm:py-3.5 text-gray-700 dark:text-gray-200 font-medium hover:bg-white/45 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 hover:shadow-md text-sm sm:text-base min-h-[48px]"
            >
              <Chrome className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              Continuar con Google
            </button>

            {/* Sección de registro con email */}
            <div className="my-6 sm:my-8 flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">o acceder con credenciales</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>
            <form onSubmit={handlePasswordLogin} className="space-y-3 sm:space-y-4">
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white/25 dark:bg-gray-800 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base min-h-[44px]"
                placeholder="Correo electrónico"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white/25 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {registerError && <p className="text-red-600 text-xs sm:text-sm">{registerError}</p>}
              {registerSuccess && <p className="text-emerald-600 text-xs sm:text-sm">{registerSuccess}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-800 dark:hover:bg-emerald-900 text-white font-semibold rounded-lg py-2.5 sm:py-3 transition-colors text-sm sm:text-base min-h-[48px]"
              >
                {isSubmitting ? 'Procesando...' : 'Ingresar al panel'}
              </button>
              <button type="button" onClick={handleMagicLink} disabled={isSubmitting} className="w-full rounded-lg border border-emerald-700 px-4 py-3 text-sm font-semibold text-emerald-900 hover:bg-white/30 disabled:opacity-60 dark:text-emerald-200">
                Enviarme un enlace de acceso
              </button>
            </form>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-4 sm:mt-6">
              Al iniciar sesión, aceptas nuestros términos y condiciones
            </p>
          </div>

          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Acceso exclusivo para conductores registrados
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
