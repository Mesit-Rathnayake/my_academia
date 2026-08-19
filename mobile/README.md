# 📱 My Academia Mobile - Flutter App

A modern, light-mode **Flutter** application for **My Academia**, connected directly to the live Render cloud backend and Neon PostgreSQL database.

---

## 🚀 How to Run the App

### Option A: Run on Android Emulator
1. Start your Android Emulator from Android Studio or VS Code (e.g. `Pixel 7 Pro API 34`).
2. Navigate to the `mobile` directory in your terminal:
   ```bash
   cd mobile
   flutter run
   ```

---

### Option B: Run on Your Physical Android Phone via USB (Developer Mode)
1. **Enable Developer Options on your Phone:**
   * Go to **Settings ➔ About Phone**.
   * Tap **Build Number** 7 times until you see *"You are now a developer!"*.
2. **Enable USB Debugging:**
   * Go to **Settings ➔ System ➔ Developer Options**.
   * Turn ON **USB Debugging**.
3. **Connect your Phone to your PC with a USB cable:**
   * When prompted on your phone screen, tap **"Always allow from this computer" ➔ OK**.
4. In your terminal:
   ```bash
   cd mobile
   flutter devices
   flutter run
   ```
   *Flutter will compile the APK, install it directly onto your phone, and launch it with hot reload!* 🎉

---

### Option C: Run in Chrome / Web Browser (Instant Preview)
```bash
cd mobile
flutter run -d chrome
```

---

## 🌐 Cloud Backend Integration
* **API Base URL:** `https://my-academia-backend.onrender.com/api`
* **Auth:** Secure JWT token storage using `flutter_secure_storage`.
* **State Management:** `provider` (`AuthProvider`, `AcademicProvider`).

---

## 📂 Project Architecture
```
mobile/lib/
├── main.dart                          # App Entry & AuthWrapper
├── theme/
│   └── app_theme.dart                 # Custom SaaS Light Palette
├── models/
│   ├── user_model.dart                # Student Profile
│   ├── gpa_model.dart                 # Cumulative OGPA, SGPA, Grades
│   ├── timetable_model.dart           # Weekly Lecture Entries
│   └── exam_model.dart                # Examination Series & Papers
├── services/
│   └── api_service.dart               # HTTP Client with Bearer JWT
├── providers/
│   ├── auth_provider.dart             # Login, Register, Auto-login, Logout
│   └── academic_provider.dart         # Live Dashboard, GPA, Timetable
└── screens/
    ├── auth/                          # LoginScreen & RegisterScreen
    ├── home/                          # HomeScreen (Hero OGPA, Today's Classes, Exams)
    ├── schedule/                      # ScheduleScreen (Mon-Sun tabs & Exam series)
    ├── performance/                   # PerformanceScreen (SGPA accordion & grades)
    ├── profile/                       # ProfileScreen (Account info, Cloud status)
    └── main_nav_screen.dart           # Bottom Navigation Bar
```
