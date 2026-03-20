import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  text?: string;
}

export function StatusIndicator({ status, text }: StatusIndicatorProps) {
  const config = {
    connected: { color: '#10b981', label: 'Connected' },
    disconnected: { color: '#6b7280', label: 'Disconnected' },
    error: { color: '#ef4444', label: 'Error' },
    pending: { color: '#f59e0b', label: 'Pending' },
  };

  const { color, label } = config[status];

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>
        {text || label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
