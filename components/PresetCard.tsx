import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Preset } from '@/types';

interface PresetCardProps {
  preset: Preset;
  onToggle: () => void;
  onPress?: () => void;
}

export function PresetCard({ preset, onToggle, onPress }: PresetCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, !preset.enabled && styles.disabled]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: preset.color }]}>
        <Text style={styles.iconText}>
          {preset.icon === 'wallet' ? '💳' : '🏦'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{preset.displayName}</Text>
        <Text style={styles.packageName}>{preset.packageName}</Text>
        <Text style={styles.patternCount}>
          {preset.patterns.length} pattern{preset.patterns.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <Switch
        value={preset.enabled}
        onValueChange={onToggle}
        trackColor={{ false: '#e5e7eb', true: preset.color }}
        thumbColor={preset.enabled ? '#ffffff' : '#f4f3f4'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  packageName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  patternCount: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
