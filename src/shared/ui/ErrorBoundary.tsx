import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <section className="max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">TaxiTrack</p>
          <h1 className="mt-3 text-3xl font-black">Algo salió mal</h1>
          <p className="mt-3 text-slate-300">La aplicación encontró un error inesperado. Recarga la página para recuperar la sesión.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400">
            Recargar aplicación
          </button>
        </section>
      </main>
    );
  }
}
