import { MapPin, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { Trip } from '../types';
import { clientSupaBase } from '../supabase/client';

interface TripCardProps {
  trip: Trip;
  onUpdateStatus: (id: number, done: boolean) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onUpdateStatus }) => {
  // Config visual según done
  const config = trip.done
    ? {
        icon: CheckCircle,
        color: 'text-emerald-600 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-900/40',
        border: 'border-emerald-200 dark:border-emerald-700',
        label: 'Completado'
      }
    : {
        icon: Clock,
        color: 'text-blue-600 dark:text-blue-300',
        bg: 'bg-blue-50 dark:bg-blue-900/40',
        border: 'border-blue-200 dark:border-blue-700',
        label: 'Pendiente'
      };
  const StatusIcon = config.icon;

  const updateStatus = async (id: number, done: boolean) => {
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
            <span className="text-sm">{trip.address}</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 font-semibold">
            <DollarSign className="w-5 h-5" />
            <span className="text-lg">${trip.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!trip.done && (
            <button
              onClick={() => updateStatus(trip.id, true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 dark:bg-emerald-800 dark:hover:bg-emerald-900 transition-all duration-200"
            >
              <CheckCircle className="w-4 h-4" />
              Completar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCard;
