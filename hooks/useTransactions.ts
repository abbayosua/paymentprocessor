import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import { storageService } from '@/services/storageService';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const data = await storageService.getTransactions();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const deleteTransaction = async (id: string) => {
    await storageService.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTransactions = async () => {
    await storageService.clearTransactions();
    setTransactions([]);
  };

  return {
    transactions,
    loading,
    refresh: loadTransactions,
    deleteTransaction,
    clearAllTransactions,
  };
}
