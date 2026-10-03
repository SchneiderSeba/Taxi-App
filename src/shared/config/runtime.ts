const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

export function getAppUrl(): string {
  const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  const fallbackUrl = window.location.origin;

  if (!configuredUrl) return fallbackUrl;

  try {
    const parsedUrl = new URL(configuredUrl);
    return HTTP_PROTOCOLS.has(parsedUrl.protocol) ? parsedUrl.origin : fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}

export function getAuthRedirectUrl(path = '/login'): string {
  return `${getAppUrl()}${path}`;
}
