import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Save, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BackGround from './UI/BackGround';
import { useAuth } from '../features/auth/useAuth';
import { getCustomerProfile, updateCustomerProfile } from '../features/customer/customer-profile.service';
import { useToast } from '../shared/ui/useToast';

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getCustomerProfile(user.id)
      .then((profile) => {
        if (!active || !profile) return;
        setFullName(profile.full_name);
        setPhone(profile.phone ?? '');
      })
      .catch(() => { if (active) notify('No pudimos cargar tus datos.', 'error'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [notify, user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !fullName.trim()) return;
    setIsSaving(true);
    try {
      await updateCustomerProfile(user.id, { fullName, phone });
      notify('Tus datos fueron actualizados.', 'success');
    } catch {
      notify('No pudimos guardar tus datos.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/customer');
  };

  return (
    <main className="relative min-h-screen overflow-hidden p-4 sm:p-8">
      <div className="fixed inset-0 -z-10">
        <BackGround colorStops={['#059669', '#14b8a6', '#047857']} blend={0.8} amplitude={0.8} speed={0.7} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/70 to-white/95" />
      </div>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/customer" className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-bold text-slate-800 shadow backdrop-blur"><ArrowLeft className="h-4 w-4" /> Conductores</Link>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white/70 px-4 py-2 text-sm font-bold text-red-700"><LogOut className="h-4 w-4" /> Salir</button>
        </div>
        <section className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><UserRound className="h-7 w-7" /></div>
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Perfil del pasajero</p><h1 className="text-3xl font-black text-slate-950">Tus datos</h1></div>
          </div>
          {isLoading ? <p className="mt-8 text-sm font-medium text-slate-600">Cargando información…</p> : (
            <form onSubmit={handleSave} className="mt-8 space-y-5">
              <label className="block text-sm font-bold text-slate-700">Correo electrónico
                <input value={user?.email ?? ''} disabled className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500" />
              </label>
              <label className="block text-sm font-bold text-slate-700">Nombre completo
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required maxLength={120} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="block text-sm font-bold text-slate-700">Teléfono
                <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" autoComplete="tel" maxLength={30} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <button disabled={isSaving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-60"><Save className="h-5 w-5" /> {isSaving ? 'Guardando…' : 'Guardar cambios'}</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
