# Noor - Muslim Daily Companion (نُور)

A modern, fast, 100% offline-first digital companion application for Muslims worldwide. Built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, and **Capacitor 8** for Web, Android, and iOS.

---

## 🌟 Core Features

### 1. ⏱️ Offline Prayer Times & Athan
- **100% Client-Side Calculation:** Powered by `adhan-js` astronomical algorithms. Zero external API dependency, zero tracking, works in airplane mode.
- **5 Daily Prayers + Sunnah:** Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, Midnight (*Nisf al-Layl*), and Tahajjud (*Last Third of the Night*).
- **Live Countdown:** Real-time second-by-second countdown until the next prayer.
- **Audio Athan:** Audio call to prayer preview.
- **Juristic & Authority Settings:** Support for Muslim World League (MWL), ISNA, Umm al-Qura (Makkah), Egyptian Survey, Karachi, Dubai, Qatar, Kuwait, and Singapore. Full Shafi and Hanafi Asr calculation support.

### 2. 🧭 Qibla Compass
- **Spherical Geodesic Formula:** Accurate great-circle azimuth angle calculation to the Holy Kaaba (`21.4225° N, 39.8262° E`).
- **Live Device Orientation:** Senses phone compass heading via `DeviceOrientationEvent` (`webkitCompassHeading` on iOS, `alpha` on Android).
- **Haptic Alignment Glow:** Border glows golden-emerald and phone vibrates when facing the Kaaba within $\pm 3^\circ$.
- **Desktop Simulator:** Interactive dial slider for instant orientation testing on PC and Mac.

### 3. 📖 Holy Quran Reader & Audio
- **Complete Directory:** All 114 Surahs with Arabic names, English transliteration, English meaning, revelation type (Meccan/Medinan), and Juz index.
- **Offline Essential Surahs:** Pre-bundled with Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas, Al-Asr, and Al-Kawthar.
- **Full Recitation Streaming:** Listen to Mishary Rashid Alafasy audio recitation per Surah or per Ayah.
- **Bookmarking:** Saves last read Surah automatically.

### 4. 📿 Daily Adhkar & Digital Tasbih
- **Authentic Supplications:** Morning (*Adhkar as-Sabah*), Evening (*Adhkar al-Masa'*), and After-Prayer supplications sourced directly from *Hisn al-Muslim* (Fortress of the Muslim) with Hadith references and virtues.
- **Interactive Tally Counters:** Track counts with progress bars.
- **Digital Tasbih (المسبحة):** Large tactile bead counter with preset dhikr (*Subhanallah*, *Alhamdulillah*, *Allahu Akbar*, *Astaghfirullah*, *La ilaha illallah*), target completions, haptic feedback, and synthesized zero-latency audio click.

### 5. 💰 Zakat Calculator
- **Jurisprudential Accuracy:** Real-time 2.5% Zakat calculation based on net wealth held for one lunar year (*Hawl*).
- **Gold & Silver Nisab Benchmark:** Custom or live market commodity valuation (85g Gold / 595g Silver).
- **Asset Breakdown:** Cash, Gold/Silver jewelry & bullion, stocks, investments, business merchandise, and loans receivable minus immediate debts.
- **Quranic Guidance:** Summary of the 8 eligible recipient categories (*Quran 9:60*).

### 6. 📅 Hijri Calendar & Milestones
- **Umm al-Qura Calendar:** Accurate Gregorian to Hijri lunar conversion.
- **Sunnah Fasting Alerts:** Automatic reminders for Monday/Thursday fasts and White Days (*Ayyam al-Beed*: 13th, 14th, 15th).
- **Upcoming Holidays Countdown:** Ramadan, Laylat al-Qadr, Eid al-Fitr, Day of Arafah, Eid al-Adha, Islamic New Year, Ashura, and Mawlid an-Nabi.

---

## 📱 Mobile App (Android & iOS)

### Android APK:
A pre-built native debug APK is ready at:
```
./noor-companion-debug.apk
```
Or rebuild anytime via:
```powershell
# Sync latest web assets
npx cap sync android

# Build native APK (requires Java 21)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
cd android
.\gradlew.bat assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

### iOS App:
Open the native iOS project in Xcode:
```bash
npx cap open ios
```

---

## 💻 Running the Web App Locally

```powershell
# Install dependencies
npm install

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Architecture Decisions
All technical and architectural choices are recorded in [`decisions.md`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/decisions.md) and [`decissions.md`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/decissions.md).
