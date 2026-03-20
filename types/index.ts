// Transaction Types
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  sourceApp: string;
  sourcePackage: string;
  notificationText: string;
  receivedAt: string;
  status: 'pending' | 'sent' | 'failed';
  apiResponse?: ApiResponse;
}

// API Types
export interface ApiResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  timestamp?: string;
}

export interface ApiPayload {
  amount: number;
  currency: string;
  sourceApp: string;
  sourcePackage: string;
  notificationText: string;
  receivedAt: string;
  deviceId: string;
}

// Preset Types
export interface Preset {
  id: string;
  name: string;
  packageName: string;
  displayName: string;
  icon: string;
  patterns: RegexPattern[];
  enabled: boolean;
  color: string;
}

export interface RegexPattern {
  id: string;
  name: string;
  pattern: string;
  description: string;
}

// Settings Types
export interface AppSettings {
  apiUrl: string;
  apiKey: string;
  deviceId: string;
  notificationsEnabled: boolean;
  autoSend: boolean;
  retryAttempts: number;
  retryDelay: number;
}

// Notification Types
export interface CaughtNotification {
  id: string;
  packageName: string;
  appName: string;
  title: string;
  text: string;
  timestamp: number;
  extras?: Record<string, any>;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'preset/[id]': { id: string };
  'transaction/[id]': { id: string };
};

export type TabParamList = {
  index: undefined;
  history: undefined;
  presets: undefined;
  settings: undefined;
};
