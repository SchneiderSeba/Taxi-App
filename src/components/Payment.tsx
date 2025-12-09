import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { clientSupaBase } from "../supabase/client";

type PaymentRecord = {
  amount?: number;
  status?: string;
  mp_payment_id?: string;
} & Record<string, unknown>;

export const Payment = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [dbPayment, setDbPayment] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    if (paymentId) {
      clientSupaBase
        .from("payments")
        .select("*")
        .eq("mp_payment_id", paymentId)
        .maybeSingle()
        .then(({ data }) => {
          setDbPayment(data);
        });
    }
  }, [paymentId]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const idParam = searchParams.get("payment_id");

    setStatus(statusParam);
    setPaymentId(idParam);
  }, [searchParams]);

  const badge = useMemo(() => {
    switch (status) {
      case "approved":
      case "success":
        return {
          label: "Pago aprobado",
          className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
        };
      case "pending":
        return {
          label: "Pago pendiente",
          className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
        };
      case "failure":
      case "rejected":
        return {
          label: "Pago rechazado",
          className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
        };
      default:
        return {
          label: "Procesando",
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
        };
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Resultado del pago</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mercado Pago</h1>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {!status && (
            <div className="text-sm text-gray-600 dark:text-gray-300">Procesando pago...</div>
          )}

          {status && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Estado</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{badge.label}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">ID de pago</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{paymentId ?? "-"}</p>
              </div>
            </div>
          )}

          {dbPayment && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-800 space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Detalle en base de datos</p>
              <div className="text-sm text-gray-900 dark:text-gray-100 break-all">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Monto:</span><span className="font-semibold">${dbPayment.amount ?? "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Estado:</span><span className="font-semibold capitalize">{dbPayment.status ?? "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">mp_payment_id:</span><span className="font-semibold">{dbPayment.mp_payment_id ?? "-"}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
