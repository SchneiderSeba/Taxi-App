import { useState } from 'react';
import { History, DollarSign, Calendar, MapPin, User, Clock } from 'lucide-react';
import { Trip } from '../types';

interface Payment {
  id: number;
  trip_id: number;
  amount: number;
  date: string;
  customer_name: string;
  status: 'completed' | 'pending' | 'refunded';
}

interface ProfileFunctions {
  tripHistory: {
    title: string;
    icon: typeof History;
    data: Trip[];
  };
//   paymentHistory?: {
//     title: string;
//     icon: typeof DollarSign;
//     data: Payment[];
//   };
}

type SectionKey = 'tripHistory' | 'paymentHistory';

interface ProfileDashboardProps {
  trips: Trip[];
//   payments: Payment[];
}

export default function ProfileDashboard({ trips }: ProfileDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>('tripHistory');

  const ProfileFunctions: ProfileFunctions = {
    tripHistory: {
      title: 'Historial de Viajes',
      icon: History,
      data: trips
    }
    // paymentHistory: {
    //   title: 'Historial de Pagos',
    //   icon: DollarSign,
    //   data: payments
    // }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/D';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Trip['done'] | Payment['status']) => {
    const statusConfig = {
      completed: { label: 'Completado', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
      pending: { label: 'Pendiente', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
      refunded: { label: 'Reembolsado', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Navegación de secciones */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {(Object.keys(ProfileFunctions) as SectionKey[]).map((key) => {
            const section = ProfileFunctions[key];
            const Icon = section.icon;
            const isActive = activeSection === key;

            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm sm:text-base min-h-[48px] flex-1 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{key === 'tripHistory' ? 'Viajes' : 'Pagos'}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de la sección activa */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {activeSection === 'tripHistory' && (
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              Historial de Viajes
            </h2>

            {trips.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No hay viajes registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th scope="col" className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Origen → Destino
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Precio
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {trips.map((trip) => (
                        <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{trip.id}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                                {trip.name}
                              </span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-6 py-4">
                            <div className="flex items-start gap-2 text-sm text-gray-900 dark:text-white">
                              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                              <div className="flex flex-col">
                                <span className="font-medium">{trip.pickup || 'N/D'}</span>
                                <span className="text-gray-500 dark:text-gray-400">↓</span>
                                <span>{trip.destination || 'N/D'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                              <div className="flex flex-col text-xs sm:text-sm text-gray-900 dark:text-white">
                                <span>{formatDate(trip.created_at || trip.date)}</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                  {formatTime(trip.created_at)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            ${trip.price?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(trip.done)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* {activeSection === 'paymentHistory' && (
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              Historial de Pagos
            </h2>

            {payments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Viaje
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Monto
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{payment.id}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            Viaje #{payment.trip_id}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                                {payment.customer_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                                {formatDate(payment.date)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400">
                            ${payment.amount.toFixed(2)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )} */}
      </div>

      {/* Resumen de totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Viajes</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{trips.length}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Recaudado</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            ${trips.filter(t => t.done === 'completed').reduce((sum, t) => sum + (t.price || 0), 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
