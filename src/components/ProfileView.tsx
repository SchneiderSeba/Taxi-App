import { Settings, TrendingUp, Fuel, FileText, Shield, User2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ExpenseTracker from './ExpenseTracker';
import EarningsReport from './EarningsReport';
import ProfileCard from './ProfileCard';
import { clientSupaBase } from '../supabase/client';
import { Expense, Profile, Trip, UserSettings } from '../types';

type ActiveTab = 'settings' | 'earnings' | 'profile';
type EditableProfileField = 'carModel' | 'carPlate';

interface ProfileViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'date' | 'owner_id'>) => void;
  trips: Trip[];
}

export default function ProfileView({ settings, onUpdateSettings, expenses, onAddExpense, trips }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('settings');
  const [editMode, setEditMode] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalField, setModalField] = useState<EditableProfileField | null>(null);
  const [modalValue, setModalValue] = useState('');
  const [isSavingField, setIsSavingField] = useState(false);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    async function fetchSession() {
      const { data } = await clientSupaBase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
      setUserId(data.user?.id ?? null);
    }
    fetchSession();
  }, []);

  useEffect(() => {
    async function fetchUserProfile(ownerId: string) {
      const { data, error } = await clientSupaBase
        .from('UsersProfile')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    }

    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  const handleSaveSettings = () => {
    onUpdateSettings(tempSettings);
    setEditMode(false);
  };

  const handleCancelSettings = () => {
    setTempSettings(settings);
    setEditMode(false);
  };

  const openEditModal = (field: EditableProfileField) => {
    if (!userProfile) return;
    setModalField(field);
    setModalValue(userProfile[field] ?? '');
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    if (isSavingField) return;
    setIsModalOpen(false);
    setModalField(null);
    setModalValue('');
  };

  const handleModalSubmit = async () => {
    if (!userId || !modalField) return;
    setIsSavingField(true);

    const updatedValue = modalValue.trim() || null;

    const { data, error } = await clientSupaBase
      .from('UsersProfile')
      .update({ [modalField]: updatedValue })
      .eq('owner_id', userId)
      .select()
      .maybeSingle();

    setIsSavingField(false);

    if (error) {
      console.error('Error updating profile field:', error);
      return;
    }

    if (data) {
      setUserProfile(data as Profile);
      handleModalClose();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userEmail ?? 'Mi Perfil'}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Gestiona tu configuración y visualiza tus ganancias</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
              activeTab === 'earnings'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Ganancias
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 border-b-2 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <User2 className="w-5 h-5" />
            Perfil
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Costos Fijos Mensuales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <label htmlFor="insurance" className="font-semibold text-gray-900">
                        Seguro (mensual)
                      </label>
                    </div>
                    {editMode ? (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          id="insurance"
                          value={tempSettings.insuranceMonthly}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              insuranceMonthly: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 outline-none bg-white"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">${settings.insuranceMonthly.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <label htmlFor="registration" className="font-semibold text-gray-900">
                        Patente (mensual)
                      </label>
                    </div>
                    {editMode ? (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          id="registration"
                          value={tempSettings.registrationMonthly}
                          onChange={(e) =>
                            setTempSettings({
                              ...tempSettings,
                              registrationMonthly: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 outline-none bg-white"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">${settings.registrationMonthly.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Costo por Unidad</h2>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-white" />
                    </div>
                    <label htmlFor="gas" className="font-semibold text-gray-900">
                      Gas (por carga)
                    </label>
                  </div>
                  {editMode ? (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        id="gas"
                        value={tempSettings.gasUnitCost}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            gasUnitCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 outline-none bg-white"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">${settings.gasUnitCost.toFixed(2)}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">Costo de cada carga de combustible</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCancelSettings}
                      className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="flex-1 px-5 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Guardar Cambios
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full px-5 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Editar Configuración
                  </button>
                )}
              </div>

              <ExpenseTracker expenses={expenses} onAddExpense={onAddExpense} gasUnitCost={settings.gasUnitCost} />
            </div>
          )}

          {activeTab === 'earnings' && <EarningsReport trips={trips} expenses={expenses} settings={settings} />}

          {activeTab === 'profile' && (
            <div>
              {userProfile ? (
                <ProfileCard profile={userProfile} onEditField={openEditModal} />
              ) : (
                <p className="text-gray-500 text-sm">No encontramos información de perfil todavía.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && modalField && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Editar {modalField === 'carModel' ? 'modelo del auto' : 'patente'}
            </h3>
            <input
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={modalField === 'carModel' ? 'Ej: Toyota Corolla' : 'Ej: ABC123'}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                disabled={isSavingField}
              >
                Cancelar
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
                disabled={isSavingField}
              >
                {isSavingField ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}