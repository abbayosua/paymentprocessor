import { CaughtNotification, Transaction, Preset, AppSettings } from '@/types';
import { storageService } from './storageService';
import { apiService } from './apiService';
import { processNotification } from '@/utils/amountParser';
import { PACKAGE_TO_APP } from '@/constants';

type NotificationCallback = (transaction: Transaction) => void;

/**
 * Notification Listener Service
 *
 * Note: Real notification listening requires:
 * 1. expo-dev-client build (not Expo Go)
 * 2. Custom native module or expo-config-plugin for NotificationListenerService
 * 3. User permission: Settings > Apps > Special access > Notification access
 *
 * This service provides the interface and mock functionality for development.
 */
class NotificationService {
  private callbacks: NotificationCallback[] = [];
  private isEnabled: boolean = false;

  /**
   * Check if notification listener is enabled
   */
  async checkPermission(): Promise<boolean> {
    // In real implementation, this would check:
    // NotificationManagerCompat.from(context).areNotificationsEnabled()
    // and isNotificationListenerEnabled()
    return this.isEnabled;
  }

  /**
   * Request notification listener permission
   * Opens Android settings for notification access
   */
  async requestPermission(): Promise<void> {
    // In real implementation, this would open:
    // Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
    console.log('Opening notification listener settings...');
  }

  /**
   * Start listening for notifications
   */
  async startListening(): Promise<void> {
    this.isEnabled = true;
    console.log('Notification listener started');
  }

  /**
   * Stop listening for notifications
   */
  stopListening(): Promise<void> {
    this.isEnabled = false;
    console.log('Notification listener stopped');
  }

  /**
   * Register callback for new transactions
   */
  onTransaction(callback: NotificationCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Process incoming notification
   * Called by native module when notification is received
   */
  async handleNotification(
    notification: CaughtNotification,
    presets: Preset[],
    settings: AppSettings
  ): Promise<Transaction | null> {
    // Find matching preset
    const result = processNotification(
      notification.text,
      notification.packageName,
      presets
    );

    if (!result) {
      console.log('No amount extracted from notification');
      return null;
    }

    // Create transaction
    const transaction = await storageService.addTransaction({
      amount: result.amount,
      currency: 'IDR',
      sourceApp: result.sourceApp,
      sourcePackage: notification.packageName,
      notificationText: notification.text,
    });

    // Notify callbacks
    this.callbacks.forEach((cb) => cb(transaction));

    // Auto-send to API if configured
    if (settings.autoSend && settings.apiUrl) {
      this.sendToApi(transaction, settings);
    }

    return transaction;
  }

  /**
   * Send transaction to API
   */
  async sendToApi(
    transaction: Transaction,
    settings: AppSettings
  ): Promise<void> {
    apiService.configure(settings.apiUrl, settings.apiKey);

    const response = await apiService.sendWithRetry(
      {
        amount: transaction.amount,
        currency: transaction.currency,
        sourceApp: transaction.sourceApp,
        sourcePackage: transaction.sourcePackage,
        notificationText: transaction.notificationText,
        receivedAt: transaction.receivedAt,
        deviceId: settings.deviceId,
      },
      settings.retryAttempts,
      settings.retryDelay
    );

    // Update transaction status
    await storageService.updateTransaction(transaction.id, {
      status: response.success ? 'sent' : 'failed',
      apiResponse: response,
    });
  }

  /**
   * Simulate notification for testing
   */
  async simulateNotification(
    packageName: string,
    text: string
  ): Promise<Transaction | null> {
    const presets = await storageService.getPresets();
    const settings = await storageService.getSettings();

    const notification: CaughtNotification = {
      id: Date.now().toString(),
      packageName,
      appName: PACKAGE_TO_APP[packageName] || packageName,
      title: 'Transaction',
      text,
      timestamp: Date.now(),
    };

    return this.handleNotification(notification, presets, settings);
  }
}

export const notificationService = new NotificationService();
