import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TransactionCard, StatusIndicator } from '@/components';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettings } from '@/hooks/useSettings';
import { usePresets } from '@/hooks/usePresets';
import { notificationService } from '@/services/notificationService';
import { Transaction } from '@/types';
import { PACKAGE_TO_APP } from '@/constants';

export default function DashboardScreen() {
  const router = useRouter();
  const { transactions, loading, refresh } = useTransactions();
  const { settings } = useSettings();
  const { presets } = usePresets();
  const [refreshing, setRefreshing] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simPackage, setSimPackage] = useState('ovo.id');
  const [simText, setSimText] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSimulate = async () => {
    if (!simText.trim()) {
      Alert.alert('Error', 'Please enter notification text');
      return;
    }

    const transaction = await notificationService.simulateNotification(
      simPackage,
      simText
    );

    if (transaction) {
      Alert.alert(
        'Success',
        `Transaction caught!\nAmount: Rp ${transaction.amount.toLocaleString('id-ID')}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowSimulator(false);
              setSimText('');
              refresh();
            },
          },
        ]
      );
    } else {
      Alert.alert('Failed', 'Could not extract amount from notification');
    }
  };

  // Sample notification texts for testing
  const sampleTexts: Record<string, string[]> = {
    'ovo.id': [
      'Rp103.433 telah masuk ke akun OVO Anda',
      'Anda menerima Rp 250.000 dari John Doe',
    ],
    'id.dana': [
      'Dana Rp 103.433 diterima dari Merchant ABC',
      'Anda menerima Dana Rp 500.000',
    ],
    'com.gojek.app': [
      'Anda menerima Rp 103.433 dari GoPay user',
      'Rp 75.000 telah masuk ke GoPay Anda',
    ],
    'com.shopee.id': [
      'ShopeePay: Anda menerima Rp103.433 dari seller',
      'Rp 150.000 telah masuk ke ShopeePay Anda',
    ],
    'com.bca.mobilebanking': [
      'Anda menerima transfer Rp 103.433 dari rek 1234567890',
      'Transfer masuk Rp 999.999 dari ATM',
    ],
    'com.mandiri.livin': [
      'Transfer masuk Rp 103.433 ke rekening Anda',
      'Anda menerima Rp 250.000 via Livin',
    ],
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Service Status</Text>
          <StatusIndicator
            status={settings?.notificationsEnabled ? 'connected' : 'disconnected'}
            text={settings?.notificationsEnabled ? 'Active' : 'Inactive'}
          />
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>API Status</Text>
          <StatusIndicator
            status={settings?.apiUrl ? 'connected' : 'disconnected'}
            text={settings?.apiUrl ? 'Configured' : 'Not Set'}
          />
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Active Presets</Text>
          <Text style={styles.statusValue}>
            {presets.filter((p) => p.enabled).length} / {presets.length}
          </Text>
        </View>
      </View>

      {/* Simulator Button */}
      <TouchableOpacity
        style={styles.simulateButton}
        onPress={() => setShowSimulator(true)}
      >
        <Text style={styles.simulateButtonText}>🧪 Simulate Notification</Text>
      </TouchableOpacity>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length > 5 && (
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Transactions will appear here when notifications are caught
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {recentTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onPress={() => router.push(`/transaction/${transaction.id}`)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Simulator Modal */}
      <Modal visible={showSimulator} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Simulate Notification</Text>

            <Text style={styles.inputLabel}>Select App</Text>
            <View style={styles.appSelector}>
              {Object.keys(PACKAGE_TO_APP).map((pkg) => (
                <TouchableOpacity
                  key={pkg}
                  style={[
                    styles.appOption,
                    simPackage === pkg && styles.appOptionSelected,
                  ]}
                  onPress={() => setSimPackage(pkg)}
                >
                  <Text
                    style={[
                      styles.appOptionText,
                      simPackage === pkg && styles.appOptionTextSelected,
                    ]}
                  >
                    {PACKAGE_TO_APP[pkg]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notification Text</Text>
            <TextInput
              style={styles.textInput}
              value={simText}
              onChangeText={setSimText}
              placeholder="Enter notification text..."
              multiline
              numberOfLines={3}
            />

            {/* Sample texts */}
            <Text style={styles.inputLabel}>Quick Fill</Text>
            <ScrollView horizontal style={styles.sampleScroll}>
              {(sampleTexts[simPackage] || []).map((text, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.sampleButton}
                  onPress={() => setSimText(text)}
                >
                  <Text style={styles.sampleButtonText} numberOfLines={1}>
                    {text.substring(0, 30)}...
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowSimulator(false);
                  setSimText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleSimulate}
              >
                <Text style={styles.confirmButtonText}>Simulate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  simulateButton: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  simulateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  seeAll: {
    fontSize: 14,
    color: '#1a1a2e',
    fontWeight: '500',
  },
  list: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  appSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  appOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  appOptionSelected: {
    backgroundColor: '#1a1a2e',
    borderColor: '#1a1a2e',
  },
  appOptionText: {
    fontSize: 12,
    color: '#374151',
  },
  appOptionTextSelected: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sampleScroll: {
    marginBottom: 20,
  },
  sampleButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  sampleButtonText: {
    fontSize: 12,
    color: '#374151',
    maxWidth: 150,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
