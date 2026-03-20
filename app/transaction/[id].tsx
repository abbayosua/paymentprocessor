import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Transaction } from '@/types';
import { storageService } from '@/services/storageService';
import { formatAmount, formatTimestamp } from '@/utils/amountParser';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    if (!id) return;
    const transactions = await storageService.getTransactions();
    const found = transactions.find((t) => t.id === id);
    setTransaction(found || null);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await storageService.deleteTransaction(id);
            router.back();
          },
        },
      ]
    );
  };

  const handleResend = async () => {
    if (!transaction) return;
    Alert.alert(
      'Resend Transaction',
      'Send this transaction to the API again?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            // In real app, this would call the API service
            await storageService.updateTransaction(id, { status: 'pending' });
            await loadTransaction();
            Alert.alert('Success', 'Transaction marked for resend');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Transaction not found</Text>
      </View>
    );
  }

  const statusColor = {
    pending: '#f59e0b',
    sent: '#10b981',
    failed: '#ef4444',
  };

  const statusBgColor = {
    pending: '#fef3c7',
    sent: '#d1fae5',
    failed: '#fee2e2',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Amount Card */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amountValue}>{formatAmount(transaction.amount)}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusBgColor[transaction.status] },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColor[transaction.status] },
            ]}
          />
          <Text
            style={[styles.statusText, { color: statusColor[transaction.status] }]}
          >
            {transaction.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.card}>
          <DetailRow label="Source App" value={transaction.sourceApp} />
          <DetailRow label="Package" value={transaction.sourcePackage} />
          <DetailRow label="Currency" value={transaction.currency} />
          <DetailRow
            label="Received At"
            value={formatTimestamp(transaction.receivedAt)}
          />
          <DetailRow label="Transaction ID" value={transaction.id} />
        </View>
      </View>

      {/* Notification Text */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Text</Text>
        <View style={styles.card}>
          <Text style={styles.notificationText}>
            {transaction.notificationText}
          </Text>
        </View>
      </View>

      {/* API Response */}
      {transaction.apiResponse && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Response</Text>
          <View style={styles.card}>
            <DetailRow
              label="Success"
              value={transaction.apiResponse.success ? 'Yes' : 'No'}
            />
            {transaction.apiResponse.message && (
              <DetailRow label="Message" value={transaction.apiResponse.message} />
            )}
            {transaction.apiResponse.transactionId && (
              <DetailRow
                label="Transaction ID"
                value={transaction.apiResponse.transactionId}
              />
            )}
            {transaction.apiResponse.timestamp && (
              <DetailRow
                label="Timestamp"
                value={formatTimestamp(transaction.apiResponse.timestamp)}
              />
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
          <Text style={styles.resendButtonText}>Resend to API</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  amountCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  notificationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  resendButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
