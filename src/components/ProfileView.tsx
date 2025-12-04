import { Settings, TrendingUp, Fuel, FileText, Shield, User2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ExpenseTracker from './ExpenseTracker';
import EarningsReport from './EarningsReport';
import ProfileCard from './ProfileCard';
import { clientSupaBase } from '../supabase/client';
import { Expense, Profile, Trip, UserSettings, ProfileEditableField } from '../types';

type ActiveTab = 'settings' | 'earnings' | 'profile';
type EditableProfileField = ProfileEditableField;

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

  const fieldMeta: Record<EditableProfileField, { title: string; placeholder: string; helper?: string }> = {
    carModel: {
      title: 'modelo del auto',
      placeholder: 'Ej: Toyota Corolla',
    },
    carPlate: {
      title: 'patente',
      placeholder: 'Ej: ABC123',
    },
    pictureUrl: {
      title: 'foto de perfil',
      placeholder: 'Pega la URL de tu imagen',
      helper: 'Puedes dejar vacío para volver al avatar por defecto.',
    },
    available: {
      title: 'disponibilidad',
      placeholder: 'Escribe Sí o No',
      helper: 'Indica si estás disponible para recibir viajes (Sí o No).',
    },
  };

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
    
    // Para el campo 'available', convertir booleano a string "Sí"/"No"
    if (field === 'available') {
      setModalValue(userProfile[field] ? 'Sí' : 'No');
    } else {
      setModalValue(userProfile[field] ?? '');
    }
    
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

    let updatedValue: string | boolean | null;
    
    // Manejar campo booleano 'available'
    if (modalField === 'available') {
      const normalized = modalValue.trim().toLowerCase();
      updatedValue = normalized === 'sí' || normalized === 'si' || normalized === 'yes' || normalized === 'true';
    } else {
      updatedValue = modalValue.trim() || null;
    }

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

  const modalConfig = modalField ? fieldMeta[modalField] : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">{userEmail ?? 'Mi Perfil'}</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">Gestiona tu configuración y visualiza tus ganancias</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm sm:text-base min-h-[48px] ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-white/60 hover:text-gray-600'
            }`}
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="hidden xs:inline sm:inline">Configuración</span>
            <span className="xs:hidden">Config</span>
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm sm:text-base min-h-[48px] ${
              activeTab === 'earnings'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-white/60 hover:text-gray-600'
            }`}
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Ganancias
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap text-sm sm:text-base min-h-[48px] ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-white/60 hover:text-gray-600'
            }`}
          >
            <User2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            Perfil
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Costos Fijos Mensuales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 sm:p-5 border border-blue-200">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <label htmlFor="insurance" className="font-semibold text-gray-900 text-sm sm:text-base">
                        Seguro (mensual)
                      </label>
                    </div>
                    {editMode ? (
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">$</span>
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
                          className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 outline-none bg-white text-sm sm:text-base min-h-[44px]"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ) : (
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">${settings.insuranceMonthly.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 sm:p-5 border border-purple-200">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <label htmlFor="registration" className="font-semibold text-gray-900 text-sm sm:text-base">
                        Patente (mensual)
                      </label>
                    </div>
                    {editMode ? (
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">$</span>
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
                          className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 outline-none bg-white text-sm sm:text-base min-h-[44px]"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ) : (
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">${settings.registrationMonthly.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Costo por Unidad</h2>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 sm:p-5 border border-emerald-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                      <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <label htmlFor="gas" className="font-semibold text-gray-900 text-sm sm:text-base">
                      Gas (por carga)
                    </label>
                  </div>
                  {editMode ? (
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">$</span>
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
                        className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 outline-none bg-white text-sm sm:text-base min-h-[44px]"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  ) : (
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">${settings.gasUnitCost.toFixed(2)}</p>
                  )}
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">Costo de cada carga de combustible</p>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-4">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCancelSettings}
                      className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base min-h-[44px]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
                    >
                      Guardar Cambios
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm sm:text-base min-h-[44px]"
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

      {isModalOpen && modalField && modalConfig && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Editar {modalConfig.title}
            </h3>
            
            {modalField === 'available' ? (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setModalValue('Sí')}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 font-medium transition-all text-sm sm:text-base min-h-[44px] ${
                      modalValue === 'Sí'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-400'
                    }`}
                  >
                    ✓ Disponible
                  </button>
                  <button
                    onClick={() => setModalValue('No')}
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 font-medium transition-all text-sm sm:text-base min-h-[44px] ${
                      modalValue === 'No'
                        ? 'border-red-600 bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400'
                    }`}
                  >
                    × No disponible
                  </button>
                </div>
                {modalConfig.helper && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{modalConfig.helper}</p>
                )}
              </div>
            ) : (
              <>
                <input
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base min-h-[44px]"
                  placeholder={modalConfig.placeholder}
                />
                {modalField === 'pictureUrl' && modalValue.trim() && (
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Vista previa:</p>
                    <img
                      src={modalValue}
                      alt="Vista previa de perfil"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border border-gray-200 dark:border-gray-700"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {modalConfig.helper && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">{modalConfig.helper}</p>
                )}
              </>
            )}
            
            <div className="flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleModalClose}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm sm:text-base min-h-[44px]"
                disabled={isSavingField}
              >
                Cancelar
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 text-sm sm:text-base min-h-[44px]"
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