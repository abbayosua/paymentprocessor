import { useState, useEffect, useCallback } from 'react';
import { Preset } from '@/types';
import { storageService } from '@/services/storageService';

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPresets = useCallback(async () => {
    setLoading(true);
    const data = await storageService.getPresets();
    setPresets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const updatePreset = async (id: string, updates: Partial<Preset>) => {
    await storageService.updatePreset(id, updates);
    setPresets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const togglePreset = async (id: string) => {
    const preset = presets.find((p) => p.id === id);
    if (preset) {
      await updatePreset(id, { enabled: !preset.enabled });
    }
  };

  const resetPresets = async () => {
    await storageService.resetPresets();
    await loadPresets();
  };

  return {
    presets,
    loading,
    refresh: loadPresets,
    updatePreset,
    togglePreset,
    resetPresets,
  };
}
