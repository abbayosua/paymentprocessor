# Payment Processor 📱💰

A React Native (Expo) application that catches payment notifications from Indonesian e-wallet and mobile banking apps, extracts unique transaction amounts, and sends them to a REST API server for payment verification.

## 🎯 Purpose

Host a payment gateway without 3rd party services by catching unique amount notifications to verify transactions.

## ✨ Features

- **Notification Listener** - Catches notifications from target e-wallet/banking apps
- **Amount Parser** - Extracts unique amounts from notification text using regex patterns
- **Transaction Log** - View history of caught transactions
- **API Integration** - Send caught amounts to your REST API
- **Preset System** - Customizable patterns for different apps
- **Simulator** - Test without real notifications

## 🏦 Supported Apps (Indonesia)

| App | Type | Status |
|-----|------|--------|
| GoPay | E-Wallet | ✅ |
| OVO | E-Wallet | ✅ |
| Dana | E-Wallet | ✅ |
| ShopeePay | E-Wallet | ✅ |
| BCA Mobile | Mobile Banking | ✅ |
| MyBCA | Mobile Banking | ✅ |
| Livin' Mandiri | Mobile Banking | ✅ |

## 📋 Requirements

- Node.js 18+
- Expo CLI
- EAS CLI (for building)
- Android device (for testing)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure the App

Open the app settings and enter your API URL:
- **API URL**: Your server endpoint (e.g., `https://your-api.com`)
- **API Key**: Optional authentication key

### 3. Build Development Client

Since this app requires notification listening permissions, you need to build a development client:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Build for Android
eas build --profile development --platform android

# Or build locally with Android Studio
npx expo run:android
```

### 4. Enable Notification Access

After installing on your device:
1. Go to **Settings** > **Apps** > **Special access**
2. Select **Notification access**
3. Enable **Payment Processor**

### 5. Test with Simulator

Use the built-in simulator on the Dashboard to test without real notifications:
1. Select an app (e.g., OVO)
2. Enter notification text or use samples
3. Click **Simulate** to test amount extraction

## 🔧 API Payload

When a transaction is caught, the app sends:

```json
{
  "amount": 103433,
  "currency": "IDR",
  "sourceApp": "OVO",
  "sourcePackage": "ovo.id",
  "notificationText": "Rp103.433 telah masuk ke akun OVO Anda",
  "receivedAt": "2024-01-15T10:30:00Z",
  "deviceId": "unique-device-id"
}
```

## 📁 Project Structure

```
payment-processor/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── history.tsx    # Transaction history
│   │   ├── presets.tsx    # App presets
│   │   └── settings.tsx   # Settings
│   ├── preset/[id].tsx    # Preset details
│   └── transaction/[id].tsx # Transaction details
├── components/            # Reusable UI components
├── services/              # Business logic
│   ├── apiService.ts      # REST API client
│   ├── notificationService.ts # Notification handling
│   └── storageService.ts  # Local storage
├── hooks/                 # React hooks
├── utils/                 # Utility functions
├── constants/             # App constants & presets
└── types/                 # TypeScript types
```

## 🔐 Permissions Required

| Permission | Purpose |
|------------|---------|
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Listen to notifications |
| `INTERNET` | API calls |
| `RECEIVE_BOOT_COMPLETED` | Start on boot |
| `FOREGROUND_SERVICE` | Background operation |

## 🛠️ Development

```bash
# Start development server
npx expo start

# Run on Android
npx expo start:android

# Build production APK
eas build --profile production --platform android
```

## 📄 License

MIT

## 👤 Author

abbayosua (abbasiagian@gmail.com)

---

Made with ❤️ for Indonesian payment processing
