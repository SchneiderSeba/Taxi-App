
import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import { RequestStatusCard } from './CostumerView';
import { MercadoPagoBtn } from '../supabase/functions';

interface CustomerTripCardProps {
  lastRequest: RequestStatusCard;
}


export default function CustomerTripCard({ lastRequest }: CustomerTripCardProps) {
  return (

    <>
    {lastRequest && (
            <section className="px-4 sm:px-6 pb-6 sm:pb-10 max-w-4xl mx-auto">
                <div className={`bg-white dark:bg-gray-900 border rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 ${
                lastRequest.status === 'completed' 
                    ? 'border-green-200 dark:border-green-800' 
                    : lastRequest.status === 'cancelled' 
                    ? 'border-red-200 dark:border-red-800' 
                    : 'border-emerald-200 dark:border-emerald-800'
                }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                    <p className="text-xs sm:text-sm text-gray-500">Estado de tu solicitud</p>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{lastRequest.driverName}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {lastRequest.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 text-xs sm:text-sm font-semibold min-h-[44px]">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        Pendiente
                        </span>
                    )}
                    {lastRequest.status === 'completed' && (
                    <>
                        <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200 text-xs sm:text-sm font-semibold min-h-[44px]">
                        <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        Aceptado
                        </span>
                        <span className="inline-flex items-center gap-0.5 sm:gap-1 text-emerald-600 dark:text-emerald-300 font-semibold text-sm sm:text-base min-h-[44px]">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        {lastRequest.price?.toFixed(2)}
                        </span>
                        <>
                            <MercadoPagoBtn 
                              ownerId={lastRequest.ownerId}
                              clientId={lastRequest.customerId}
                              price={lastRequest.price || 0}
                            />
                        </>
                    </>
                    )}

                    {lastRequest.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 text-xs sm:text-sm font-semibold min-h-[44px]">
                        <span className="text-lg sm:text-xl leading-none">×</span>
                        Cancelado
                        </span>
                    )}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    <div>
                    <p className="uppercase text-[10px] sm:text-xs text-gray-500 tracking-wide">Origen</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{lastRequest.pickup}</p>
                    </div>
                    <div>
                    <p className="uppercase text-[10px] sm:text-xs text-gray-500 tracking-wide">Destino</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{lastRequest.destination}</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                    <p className="uppercase text-[10px] sm:text-xs text-gray-500 tracking-wide">Horario</p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{lastRequest.preferredTime}</p>
                    </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Última actualización: {new Date(lastRequest.createdAt).toLocaleString()}.
                    {lastRequest.status === 'pending' && ' Te avisaremos cuando el conductor confirme o rechace la solicitud.'}
                    {lastRequest.status === 'completed' && ' ¡Tu viaje ha sido aceptado! El conductor se pondrá en contacto contigo.'}
                    {lastRequest.status === 'cancelled' && ' Lo sentimos, tu solicitud fue rechazada. Puedes intentar con otro conductor.'}
                </p>
                </div>
            </section>
            )}
    </>
  );
}