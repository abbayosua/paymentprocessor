import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types';
import { storageService } from '@/services/storageService';
import { apiService } from '@/services/apiService';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const data = await storageService.getSettings();
    setSettings(data);
    // Configure API service
    if (data.apiUrl) {
      apiService.configure(data.apiUrl, data.apiKey);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    await storageService.saveSettings(updates);
    setSettings((prev) => (prev ? { ...prev, ...updates } : null));

    // Update API service configuration
    if (updates.apiUrl || updates.apiKey) {
      const newUrl = updates.apiUrl || settings?.apiUrl || '';
      const newKey = updates.apiKey || settings?.apiKey || '';
      if (newUrl) {
        apiService.configure(newUrl, newKey);
      }
    }
  };

  const testConnection = async () => {
    if (!settings?.apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }
    return apiService.testConnection();
  };

  return {
    settings,
    loading,
    refresh: loadSettings,
    updateSettings,
    testConnection,
  };
}
