import { NativeModules } from 'react-native';

// Type definitions for the native module
export interface NotificationData {
  packageName: string;
  title: string;
  text: string;
  timestamp: number;
  id: number;
  tag: string;
}

export interface NotificationListenerNativeInterface {
  hasPermission(): Promise<boolean>;
  openSettings(): Promise<boolean>;
  isListenerConnected(): Promise<boolean>;
  getActiveNotifications(): Promise<{ count: number }>;
}

export const NotificationListenerNative: NotificationListenerNativeInterface =
  NativeModules.NotificationListener || {
    hasPermission: async () => false,
    openSettings: async () => false,
    isListenerConnected: async () => false,
    getActiveNotifications: async () => ({ count: 0 }),
  };
