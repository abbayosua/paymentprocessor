import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PresetCard } from '@/components';
import { usePresets } from '@/hooks/usePresets';
import { Preset } from '@/types';

export default function PresetsScreen() {
  const router = useRouter();
  const { presets, loading, togglePreset, resetPresets } = usePresets();

  const handleReset = () => {
    Alert.alert(
      'Reset Presets',
      'This will reset all presets to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetPresets,
        },
      ]
    );
  };

  const renderPreset = ({ item }: { item: Preset }) => (
    <PresetCard
      preset={item}
      onToggle={() => togglePreset(item.id)}
      onPress={() => router.push(`/preset/${item.id}`)}
    />
  );

  // Group presets by type
  const walletPresets = presets.filter((p) => p.icon === 'wallet');
  const bankPresets = presets.filter((p) => p.icon === 'bank');

  return (
    <View style={styles.container}>
      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>📱 Notification Presets</Text>
        <Text style={styles.infoText}>
          Enable presets for apps you want to catch notifications from.
          Each preset contains patterns to extract transaction amounts.
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {presets.filter((p) => p.enabled).length} of {presets.length} enabled
        </Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset to Default</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={presets}
        keyExtractor={(item) => item.id}
        renderItem={renderPreset}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {walletPresets.length > 0 && (
              <Text style={styles.sectionTitle}>💳 E-Wallets</Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              Tap on a preset to view or edit its patterns.
            </Text>
            <Text style={styles.footerNote}>
              Changes are saved automatically.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  infoCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resetText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    marginTop: 8,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
});
