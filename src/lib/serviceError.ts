type ServiceError = { message?: string; details?: string } | null | undefined;

export function serviceErrorMessage(
  error: ServiceError,
  fallback = 'No pudimos completar la operación. Intenta nuevamente.'
): string {
  const detail = `${error?.message ?? ''} ${error?.details ?? ''}`.toLowerCase();

  if (
    detail.includes('failed to fetch') ||
    detail.includes('network') ||
    detail.includes('dns') ||
    detail.includes('load failed')
  ) {
    return 'El servicio de datos no está disponible en este momento. Intenta nuevamente más tarde.';
  }

  return fallback;
}
