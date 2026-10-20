# Noor (نُور) — Muslim Daily Companion

A modern, privacy-first, offline-capable Islamic daily companion web & mobile application built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, **Adhan.js**, and **Capacitor**.

## ✨ Key Features

### 🕌 Prayer Times & Daily Salah Habit Tracker
- **100% Offline Astronomical Calculation** powered by `adhan` (MWL, ISNA, Umm al-Qura, Egyptian, Karachi, Dubai, Qatar, Kuwait, Singapore).
- **Per-Prayer Minute Adjustments (`±30m`)** & **High-Latitude Rules** (*Middle of the Night*, *Seventh of the Night*, *Twilight Angle*).
- **Pillars-Style Daily Salah Habit Tracker**: Log prayers (`On Time`, `Jama'ah`, `Late`, `Qaza`), track your daily `X/5` ring and streak, manage a **Qaza Makeup Counter**, and toggle **Pause Streak (Excused)** mode.
- **Sunnah Times**: Middle of the Night & Last Third of the Night (Tahajjud / Qiyam al-Layl).

### 📖 Holy Quran Reader, Mushaf View & Hifdh Suite
- **Dual Reading Modes**: Switch seamlessly between **Verse-by-Verse Study Cards** and **Continuous Mushaf Flowing Page View** (`﴿١﴾`).
- **8 World-Renowned Qaris** with **Bismillah Pre-Recitation**, **Cross-Surah Auto-Advance**, **Background Media Session Lock-Screen Controls**, and **Offline Audio Caching** (Cache API).
- **100% Offline Surah Text Caching**: Every opened Surah is automatically cached in `localStorage` for instant offline reading.
- **Hifdh Memorization Suite**:
  - **Blur / Hide Text Self-Testing Mode** (tap any verse to reveal/hide).
  - **Single-Verse Repeat Loop** (`1x`, `3x`, `5x`, `10x`, `∞`) with configurable pause delay.
  - **Ayah-Range Looping (`From Ayah X` → `To Ayah Y`)**.
- **Expandable Verse Tafsir Drawer**: *Tafsir Al-Muyassar* (Arabic) + Classical English commentary with offline caching.
- **Multi-Ayah Bookmarks**, **Last-Read Resume Banner**, **Quick-Access Surah Pills**, **Juz 1–30 Filter**, and **Interactive Khatmah Planner**.

### 📿 Daily Adhkar & Digital Tasbih
- **Hisnul Muslim Categories**: Morning (`أذكار الصباح`), Evening (`أذكار المساء`), After Prayer (`أذكار بعد الصلاة`), and Before Sleep (`أذكار النوم`).
- **Date-Keyed Daily Progress (`YYYY-MM-DD`)**: Automatically resets each new day while maintaining your **Daily Adhkar Streak** and auto-scrolling to the next incomplete Dhikr.
- **Interactive Digital Tasbih** with lifetime and per-preset counters.

### 🧭 Qibla Compass, Hijri Calendar, Zakat & Studio
- **Live Qibla Finder**: Great-circle bearing calculation, live magnetometer sensor integration, and an interactive **Figure-8 Calibration Guide**.
- **Interactive 7-Column Hijri/Gregorian Calendar Grid**: Month navigation, **Moon-Sighting Offset (`-2` to `+2` days)**, **Ayyam al-Beed (White Days 13–15)**, and **Monday/Thursday Sunnah Fast** highlights.
- **Zakat & Fitrana/Fidyah Calculator**: Multi-currency presets, Gold/Silver Nisab thresholds, persistent asset inputs, and **Zakat al-Fitr & Fidyah** tab.
- **Multi-Theme Engine**: *Emerald Night*, *OLED Pitch Black (`#000000`)*, and *Warm Mushaf Sepia*.

---

## 🚀 Getting Started Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Building Static Export

```bash
npm run build
```

Generates a static production export in `./out`.
