import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { createPaymentPreference } from '../payment.service';
import { useToast } from '../../../shared/ui/useToast';

type MercadoPagoButtonProps = {
  tripId: number;
  clientId: string;
};

export function MercadoPagoButton({ tripId, clientId }: MercadoPagoButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { notify } = useToast();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const checkoutUrl = await createPaymentPreference(tripId, clientId);
      window.location.assign(checkoutUrl);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No pudimos iniciar el pago.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={isLoading}
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      {isLoading ? 'Preparando pago...' : 'Pagar viaje'}
    </button>
  );
}
