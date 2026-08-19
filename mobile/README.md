# 📱 My Academia - Mobile App (React Native & Expo)

Welcome to the **My Academia** mobile client! Built with React Native & Expo, this app connects to the live Render cloud backend and Neon PostgreSQL database.

---

## 🚀 How to Run on Your Real Phone in 60 Seconds

### Step 1: Install Expo Go
Download the **Expo Go** app on your phone:
* [Get Expo Go on Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
* [Get Expo Go on iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Start the Expo Development Server
In your terminal, navigate to the `mobile` folder:

```bash
cd mobile
npx expo start
```

### Step 3: Scan the QR Code
* **Android:** Open the Expo Go app and tap **"Scan QR code"**. Scan the QR code displayed in your terminal.
* **iOS:** Open your iPhone Camera app and scan the QR code displayed in your terminal, then tap the prompt to open in Expo Go.

The app will instantly bundle and launch directly on your phone with live reload! 🎉

---

## 🌐 Cloud Backend Integration
The mobile app is configured to talk directly to your live production cloud backend:
* **API URL:** `https://my-academia-backend.onrender.com/api`
* **Auth:** Secure JWT stored in device keychain via `expo-secure-store`.
* **Database:** Neon PostgreSQL Cloud DB.

---

## 📂 Project Architecture
```
mobile/
├── App.js                   # Root provider wrapper
├── app.json                 # Expo configuration
├── src/
│   ├── api/
│   │   └── client.js        # Axios instance configured with cloud API
│   ├── context/
│   │   └── AuthContext.js   # Global authentication state
│   ├── navigation/
│   │   ├── AppNavigator.js  # Main navigation switcher
│   │   ├── AuthNavigator.js # Login / Register stack
│   │   └── TabNavigator.js  # Bottom tab navigator (Home, Schedule, GPA, Profile)
│   ├── screens/
│   │   ├── auth/            # LoginScreen & RegisterScreen
│   │   └── main/            # HomeScreen, ScheduleScreen, PerformanceScreen, ProfileScreen
│   └── styles/
│       └── theme.js         # Color tokens and design system
```
