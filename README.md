# HomeDoot Vendor App

A clean React Native starter project for HomeDoot Vendor application.

## Project Structure

```
src/
├── navigation/          # Navigation setup (Auth, Drawer, Bottom Tabs)
├── screens/            # App screens
├── components/         # Reusable UI components
├── assets/             # Images, fonts, etc.
└── constants/          # Colors, constants, etc.
```

## Features

- ✅ Auth Stack (Login + OTP placeholder)
- ✅ Drawer Navigation
- ✅ Bottom Tab Navigation
- ✅ Placeholder screens ready for development

## Screens

### Auth Stack
- Login Screen
- OTP Screen

### Main App
- Dashboard (Bottom Tab)
- Jobs (Bottom Tab)
- Wallet (Bottom Tab)
- Profile (Drawer)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install iOS pods:
```bash
cd ios && pod install && cd ..
```

3. Run the app:
```bash
# Android
npm run android

# iOS
npm run ios
```

## Development

Start by implementing features in the placeholder screens:
- `src/screens/LoginScreen.js`
- `src/screens/OtpScreen.js`
- `src/screens/DashboardScreen.js`
- `src/screens/JobsScreen.js`
- `src/screens/WalletScreen.js`
- `src/screens/ProfileScreen.js`

Add reusable components in `src/components/`

## Tech Stack

- React Native 0.75.3
- React Navigation 7
- React Native Gesture Handler
- React Native Reanimated
- React Native Safe Area Context
