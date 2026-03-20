import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Preset, AppSettings } from '@/types';
import { DEFAULT_PRESETS, DEFAULT_SETTINGS } from '@/constants';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  TRANSACTIONS: '@transactions',
  PRESETS: '@presets',
  SETTINGS: '@settings',
  DEVICE_ID: '@device_id',
};

/**
 * Storage Service for persisting app data
 */
class StorageService {
  /**
   * Get or create device ID
   */
  async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = uuidv4();
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return uuidv4();
    }
  }

  /**
   * Transactions
   */
  async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(transactions)
      );
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'receivedAt' | 'status'>): Promise<Transaction> {
    const transactions = await this.getTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
      receivedAt: new Date().toISOString(),
      status: 'pending',
    };

    // Add to beginning of array (most recent first)
    transactions.unshift(newTransaction);
    await this.saveTransactions(transactions);
    return newTransaction;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex((t) => t.id === id);

    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      await this.saveTransactions(transactions);
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    await this.saveTransactions(filtered);
  }

  async clearTransactions(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  }

  /**
   * Presets
   */
  async getPresets(): Promise<Preset[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRESETS);
      if (data) {
        return JSON.parse(data);
      }
      // Return and save defaults
      await this.savePresets(DEFAULT_PRESETS);
      return DEFAULT_PRESETS;
    } catch (error) {
      console.error('Error getting presets:', error);
      return DEFAULT_PRESETS;
    }
  }

  async savePresets(presets: Preset[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presets));
    } catch (error) {
      console.error('Error saving presets:', error);
    }
  }

  async updatePreset(id: string, updates: Partial<Preset>): Promise<void> {
    const presets = await this.getPresets();
    const index = presets.findIndex((p) => p.id === id);

    if (index !== -1) {
      presets[index] = { ...presets[index], ...updates };
      await this.savePresets(presets);
    }
  }

  async resetPresets(): Promise<void> {
    await this.savePresets(DEFAULT_PRESETS);
  }

  /**
   * Settings
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const deviceId = await this.getDeviceId();

      if (data) {
        const settings = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...settings, deviceId };
      }

      return { ...DEFAULT_SETTINGS, deviceId };
    } catch (error) {
      console.error('Error getting settings:', error);
      const deviceId = await this.getDeviceId();
      return { ...DEFAULT_SETTINGS, deviceId };
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      // Don't save deviceId to settings, it's stored separately
      delete (updated as any).deviceId;
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRANSACTIONS,
      STORAGE_KEYS.PRESETS,
      STORAGE_KEYS.SETTINGS,
      // Keep device ID
    ]);
  }
}

export const storageService = new StorageService();
