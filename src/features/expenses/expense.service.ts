import { clientSupaBase } from '../../supabase/client';
import type { TablesInsert } from '../../supabase/database.types';
import { parseExpenseRow } from '../../shared/lib/domainParsers';
import type { Expense } from '../../types';

export async function listExpenses(ownerId: string): Promise<Expense[]> {
  const { data, error } = await clientSupaBase
    .from('Expenses')
    .select('*')
    .eq('owner_id', ownerId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(parseExpenseRow);
}

export async function createExpense(
  ownerId: string,
  expense: Omit<Expense, 'id' | 'date' | 'owner_id'>,
): Promise<Expense> {
  const payload: TablesInsert<'Expenses'> = {
    owner_id: ownerId,
    type: expense.type,
    amount: expense.amount,
    date: new Date().toISOString().split('T')[0],
  };
  const { data, error } = await clientSupaBase.from('Expenses').insert(payload).select().single();
  if (error) throw error;
  return parseExpenseRow(data);
}
