# Payment Processor 📱💰

A React Native (Expo) application that catches payment notifications from Indonesian e-wallet and mobile banking apps, extracts unique transaction amounts, and sends them to a REST API server for payment verification.

## 🎯 Purpose

Host a payment gateway without 3rd party services by catching unique amount notifications to verify transactions.

## ✨ Features

- **Notification Listener** - Catches notifications from target e-wallet/banking apps using native Android NotificationListenerService
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
- **Android Studio** (for local builds) or **EAS Build** (cloud builds)

## 🏗️ Native Module Implementation

This app includes a custom Expo config plugin that implements Android's `NotificationListenerService`:

```
expo-plugin-notification-listener/
├── src/
│   ├── index.ts              # Expo config plugin
│   └── NotificationListener.ts  # JS interface
└── android/
    └── src/main/java/com/paymentprocessor/notificationlistener/
        ├── NotificationListener.java       # Native service
        ├── NotificationListenerModule.java # RN Module
        └── NotificationListenerPackage.java
```

### How it works:

1. **Expo Config Plugin** - Modifies `AndroidManifest.xml` during prebuild to add the notification listener service
2. **NotificationListenerService** - Native Android service that catches all notifications
3. **React Native Module** - Bridges native Java code to JavaScript
4. **Event Emitters** - Sends notification data to JS in real-time

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Prebuild Native Code

```bash
# Generate native Android project with the notification listener
npx expo prebuild --clean
```

### 3. Build the App

**Option A: Using EAS Build (Cloud)**
```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Build for Android
eas build --profile development --platform android
```

**Option B: Using Android Studio (Local)**
```bash
# Open in Android Studio
npx expo run:android
```

### 4. Enable Notification Access

**Important:** The app requires special notification access permission.

After installing on your device:
1. Go to **Settings** > **Apps** > **Special access**
2. Select **Notification access**
3. Find and enable **Payment Processor**

The app will show a prompt to open settings automatically.

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
├── types/                 # TypeScript types
└── expo-plugin-notification-listener/  # Native module
    ├── src/               # Plugin & JS interface
    └── android/           # Native Android code
```

## 🔐 Permissions Required

| Permission | Purpose |
|------------|---------|
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Listen to notifications (requires user approval in Settings) |
| `INTERNET` | API calls |
| `RECEIVE_BOOT_COMPLETED` | Start on boot |
| `FOREGROUND_SERVICE` | Background operation |

## 🛠️ Development

```bash
# Start development server
npx expo start

# Run on Android (requires prebuild first)
npx expo run:android

# Build production APK
eas build --profile production --platform android

# Regenerate native code after plugin changes
npx expo prebuild --clean
```

## ⚠️ Important Notes

1. **Expo Go won't work** - This app requires a custom development client because of the native notification listener module
2. **User permission required** - Users must manually enable notification access in Android settings
3. **Privacy** - The app only processes notifications from apps defined in presets
4. **Battery optimization** - Some devices may kill background services; add the app to battery optimization exceptions

## 📄 License

MIT

## 👤 Author

abbayosua (abbasiagian@gmail.com)

---

Made with ❤️ for Indonesian payment processing
