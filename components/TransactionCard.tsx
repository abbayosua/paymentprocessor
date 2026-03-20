import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Transaction } from '@/types';
import { formatAmount, formatTimestamp } from '@/utils/amountParser';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const statusColor = {
    pending: '#f59e0b',
    sent: '#10b981',
    failed: '#ef4444',
  };

  const statusText = {
    pending: 'Pending',
    sent: 'Sent',
    failed: 'Failed',
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.appBadge, { backgroundColor: '#1a1a2e' }]}>
          <Text style={styles.appText}>{transaction.sourceApp}</Text>
        </View>
        <Text style={styles.time}>{formatTimestamp(transaction.receivedAt)}</Text>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amount}>{formatAmount(transaction.amount)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor[transaction.status] }]}>
          <Text style={styles.statusText}>{statusText[transaction.status]}</Text>
        </View>
      </View>

      <Text style={styles.preview} numberOfLines={2}>
        {transaction.notificationText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  appText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    color: '#6b7280',
    fontSize: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  preview: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
  },
});
