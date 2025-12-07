import { initMercadoPago } from '@mercadopago/sdk-react'
import { clientSupaBase } from './client';
import { CreditCard } from 'lucide-react';

initMercadoPago('APP_USR-f04eb54c-47b0-47e1-a969-36742ae9f0af');


export const MercadoPagoBtn = () => {

    const handlePayment = async () => {
        try {
            const { data, error } = await clientSupaBase.functions.invoke("mp-preference", {
                body: {
                    title: "Viaje en Taxi",
                    price: 1500,
                    quantity: 1
                }
            });

            if (error) {
                console.error('Error al invocar función:', error);
                alert('Error al procesar el pago. Por favor intenta nuevamente.');
                return;
            }

            if (!data || !data.init_point) {
                console.error('No se recibió init_point:', data);
                alert('Error: No se pudo generar el link de pago');
                return;
            }

            console.log('Redirigiendo a Mercado Pago...');
            window.location.href = data.init_point;
            
        } catch (error) {
            console.error('Error creating preference:', error);
            alert('Error al conectar con el servidor de pagos');
        }
    };

    return (
        
        <button>
            <span onClick={handlePayment} className="flex items-center gap-2 px-4 py-2 text-gray-800 dark:text-gray-900 bg-gradient-to-br from-sky-300/80 to-yellow-200/80 hover:from-sky-400/90 hover:to-yellow-300/90 dark:from-sky-400/70 dark:to-yellow-300/70 dark:hover:from-sky-500/80 dark:hover:to-yellow-400/80 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                Pagar con Mercado Pago <CreditCard className="w-4 h-4 shrink-0" />
            </span>
        </button>
    );
}