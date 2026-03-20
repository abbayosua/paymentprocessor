import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Preset, RegexPattern } from '@/types';
import { storageService } from '@/services/storageService';

export default function PresetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [preset, setPreset] = useState<Preset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreset();
  }, [id]);

  const loadPreset = async () => {
    if (!id) return;
    const presets = await storageService.getPresets();
    const found = presets.find((p) => p.id === id);
    setPreset(found || null);
    setLoading(false);
  };

  const toggleEnabled = async () => {
    if (!preset) return;
    const updated = { ...preset, enabled: !preset.enabled };
    await storageService.updatePreset(id, { enabled: !preset.enabled });
    setPreset(updated);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!preset) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Preset not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={[styles.headerCard, { backgroundColor: preset.color }]}>
        <Text style={styles.presetIcon}>{preset.icon === 'wallet' ? '💳' : '🏦'}</Text>
        <Text style={styles.presetName}>{preset.displayName}</Text>
        <Text style={styles.presetPackage}>{preset.packageName}</Text>
      </View>

      {/* Enable Toggle */}
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.enableRow}>
            <View>
              <Text style={styles.enableLabel}>Enable Preset</Text>
              <Text style={styles.enableHint}>
                Listen for notifications from this app
              </Text>
            </View>
            <Switch
              value={preset.enabled}
              onValueChange={toggleEnabled}
              trackColor={{ false: '#e5e7eb', true: preset.color }}
              thumbColor={preset.enabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Patterns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Regex Patterns</Text>
        <Text style={styles.sectionHint}>
          Patterns used to extract amounts from notifications
        </Text>

        {preset.patterns.map((pattern, index) => (
          <View key={pattern.id} style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <Text style={styles.patternName}>{pattern.name}</Text>
              <Text style={styles.patternIndex}>#{index + 1}</Text>
            </View>
            <Text style={styles.patternDescription}>{pattern.description}</Text>
            <View style={styles.regexContainer}>
              <Text style={styles.regexLabel}>Pattern:</Text>
              <Text style={styles.regexValue} selectable>
                {pattern.pattern}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          💡 Patterns are tested in order. The first matching pattern will be used
          to extract the amount from the notification text.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  headerCard: {
    padding: 32,
    alignItems: 'center',
  },
  presetIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  presetName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  presetPackage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enableLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  enableHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  patternCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  patternIndex: {
    fontSize: 12,
    color: '#9ca3af',
  },
  patternDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  regexContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 12,
  },
  regexLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  regexValue: {
    fontSize: 12,
    color: '#10b981',
    fontFamily: 'monospace',
  },
  infoSection: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
});
