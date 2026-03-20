import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

export interface NotificationData {
  packageName: string;
  title: string;
  text: string;
  timestamp: number;
  id: number;
  tag: string;
}

export interface NotificationListenerEvents {
  onNotificationReceived: (data: NotificationData) => void;
  onListenerConnected: () => void;
  onListenerDisconnected: () => void;
}

interface NotificationListenerInterface {
  hasPermission(): Promise<boolean>;
  openSettings(): Promise<boolean>;
  isListenerConnected(): Promise<boolean>;
  getActiveNotifications(): Promise<{ count: number }>;
}

const { NotificationListener } = NativeModules;

if (!NotificationListener) {
  console.warn('NotificationListener native module is not available. Make sure you built with expo-dev-client.');
}

const eventEmitter = new NativeEventEmitter(NotificationListener);

/**
 * Check if notification listener permission is granted
 */
export async function hasNotificationPermission(): Promise<boolean> {
  return NotificationListener?.hasPermission() ?? false;
}

/**
 * Open Android notification listener settings
 */
export async function openNotificationSettings(): Promise<boolean> {
  return NotificationListener?.openSettings() ?? false;
}

/**
 * Check if the listener service is connected
 */
export async function isListenerConnected(): Promise<boolean> {
  return NotificationListener?.isListenerConnected() ?? false;
}

/**
 * Get count of active notifications
 */
export async function getActiveNotificationCount(): Promise<number> {
  const result = await NotificationListener?.getActiveNotifications();
  return result?.count ?? 0;
}

/**
 * Subscribe to notification events
 */
export function onNotificationReceived(
  callback: (data: NotificationData) => void
): EmitterSubscription {
  return eventEmitter.addListener('onNotificationReceived', callback);
}

/**
 * Subscribe to listener connected event
 */
export function onListenerConnected(
  callback: () => void
): EmitterSubscription {
  return eventEmitter.addListener('onListenerConnected', callback);
}

/**
 * Subscribe to listener disconnected event
 */
export function onListenerDisconnected(
  callback: () => void
): EmitterSubscription {
  return eventEmitter.addListener('onListenerDisconnected', callback);
}

export default {
  hasPermission: hasNotificationPermission,
  openSettings: openNotificationSettings,
  isConnected: isListenerConnected,
  getActiveNotificationCount,
  onNotificationReceived,
  onListenerConnected,
  onListenerDisconnected,
};
