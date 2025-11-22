import { Plus, MapPin, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Trip } from '../types';
import TripCard from './TripCard';
import AddTripModal from './AddTripModal';
import { useState } from 'react';

interface TripsViewProps {
  trips: Trip[];
  onAddTrip: (trip: Omit<Trip, 'id' | 'date'>) => void;
  onUpdateTripStatus: (id: string, status: Trip['status']) => void;
  dailyExpenses: number;
}

export default function TripsView({ trips, onAddTrip, onUpdateTripStatus, dailyExpenses }: TripsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayTrips = trips.filter(trip => trip.date === today);

  const completedTrips = todayTrips.filter(trip => trip.status === 'completed');
  const pendingTrips = todayTrips.filter(trip => trip.status === 'pending');
  const cancelledTrips = todayTrips.filter(trip => trip.status === 'cancelled');

  const totalIncome = completedTrips.reduce((sum, trip) => sum + trip.price, 0);
  const netEarnings = totalIncome - dailyExpenses;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Viajes</h1>
          <p className="text-gray-600 mt-1">Gestiona tus viajes del día</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Agregar Viaje
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Pendientes</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingTrips.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Completados</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{completedTrips.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Ingresos</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">${totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-emerald-50">Ganancia Neta</span>
          </div>
          <p className="text-3xl font-bold text-white">${netEarnings.toFixed(2)}</p>
          <p className="text-sm text-emerald-50 mt-1">Después de gastos</p>
        </div>
      </div>

      <div className="space-y-4">
        {pendingTrips.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
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
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay viajes registrados hoy</h3>
            <p className="text-gray-600 mb-6">Comienza agregando tu primer viaje del día</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Agregar Viaje
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
