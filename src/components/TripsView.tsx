import { Plus, MapPin, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Trip } from '../types';
import TripCard from './TripCard';
import AddTripModal from './AddTripModal';
import { useState } from 'react';

interface TripsViewProps {
  trips: Trip[];
  onAddTrip: (trip: Omit<Trip, 'id' | 'owner_id' | 'created_at'>) => void;
  onUpdateTripStatus: (id: number, status: Trip['done']) => void;
  dailyExpenses: number;
}

export default function TripsView({ trips, onAddTrip, onUpdateTripStatus, dailyExpenses }: TripsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayTrips = trips.filter(trip => (trip.created_at || trip.date)?.startsWith(today));

  const completedTrips = todayTrips.filter(trip => trip.done === 'completed');
  const pendingTrips = todayTrips.filter(trip => trip.done === 'pending');
  const cancelledTrips = todayTrips.filter(trip => trip.done === 'cancelled');

  const totalIncome = completedTrips.reduce((sum, trip) => sum + (trip.price || 0), 0);
  const netEarnings = totalIncome - dailyExpenses;

  return (
    <div className="dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Mis Viajes</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">Gestiona tus viajes del día</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg dark:bg-emerald-800 dark:hover:bg-emerald-900 w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="w-5 h-5 shrink-0" />
          <span className="text-sm sm:text-base">Agregar Viaje</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-200">Pendientes</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{pendingTrips.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-300" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-200">Completados</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{completedTrips.length}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-300" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-200">Ingresos</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-300">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-4 sm:p-6 shadow-md sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-emerald-50">Ganancia Neta</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">${netEarnings.toFixed(2)}</p>
          <p className="text-xs sm:text-sm text-emerald-50 mt-1">Después de gastos</p>
        </div>
      </div>

      <div className="space-y-4">
        {pendingTrips.length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-300 shrink-0" />
              Viajes Pendientes
            </h2>
            <div className="space-y-3">
              {pendingTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} onUpdateStatus={onUpdateTripStatus} />
              ))}
            </div>
          </div>
        )}

        {completedTrips.length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-300 shrink-0" />
              Viajes Completados
            </h2>
            <div className="space-y-3">
              {completedTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} onUpdateStatus={onUpdateTripStatus} />
              ))}
            </div>
          </div>
        )}

        {cancelledTrips.length > 0 && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-300 shrink-0" />
              Viajes Cancelados
            </h2>
            <div className="space-y-3">
              {cancelledTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} onUpdateStatus={onUpdateTripStatus} />
              ))}
            </div>
          </div>
        )}

        {todayTrips.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay viajes registrados hoy</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">Comienza agregando tu primer viaje del día</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 sm:px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 dark:bg-emerald-800 dark:hover:bg-emerald-900 transition-all duration-200 min-h-[44px] w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 shrink-0" />
              <span className="text-sm sm:text-base">Agregar Viaje</span>
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddTripModal
          onClose={() => setShowAddModal(false)}
          onAdd={onAddTrip}
        />
      )}
    </div>
  );
}
