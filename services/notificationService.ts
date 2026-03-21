import { EmitterSubscription } from 'react-native';
import { CaughtNotification, Transaction, Preset, AppSettings } from '@/types';
import { storageService } from './storageService';
import { apiService } from './apiService';
import { processNotification } from '@/utils/amountParser';
import { PACKAGE_TO_APP } from '@/constants';

// Import the notification listener library
import RNAndroidNotificationListener from 'react-native-android-notification-listener';

type NotificationCallback = (transaction: Transaction) => void;

interface NotificationData {
  app: string;
  title: string;
  text: string;
  time: string;
}

/**
 * Notification Listener Service
 *
 * Uses react-native-android-notification-listener to catch notifications
 * Requires:
 * 1. Development build (expo prebuild or EAS build)
 * 2. User permission: Settings > Apps > Special access > Notification access
 */
class NotificationService {
  private callbacks: NotificationCallback[] = [];
  private isEnabled: boolean = false;
  private subscription: EmitterSubscription | null = null;

  /**
   * Check if notification listener permission is granted
   */
  async checkPermission(): Promise<boolean> {
    try {
      const hasPermission = await RNAndroidNotificationListener.getPermissionStatus();
      return hasPermission === 'authorized';
    } catch (error) {
      console.log('Could not check notification permission:', error);
      return false;
    }
  }

  /**
   * Request notification listener permission
   * Opens Android settings for notification access
   */
  async requestPermission(): Promise<void> {
    try {
      const hasPermission = await RNAndroidNotificationListener.getPermissionStatus();
      if (hasPermission !== 'authorized') {
        // Open notification listener settings
        await RNAndroidNotificationListener.requestPermission();
      }
    } catch (error) {
      console.log('Could not request notification permission:', error);
    }
  }

  /**
   * Check if listener is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      const hasPermission = await RNAndroidNotificationListener.getPermissionStatus();
      return hasPermission === 'authorized' && this.isEnabled;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start listening for notifications
   */
  async startListening(): Promise<void> {
    try {
      const hasPermission = await RNAndroidNotificationListener.getPermissionStatus();
      
      if (hasPermission !== 'authorized') {
        console.log('Notification listener permission not granted');
        return;
      }

      // Subscribe to notification events
      this.subscription = RNAndroidNotificationListener.onNotificationReceived(
        (data: NotificationData) => {
          console.log('Notification received:', data);
          this.handleNativeNotification(data);
        }
      );

      this.isEnabled = true;
      console.log('Notification listener started successfully');
    } catch (error) {
      console.log('Could not start notification listener:', error);
    }
  }

  /**
   * Stop listening for notifications
   */
  stopListening(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isEnabled = false;
    console.log('Notification listener stopped');
  }

  /**
   * Handle notification from native module
   */
  private async handleNativeNotification(data: NotificationData): Promise<void> {
    try {
      const presets = await storageService.getPresets();
      const settings = await storageService.getSettings();

      const notification: CaughtNotification = {
        id: Date.now().toString(),
        packageName: data.app || 'unknown',
        appName: PACKAGE_TO_APP[data.app] || data.app || 'Unknown App',
        title: data.title || '',
        text: data.text || '',
        timestamp: Date.now(),
      };

      await this.handleNotification(notification, presets, settings);
    } catch (error) {
      console.error('Error handling notification:', error);
    }
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
