import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TransactionCard } from '@/components';
import { useTransactions } from '@/hooks/useTransactions';
import { useState } from 'react';

export default function HistoryScreen() {
  const router = useRouter();
  const { transactions, loading, refresh, clearAllTransactions } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Transactions',
      'Are you sure you want to delete all transaction history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllTransactions,
        },
      ]
    );
  };

  // Calculate statistics
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const sentCount = transactions.filter((t) => t.status === 'sent').length;
  const failedCount = transactions.filter((t) => t.status === 'failed').length;

  return (
    <View style={styles.container}>
      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{transactions.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.statValue, { color: '#d97706' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{sentCount}</Text>
          <Text style={styles.statLabel}>Sent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>{failedCount}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>

      {/* Total Amount */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Amount Caught</Text>
        <Text style={styles.totalValue}>
          Rp {totalAmount.toLocaleString('id-ID')}
        </Text>
      </View>

      {/* Transaction List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>All Transactions</Text>
          {transactions.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Transactions will appear here when notifications are caught
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TransactionCard
                transaction={item}
                onPress={() => router.push(`/transaction/${item.id}`)}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  totalCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  clearAll: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});
