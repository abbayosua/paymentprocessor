import { Preset } from '@/types';

// Colors for different apps
export const COLORS = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#0f3460',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  white: '#ffffff',
  gray: '#6b7280',
  lightGray: '#e5e7eb',
  darkGray: '#374151',
};

// Default presets for Indonesian e-wallets and banks
export const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'gopay',
    name: 'GoPay',
    packageName: 'com.gojek.app',
    displayName: 'GoPay',
    icon: 'wallet',
    enabled: true,
    color: '#00aedd',
    patterns: [
      {
        id: 'gopay-1',
        name: 'GoPay Receive',
        pattern: '(?:menerima|terima)\\s+Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "Anda menerima Rp 103.433 dari..."',
      },
      {
        id: 'gopay-2',
        name: 'GoPay Masuk',
        pattern: 'Rp\\.?\\s*([\\d.,]+)\\s+(?:telah|sudah)\\s+masuk',
        description: 'Match: "Rp 103.433 telah masuk ke GoPay Anda"',
      },
    ],
  },
  {
    id: 'ovo',
    name: 'OVO',
    packageName: 'ovo.id',
    displayName: 'OVO',
    icon: 'wallet',
    enabled: true,
    color: '#4c3494',
    patterns: [
      {
        id: 'ovo-1',
        name: 'OVO Receive',
        pattern: 'Rp\\.?\\s*([\\d.,]+)\\s+(?:telah|sudah)\\s+masuk',
        description: 'Match: "Rp103.433 telah masuk ke akun OVO Anda"',
      },
      {
        id: 'ovo-2',
        name: 'OVO Transfer',
        pattern: '(?:menerima|terima)\\s+Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "Anda menerima Rp 103.433 dari..."',
      },
    ],
  },
  {
    id: 'dana',
    name: 'Dana',
    packageName: 'id.dana',
    displayName: 'Dana',
    icon: 'wallet',
    enabled: true,
    color: '#108ee9',
    patterns: [
      {
        id: 'dana-1',
        name: 'Dana Receive',
        pattern: '[Dd]ana\\s+(?:Rp\\.?\\s*)?([\\d.,]+)\\s+(?:diterima|masuk)',
        description: 'Match: "Dana Rp 103.433 diterima dari..."',
      },
      {
        id: 'dana-2',
        name: 'Dana Transfer',
        pattern: '(?:menerima|terima)\\s+(?:Dana\\s+)?Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "Anda menerima Dana Rp 103.433"',
      },
    ],
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    packageName: 'com.shopee.id',
    displayName: 'ShopeePay',
    icon: 'wallet',
    enabled: true,
    color: '#ee4d2d',
    patterns: [
      {
        id: 'shopeepay-1',
        name: 'ShopeePay Receive',
        pattern: 'ShopeePay.*(?:menerima|terima)\\s+Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "ShopeePay: Anda menerima Rp103.433"',
      },
      {
        id: 'shopeepay-2',
        name: 'ShopeePay Transfer',
        pattern: 'Rp\\.?\\s*([\\d.,]+)\\s+(?:telah|sudah)\\s+masuk.*ShopeePay',
        description: 'Match: "Rp 103.433 telah masuk ke ShopeePay"',
      },
    ],
  },
  {
    id: 'bca-mobile',
    name: 'BCA Mobile',
    packageName: 'com.bca.mobilebanking',
    displayName: 'BCA Mobile',
    icon: 'bank',
    enabled: true,
    color: '#005baa',
    patterns: [
      {
        id: 'bca-1',
        name: 'BCA Transfer In',
        pattern: '(?:transfer|menerima|terima).*Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "Anda menerima transfer Rp 103.433"',
      },
      {
        id: 'bca-2',
        name: 'BCA Setor',
        pattern: 'setor\\s+(?:tunai\\s+)?Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "Setor tunai Rp 103.433"',
      },
    ],
  },
  {
    id: 'mybca',
    name: 'MyBCA',
    packageName: 'com.bca',
    displayName: 'MyBCA',
    icon: 'bank',
    enabled: true,
    color: '#005baa',
    patterns: [
      {
        id: 'mybca-1',
        name: 'MyBCA Transfer',
        pattern: '(?:transfer|menerima|terima).*Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "Transfer masuk Rp 103.433"',
      },
    ],
  },
  {
    id: 'livin-mandiri',
    name: "Livin' Mandiri",
    packageName: 'com.mandiri.livin',
    displayName: "Livin' Mandiri",
    icon: 'bank',
    enabled: true,
    color: '#003366',
    patterns: [
      {
        id: 'mandiri-1',
        name: 'Mandiri Transfer In',
        pattern: '(?:transfer\\s+masuk|masuk).*Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "Transfer masuk Rp 103.433"',
      },
      {
        id: 'mandiri-2',
        name: 'Mandiri Receive',
        pattern: '(?:menerima|terima).*Rp\\.?\\s*([\\d.,]+)',
        description: 'Match: "Anda menerima Rp 103.433"',
      },
    ],
  },
];

// Default app settings
export const DEFAULT_SETTINGS = {
  apiUrl: '',
  apiKey: '',
  deviceId: '',
  notificationsEnabled: true,
  autoSend: true,
  retryAttempts: 3,
  retryDelay: 5000,
};

// Package name to app name mapping
export const PACKAGE_TO_APP: Record<string, string> = {
  'com.gojek.app': 'GoPay',
  'ovo.id': 'OVO',
  'id.dana': 'Dana',
  'com.shopee.id': 'ShopeePay',
  'com.bca.mobilebanking': 'BCA Mobile',
  'com.bca': 'MyBCA',
  'com.mandiri.livin': "Livin' Mandiri",
  'id.co.banksinarmas.mobilebanking': "Livin' Mandiri",
};
