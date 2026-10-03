import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <section className="max-w-lg text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Error 404</p>
        <h1 className="mt-3 text-4xl font-black">Esta ruta no existe</h1>
        <p className="mt-3 text-slate-300">Puedes volver al panel del conductor o buscar un taxi como cliente.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400">Ir al inicio</Link>
          <Link to="/customer" className="rounded-xl border border-white/20 px-5 py-3 font-bold hover:bg-white/10">Buscar conductor</Link>
        </div>
      </section>
    </main>
  );
}
