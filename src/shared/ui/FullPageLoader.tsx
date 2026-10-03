import { Loader2 } from 'lucide-react';

export function FullPageLoader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white" role="status">
      <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 backdrop-blur">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
        <span className="font-semibold">{label}</span>
      </div>
    </div>
  );
}
