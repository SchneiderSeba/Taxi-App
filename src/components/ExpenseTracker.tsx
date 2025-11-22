import { Plus, Fuel, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Expense } from '../types';

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  gasUnitCost: number;
}

export default function ExpenseTracker({ expenses, onAddExpense, gasUnitCost }: ExpenseTrackerProps) {
  const [showAddGas, setShowAddGas] = useState(false);

  const handleAddGas = () => {
    onAddExpense({
      type: 'gas',
      amount: gasUnitCost
    });
    setShowAddGas(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(exp => exp.date === today && exp.type === 'gas');
  const totalGasToday = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Gastos de Combustible</h2>
        <button
          onClick={() => setShowAddGas(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Registrar Carga
        </button>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-5 border border-orange-200 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <Fuel className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Gasto en Gas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">${totalGasToday.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Cargas realizadas</p>
            <p className="text-3xl font-bold text-orange-600">{todayExpenses.length}</p>
          </div>
        </div>
      </div>

      {todayExpenses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700">Cargas de Hoy</h3>
          {todayExpenses.map(expense => (
            <div key={expense.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Fuel className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Carga de combustible</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {showAddGas && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Registrar Carga de Gas</h3>
              <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">Costo por carga configurado:</p>
                <p className="text-3xl font-bold text-emerald-600">${gasUnitCost.toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddGas(false)}
                  className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddGas}
                  className="flex-1 px-5 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
