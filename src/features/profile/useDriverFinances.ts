import { useCallback, useEffect, useState } from 'react';
import { serviceErrorMessage } from '../../lib/serviceError';
import type { Expense, UserSettings } from '../../types';
import { createExpense, listExpenses } from '../expenses/expense.service';
import { useAuth } from '../auth/useAuth';
import { DEFAULT_SETTINGS, getDriverSettings, loadCachedSettings, saveDriverSettings } from '../settings/settings.service';

export function useDriverFinances() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<UserSettings>(() => loadCachedSettings());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setSettings(loadCachedSettings());
      return;
    }

    let active = true;
    setLoading(true);
    Promise.all([listExpenses(user.id), getDriverSettings(user.id)])
      .then(([nextExpenses, storedSettings]) => {
        if (!active) return;
        setExpenses(nextExpenses);
        setSettings(storedSettings ?? loadCachedSettings() ?? DEFAULT_SETTINGS);
        setError(null);
      })
      .catch((requestError: unknown) => {
        if (active) setError(serviceErrorMessage(requestError instanceof Error ? requestError : null));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'date' | 'owner_id'>) => {
    if (!user) throw new Error('La sesión ya no está disponible.');
    const created = await createExpense(user.id, expense);
    setExpenses((current) => [created, ...current]);
  }, [user]);

  const updateSettings = useCallback(async (nextSettings: UserSettings) => {
    if (!user) throw new Error('La sesión ya no está disponible.');
    await saveDriverSettings(user.id, nextSettings);
    setSettings(nextSettings);
  }, [user]);

  return { expenses, settings, loading, error, addExpense, updateSettings };
}
