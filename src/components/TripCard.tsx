import { MapPin, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onUpdateStatus: (id: string, status: Trip['status']) => void;
}

export default function TripCard({ trip, onUpdateStatus }: TripCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'Pendiente'
    },
    completed: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Completado'
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Cancelado'
    }
  };

  const config = statusConfig[trip.status];
  const StatusIcon = config.icon;

  return (
    <div className={`bg-white rounded-xl border-2 ${config.border} p-5 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{trip.name}</h3>
              <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{trip.address}</span>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
            <DollarSign className="w-5 h-5" />
            <span className="text-lg">${trip.price.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {trip.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(trip.id, 'completed')}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all duration-200"
              >
                <CheckCircle className="w-4 h-4" />
                Completar
              </button>
              <button
                onClick={() => onUpdateStatus(trip.id, 'cancelled')}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-all duration-200"
              >
                <XCircle className="w-4 h-4" />
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
