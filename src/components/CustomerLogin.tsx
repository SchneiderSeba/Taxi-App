import { useState } from 'react';
import { Car, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackGround from './UI/BackGround';
import { signInWithPassword, signUpCustomer } from '../features/auth/auth.service';
import { serviceErrorMessage } from '../lib/serviceError';

export default function CustomerLogin() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!email.trim() || password.length < 8 || (mode === 'register' && !fullName.trim())) {
      setError('Completa los datos requeridos. La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithPassword(email.trim(), password);
      } else {
        const result = await signUpCustomer(email.trim(), password, { fullName, phone });
        if (result.requiresEmailConfirmation) {
          setMessage('Cuenta creada. Revisa tu correo para confirmar el acceso.');
        }
      }
    } catch (requestError) {
      setError(serviceErrorMessage(requestError instanceof Error ? requestError : null, 'No pudimos completar el acceso.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="fixed inset-0 -z-10">
        <BackGround colorStops={['#059669', '#14b8a6', '#047857']} blend={0.8} amplitude={0.8} speed={0.7} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/65 to-white/90" />
      </div>
      <section className="w-full max-w-md rounded-3xl border border-white/70 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <Link to="/customer" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950">
          <Car className="h-5 w-5" /> Volver a conductores
        </Link>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Cuenta de pasajero</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h1>
        <p className="mt-2 text-sm text-slate-600">Guarda tus datos y conserva tu identidad de viaje entre dispositivos.</p>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMode('login')} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === 'login' ? 'bg-white text-slate-950 shadow' : 'text-slate-500'}`}>Ingresar</button>
          <button type="button" onClick={() => setMode('register')} className={`rounded-lg px-3 py-2 text-sm font-bold ${mode === 'register' ? 'bg-white text-slate-950 shadow' : 'text-slate-500'}`}>Registrarme</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' ? (
            <>
              <label className="block text-sm font-bold text-slate-700">Nombre completo
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" required />
              </label>
              <label className="block text-sm font-bold text-slate-700">Teléfono
                <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
            </>
          ) : null}
          <label className="block text-sm font-bold text-slate-700">Correo electrónico
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" required />
          </label>
          <label className="block text-sm font-bold text-slate-700">Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" required />
          </label>
          {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          {message ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{message}</p> : null}
          <button disabled={isSubmitting} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
            {mode === 'login' ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            {isSubmitting ? 'Procesando…' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">¿Eres conductor? <Link to="/login" className="font-bold text-emerald-700">Accede al panel profesional</Link></p>
      </section>
    </main>
  );
}
