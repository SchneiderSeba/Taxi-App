import { Chrome } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TaxiTrack</h1>
          <p className="text-gray-600">Gestiona tus viajes y ganancias</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Iniciar sesión</h2>

          <button
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-6 py-3.5 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
          >
            <Chrome className="w-5 h-5" />
            Continuar con Google
          </button>

          <p className="text-sm text-gray-500 text-center mt-6">
            Al iniciar sesión, aceptas nuestros términos y condiciones
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Sistema de gestión para taxistas profesionales
          </p>
        </div>
      </div>
    </div>
  );
}
