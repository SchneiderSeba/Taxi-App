import { Calendar, TrendingUp, DollarSign, Fuel, Shield, FileText } from 'lucide-react';
import { useState } from 'react';
import { Trip, Expense, UserSettings } from '../types';

interface EarningsReportProps {
  trips: Trip[];
  expenses: Expense[];
  settings: UserSettings;
}

export default function EarningsReport({ trips, expenses, settings }: EarningsReportProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  const calculateDailyEarnings = (date: string) => {
    const dayTrips = trips.filter(trip => trip.date === date && trip.status === 'completed');
    const dayExpenses = expenses.filter(exp => exp.date === date);

    const income = dayTrips.reduce((sum, trip) => sum + trip.price, 0);
    const gasExpenses = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return { income, expenses: gasExpenses, net: income - gasExpenses };
  };

  const calculateMonthlyEarnings = (year: number, month: number) => {
    const monthTrips = trips.filter(trip => {
      const tripDate = new Date(trip.date);
      return tripDate.getFullYear() === year &&
             tripDate.getMonth() === month &&
             trip.status === 'completed';
    });

    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === year && expDate.getMonth() === month;
    });

    const income = monthTrips.reduce((sum, trip) => sum + trip.price, 0);
    const gasExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const fixedCosts = settings.insuranceMonthly + settings.registrationMonthly;
    const totalExpenses = gasExpenses + fixedCosts;

    return {
      income,
      gasExpenses,
      fixedCosts,
      totalExpenses,
      net: income - totalExpenses,
      tripsCount: monthTrips.length
    };
  };

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return { year: date.getFullYear(), month: date.getMonth() };
  }).reverse();

  const todayEarnings = calculateDailyEarnings(today);
  const currentMonthEarnings = calculateMonthlyEarnings(currentYear, currentMonth);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setViewMode('daily')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            viewMode === 'daily'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vista Diaria
        </button>
        <button
          onClick={() => setViewMode('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            viewMode === 'monthly'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vista Mensual
        </button>
      </div>

      {viewMode === 'daily' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 shadow-md text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-emerald-50">Ingresos Hoy</span>
              </div>
              <p className="text-3xl font-bold">${todayEarnings.income.toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Gastos Hoy</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${todayEarnings.expenses.toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Ganancia Neta</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">${todayEarnings.net.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Últimos 7 Días
            </h3>
            <div className="space-y-3">
              {last7Days.map(date => {
                const earnings = calculateDailyEarnings(date);
                const dateObj = new Date(date);
                const isToday = date === today;

                return (
                  <div
                    key={date}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      isToday ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${isToday ? 'text-emerald-700' : 'text-gray-900'}`}>
                        {dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                        {isToday && ' (Hoy)'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ingresos: ${earnings.income.toFixed(2)} | Gastos: ${earnings.expenses.toFixed(2)}
                      </p>
                    </div>
                    <p className={`text-xl font-bold ${earnings.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${earnings.net.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'monthly' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 shadow-md text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-emerald-50">Ingresos</span>
              </div>
              <p className="text-3xl font-bold">${currentMonthEarnings.income.toFixed(2)}</p>
              <p className="text-sm text-emerald-50 mt-1">{currentMonthEarnings.tripsCount} viajes</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Gas</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${currentMonthEarnings.gasExpenses.toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Costos Fijos</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${currentMonthEarnings.fixedCosts.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Seguro + Patente</p>
            </div>

            <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Ganancia</span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">${currentMonthEarnings.net.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Gastos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Fuel className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Combustible</span>
                </div>
                <span className="text-xl font-bold text-gray-900">${currentMonthEarnings.gasExpenses.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Seguro</span>
                </div>
                <span className="text-xl font-bold text-gray-900">${settings.insuranceMonthly.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Patente</span>
                </div>
                <span className="text-xl font-bold text-gray-900">${settings.registrationMonthly.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-2 border-gray-300 mt-4">
                <span className="font-bold text-gray-900 text-lg">Total Gastos</span>
                <span className="text-2xl font-bold text-gray-900">${currentMonthEarnings.totalExpenses.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Últimos 6 Meses
            </h3>
            <div className="space-y-3">
              {last6Months.map(({ year, month }) => {
                const earnings = calculateMonthlyEarnings(year, month);
                const dateObj = new Date(year, month);
                const isCurrentMonth = year === currentYear && month === currentMonth;

                return (
                  <div
                    key={`${year}-${month}`}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      isCurrentMonth ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${isCurrentMonth ? 'text-emerald-700' : 'text-gray-900'}`}>
                        {dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        {isCurrentMonth && ' (Mes Actual)'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {earnings.tripsCount} viajes | Gastos: ${earnings.totalExpenses.toFixed(2)}
                      </p>
                    </div>
                    <p className={`text-xl font-bold ${earnings.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${earnings.net.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
