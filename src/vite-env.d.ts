/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PUBLIC_SUPABASE_URL: string;
	readonly VITE_PUBLIC_SUPABASE_KEY: string;
	readonly VITE_PUBLIC_MERCADO_PAGO_KEY: string;
	readonly VITE_PUBLIC_GOOGLEMAP_KEY: string;
	readonly VITE_PUBLIC_APP_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
