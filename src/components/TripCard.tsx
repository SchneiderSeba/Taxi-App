import { type FC, type ElementType, useState } from 'react';
import { MapPin, DollarSign, CheckCircle, Clock, XCircle, Edit2, ArrowRightToLine } from 'lucide-react';
import { Trip } from '../types';
import { clientSupaBase } from '../supabase/client';

interface TripCardProps {
  trip: Trip;
  onUpdateStatus: (id: number, done: Trip['done']) => void;
}

const TripCard: FC<TripCardProps> = ({ trip, onUpdateStatus }) => {
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInput, setPriceInput] = useState(trip.price?.toString() || '');
  const [updating, setUpdating] = useState(false);

  const statusConfig: Record<Trip['done'], {
    icon: ElementType;
    color: string;
    bg: string;
    border: string;
    label: string;
  }> = {
    pending: {
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-300',
      bg: 'bg-blue-50 dark:bg-blue-900/40',
      border: 'border-blue-200 dark:border-blue-700',
      label: 'Pendiente'
    },
    completed: {
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-900/40',
      border: 'border-emerald-200 dark:border-emerald-700',
      label: 'Aprobado'
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-900/40',
      border: 'border-red-200 dark:border-red-700',
      label: 'Cancelado'
    }
  };

  const config = statusConfig[trip.done];
  const StatusIcon = config.icon;

  const priceLabel = typeof trip.price === 'number'
    ? `$${trip.price.toFixed(2)}`
    : 'Sin tarifa registrada';

  const updateStatus = async (id: number, done: Trip['done']) => {
    try {
      const { error } = await clientSupaBase.from('Trips').update({ done }).eq('id', id);
      if (error) {
        console.error('Error updating trip status:', error);
      } else {
        onUpdateStatus(id, done);
      }
    } catch (error) {
      console.error('Error updating trip status:', error);
    }
  };

  const handleAcceptWithPrice = async () => {
    if (!priceInput || isNaN(parseFloat(priceInput))) {
      alert('Por favor ingresa un precio válido');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await clientSupaBase
        .from('Trips')
        .update({ 
          done: 'completed',
          price: parseFloat(priceInput)
        })
        .eq('id', trip.id);

      if (error) {
        console.error('Error updating trip:', error);
        alert('Error al actualizar el viaje');
      } else {
        onUpdateStatus(trip.id, 'completed');
        setShowPriceModal(false);
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Error al actualizar el viaje');
    }
    setUpdating(false);
  };

  const handleApproveClick = () => {
    if (trip.customer_id) {
      setShowPriceModal(true);
    } else {
      updateStatus(trip.id, 'completed');
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border-2 ${config.border} p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{trip.name}</h3>
              <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm inline-flex items-center gap-2">
              {trip.address || trip.pickup}
              {trip.pickup && trip.destination && (
                <>
                  <ArrowRightToLine className="w-4 h-4" />
                  {trip.destination}
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 font-semibold">
            <DollarSign className="w-5 h-5" />
            <span className="text-lg">{priceLabel}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {trip.done === 'pending' && (
            <>
              <button
                onClick={handleApproveClick}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 dark:bg-emerald-800 dark:hover:bg-emerald-900 transition-all duration-200"
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar solicitud
              </button>
              <button
                onClick={() => updateStatus(trip.id, 'cancelled')}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-900 transition-all duration-200"
              >
                <XCircle className="w-4 h-4" />
                Cancelar solicitud
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal para editar precio */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Establecer precio del viaje
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cliente: <span className="font-semibold">{trip.name}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {trip.address}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Precio del viaje (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPriceModal(false)}
                disabled={updating}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAcceptWithPrice}
                disabled={updating}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Aprobar viaje
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCard;
