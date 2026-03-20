import { EmitterSubscription, NativeModules, NativeEventEmitter } from 'react-native';
import { CaughtNotification, Transaction, Preset, AppSettings } from '@/types';
import { storageService } from './storageService';
import { apiService } from './apiService';
import { processNotification } from '@/utils/amountParser';
import { PACKAGE_TO_APP } from '@/constants';

type NotificationCallback = (transaction: Transaction) => void;

interface NotificationData {
  packageName: string;
  title: string;
  text: string;
  timestamp: number;
  id: number;
  tag: string;
}

// Native module reference
const NotificationListener = NativeModules.NotificationListener;

// Event emitter for native events
let eventEmitter: NativeEventEmitter | null = null;
if (NotificationListener) {
  eventEmitter = new NativeEventEmitter(NotificationListener);
}

/**
 * Notification Listener Service
 *
 * Uses native Android NotificationListenerService to catch notifications
 * Requires:
 * 1. expo-dev-client build (not Expo Go)
 * 2. User permission: Settings > Apps > Special access > Notification access
 */
class NotificationService {
  private callbacks: NotificationCallback[] = [];
  private isEnabled: boolean = false;
  private subscriptions: EmitterSubscription[] = [];

  /**
   * Check if notification listener permission is granted
   */
  async checkPermission(): Promise<boolean> {
    try {
      if (NotificationListener?.hasPermission) {
        return await NotificationListener.hasPermission();
      }
      return this.isEnabled;
    } catch (error) {
      console.log('Native module not available, using mock');
      return this.isEnabled;
    }
  }

  /**
   * Request notification listener permission
   * Opens Android settings for notification access
   */
  async requestPermission(): Promise<void> {
    try {
      if (NotificationListener?.openSettings) {
        await NotificationListener.openSettings();
      }
    } catch (error) {
      console.log('Native module not available');
    }
  }

  /**
   * Check if listener is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      if (NotificationListener?.isListenerConnected) {
        return await NotificationListener.isListenerConnected();
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start listening for notifications
   */
  async startListening(): Promise<void> {
    try {
      if (eventEmitter) {
        // Subscribe to notification events from native module
        const notificationSub = eventEmitter.addListener(
          'onNotificationReceived',
          (data: NotificationData) => {
            this.handleNativeNotification(data);
          }
        );

        const connectedSub = eventEmitter.addListener(
          'onListenerConnected',
          () => {
            console.log('Notification listener connected');
            this.isEnabled = true;
          }
        );

        const disconnectedSub = eventEmitter.addListener(
          'onListenerDisconnected',
          () => {
            console.log('Notification listener disconnected');
            this.isEnabled = false;
          }
        );

        this.subscriptions = [notificationSub, connectedSub, disconnectedSub];
        this.isEnabled = true;
        console.log('Notification listener started');
      } else {
        console.log('Native module not available, using mock mode');
        this.isEnabled = true;
      }
    } catch (error) {
      console.log('Native module not available, using mock mode');
      this.isEnabled = true;
    }
  }

  /**
   * Stop listening for notifications
   */
  stopListening(): void {
    // Remove all subscriptions
    this.subscriptions.forEach((sub) => sub.remove());
    this.subscriptions = [];
    this.isEnabled = false;
    console.log('Notification listener stopped');
  }

  /**
   * Handle notification from native module
   */
  private async handleNativeNotification(data: NotificationData): Promise<void> {
    const presets = await storageService.getPresets();
    const settings = await storageService.getSettings();

    const notification: CaughtNotification = {
      id: data.id.toString(),
      packageName: data.packageName,
      appName: PACKAGE_TO_APP[data.packageName] || data.packageName,
      title: data.title,
      text: data.text,
      timestamp: data.timestamp,
    };

    await this.handleNotification(notification, presets, settings);
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
