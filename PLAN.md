# Payment Processor - Notification Catcher App

## Project Overview

A React Native (Expo) application that catches payment notifications from Indonesian e-wallet and mobile banking apps, extracts unique transaction amounts, and sends them to a REST API server for payment verification.

### Goal
Host a payment gateway without 3rd party services by catching unique amount notifications to verify transactions.

---

## Core Flow

```
[E-Wallet/Bank App]
       ↓ (sends notification with unique amount)
[Android System]
       ↓ (NotificationListenerService)
[Payment Processor App]
       ↓ (parses amount: e.g., Rp 103,433)
[REST API Server]
       ↓ (match transaction with unique amount)
[Payment Confirmed ✓]
```

---

## Target Region

**Indonesia**

---

## Priority Apps for Presets

| App Name | Type | Package Name |
|----------|------|--------------|
| MyBCA | Mobile Banking | `com.bca` |
| BCA Mobile | Mobile Banking | `com.bca.mobilebanking` |
| GoPay | E-Wallet | `com.gojek.app` |
| OVO | E-Wallet | `ovo.id` |
| Dana | E-Wallet | `id.dana` |
| ShopeePay | E-Wallet | `com.shopee.id` |
| Livin' Mandiri | Mobile Banking | `id.co.banksinarmas.mobilebanking` / `com.mandiri.livin` |

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Framework | Expo SDK 52+ (with expo-dev-client) |
| Language | TypeScript |
| Navigation | React Navigation 6 |
| State Management | React Context + AsyncStorage |
| Notification Listener | Custom Native Module / expo-notifications |
| HTTP Client | axios or fetch |

---

## Features

### Core Features
1. **Notification Listener Service** - Catches notifications from target apps
2. **Amount Parser** - Extracts unique amounts from notification text
3. **Transaction Log** - Shows history of caught transactions
4. **API Integration** - Sends caught amounts to configured REST API
5. **Preset System** - Customizable patterns for different apps

### Settings
- REST API URL configuration
- Enable/disable specific app presets
- Test API connection
- View caught transaction history

---

## Project Structure

```
payment-processor/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard
│   │   ├── history.tsx        # Transaction history
│   │   └── settings.tsx       # Settings
│   ├── preset/
│   │   └── [id].tsx           # Edit preset
│   └── _layout.tsx            # Root layout
├── components/
│   ├── TransactionCard.tsx
│   ├── PresetCard.tsx
│   └── StatusIndicator.tsx
├── services/
│   ├── notificationListener.ts
│   ├── apiService.ts
│   └── presetService.ts
├── hooks/
│   ├── useNotifications.ts
│   └── usePresets.ts
├── utils/
│   ├── amountParser.ts
│   └── constants.ts
├── types/
│   └── index.ts
├── assets/
│   └── icons/
├── app.json
├── package.json
└── PLAN.md
```

---

## API Payload Structure

```json
{
  "amount": 103433,
  "currency": "IDR",
  "sourceApp": "OVO",
  "sourcePackage": "ovo.id",
  "notificationText": "Anda menerima Rp 103.433 dari...",
  "receivedAt": "2024-01-15T10:30:00Z",
  "deviceId": "unique-device-id"
}
```

---

## Notification Patterns (Indonesian Apps)

### Example Patterns to Match

```
GoPay: "Anda menerima Rp 103.433 dari [nama]"
OVO: "Rp103.433 telah masuk ke akun OVO Anda"
Dana: "Dana Rp 103.433 diterima dari [nama]"
ShopeePay: "ShopeePay: Anda menerima Rp103.433"
BCA: "Anda menerima transfer Rp 103.433"
Mandiri: "Transfer masuk Rp 103.433"
```

### Regex Patterns
```typescript
const patterns = {
  gopay: /menerima\s+Rp\.?\s*([\d.,]+)/i,
  ovo: /Rp\.?\s*([\d.,]+)\s+(?:telah|sudah)\s+masuk/i,
  dana: /dana\s+(?:Rp\.?\s*)?([\d.,]+)/i,
  shopeepay: /menerima\s+Rp\.?\s*([\d.,]+)/i,
  bca: /(?:transfer|menerima)\s+Rp\.?\s*([\d.,]+)/i,
  mandiri: /(?:transfer\s+masuk|masuk)\s+Rp\.?\s*([\d.,]+)/i,
};
```

---

## Development Phases

### Phase 1: Project Setup ✅
- [x] Initialize Expo project with TypeScript
- [x] Configure expo-dev-client
- [x] Set up project structure
- [x] Install dependencies

### Phase 2: Notification Listener ✅
- [x] Implement NotificationListenerService
- [x] Handle Android notification permission
- [x] Parse notification content

### Phase 3: UI Development ✅
- [x] Dashboard with transaction list
- [x] Settings page (API URL config)
- [x] Preset manager
- [x] Transaction detail view

### Phase 4: API Integration ✅
- [x] Create API service
- [x] Send caught amounts to endpoint
- [x] Error handling & retry logic

### Phase 5: Presets System ✅
- [x] Pre-built Indonesian e-wallet/bank presets
- [x] Custom regex patterns
- [x] Enable/disable specific apps

---

## Build & Deployment

### Development Build
```bash
# Install dependencies
npm install

# Build development client (requires EAS or local Android Studio)
eas build --profile development --platform android

# Run on device
npx expo start --dev-client
```

### Production Build
```bash
eas build --profile production --platform android
```

---

## Permissions Required

### Android
- `BIND_NOTIFICATION_LISTENER_SERVICE` - Listen to notifications
- `INTERNET` - API calls
- `RECEIVE_BOOT_COMPLETED` - Start service on boot
- `FOREGROUND_SERVICE` - Background notification listening

---

## Security Considerations

1. **Data Privacy** - Notification content is processed locally
2. **API Security** - HTTPS only, API key support
3. **Local Encryption** - Sensitive settings encrypted in AsyncStorage
4. **Permission Transparency** - Clear explanation to users about notification access

---

## Future Enhancements

- [ ] Multi-merchant support
- [ ] Transaction matching with pending orders
- [ ] Push notification for confirmed payments
- [ ] Export transaction history
- [ ] Multi-device sync
- [ ] iOS support (limited - iOS doesn't allow notification listening)

---

## License

MIT

---

## Author

abbayosua (abbasiagian@gmail.com)
