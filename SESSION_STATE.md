# Session State & Project Handoff (`SESSION_STATE.md`)

**Date:** 2026-10-13  
**Project:** Noor Companion (`muslim-companion`)  
**Location:** `C:\Users\HP\.gemini\antigravity\scratch\muslim-companion`  
**Current State:** Stable, Verified, Tested, and Packaged  

---

## 1. Executive Summary

The **Noor Companion** app is an all-in-one digital companion for daily Islamic life. It integrates prayer schedules, astronomical calculations, Qibla compass, Quran recitation, Adhkar with haptic Tasbih, Zakat calculations, and Hijri calendar into a unified, responsive, ad-free application.

The project is structured as a cross-platform progressive application using **Next.js 15 (React 19, Tailwind CSS v4)** with static HTML export (`output: 'export'`) packaged natively for **Android** and **iOS** via **Capacitor 8**.

---

## 2. Completed Modules & Features

| Module | Core Features | Status |
| :--- | :--- | :--- |
| **Prayer Times & Athan** | 100% offline client-side calculation using `adhan`. Supports 5 major calculation authorities and Shafi/Hanafi Asr juristic methods. Includes countdown to next prayer, manual city selection, GPS geolocation, and synthesized Athan audio. | Complete |
| **Qibla Direction** | Great-circle forward azimuth calculation to the Kaaba (`21.422487° N, 39.826206° E`). Real-time device orientation sensor support on mobile, interactive manual 360° dial fallback on desktop, and haptic vibration (`navigator.vibrate(50)`) within $\pm 3^\circ$. | Complete |
| **Holy Quran Reader** | 114 Surah index, full Arabic Uthmani text, multi-language translations (English, Urdu, Indonesian, French, Turkish, Spanish). Search by name/meaning. | Complete |
| **Ayah Emphasis UX** | Active Ayah visual distinction (`ring-2 ring-emerald-500/60 shadow-2xl`), live animated audio equalizer badge (`Reciting Now • يُتلى الآن`), hands-free smooth auto-scrolling (`scrollIntoView`), continuous verse-by-verse auto-advance, and click-to-focus reading mode. | Complete |
| **Reciter Audio Suite** | Audio streaming support across 11 world-renowned Qaris/recitation styles: Mishary Alafasy, Ali Jaber (Studio), Ali Jaber (Haram Taraweeh), Ali Abdur-Rahman Al-Hudhaify, AbdulBaset AbdulSamad, Maher Al-Muaiqly, Mahmoud Khalil Al-Husary, Saad Al-Ghamdi, Abu Bakr Al-Shatri, Abdur-Rahman Al-Sudais, and Saud Al-Shuraim. | Complete |
| **Adhkar & Tasbih** | Authentic morning & evening supplications (Hisn al-Muslim) with repetition counters. In-memory Web Audio oscillator tactile feedback (600Hz decaying click) + haptic vibration (`navigator.vibrate(35)` on count, `[80, 50, 80]` on target). Custom goal counter. | Complete |
| **Zakat Calculator** | Real-time Nisab valuation across gold & silver standards, asset breakdown (cash, gold/silver, investments, business inventory, owed debts), and instantaneous calculation of the 2.5% obligation. | Complete |
| **Hijri Calendar** | Umm al-Qura lunar date computation, major Islamic holiday countdowns (Ramadan, Eid al-Fitr, Day of Arafah, Eid al-Adha, Islamic New Year, Ashura). | Complete |
| **Native Alarms & Background Notifications** | Native scheduled notifications via `@capacitor/local-notifications` on Android/iOS, and Web Notifications API fallback in browsers. Settings toggles for individual prayers and daily Adhkar. | Complete |
| **Arabic Typography & Script Customizer** | 5 world-class Arabic calligraphy styles (Madani Mushaf / Scheherazade New, Classical Amiri, Modern Naskh / Noto Naskh Arabic, Indo-Pak Nastaliq / Noto Nastaliq Urdu, and Contemporary Cairo), dual Quranic script orthography (Uthmani with Tajweed markers vs. Simple Clean), 4-tier font size scaling, live preview modal, and localStorage persistence. | Complete |
| **Synchronized Recitation & Docked Player** | 100% deterministic verse-by-verse recitation synchronized with written Quranic text across all 11 Qaris. Real-time luminous emerald highlight, live 3-bar animated equalizer, hands-free smooth auto-centering (`scrollIntoView`), zero-latency prebuffering of verse $N+1$, seamless mid-recitation reciter switching with queued transition, cross-Surah auto-advance (Surahs 1 to 114), single-verse infinite repeat loop (`Repeat1` button), opening Bismillah (Ayah 0) recitation across all Surahs (with interactive Basmalah header card), Web Media Session API background audio with OS lockscreen controls, and docked sticky player console with Prev/Next, Play/Pause, Continuous, Auto-Center toggle, and playback speeds (0.75x - 1.5x). | Complete |
| **Offline Audio Recitations (Cache API)** | 100% offline verse audio playback via native browser Cache Storage API (`noor-quran-audio-v1`). Single-tap chapter batch downloader with parallel throttled concurrency (3 ayahs/batch) and live percentage progress (includes Ayah 0 Bismillah). Smart Auto-Cache on Play silently caches listened verses in the background. Reader header `Offline Ready` badge, catalog grid `Audio Saved` indicators, and one-tap storage reclamation delete action. | Complete |

---

## 3. Project File Structure

```
muslim-companion/
├── android/                             # Native Android project (Capacitor 8)
│   ├── app/build/outputs/apk/debug/     # Compiled native APK
│   ├── build.gradle                     # Configured with Kotlin 2.1.20
│   └── variables.gradle                 # Configured with kotlinVersion = '2.1.20'
├── ios/                                 # Native iOS project (Capacitor 8)
├── public/                              # PWA manifest, icons, static assets
├── src/
│   ├── app/
│   │   ├── globals.css                  # Tailwind CSS styling with theme tokens
│   │   ├── layout.tsx                   # Root HTML layout and metadata
│   │   └── page.tsx                     # Main view router and global state
│   ├── components/
│   │   ├── AdhkarTasbih.tsx             # Supplications & haptic Tasbih counter
│   │   ├── BottomNav.tsx                # Mobile bottom navigation bar
│   │   ├── HijriCalendar.tsx            # Islamic calendar and event countdowns
│   │   ├── Navbar.tsx                   # Top navigation with date & quick controls
│   │   ├── PrayerTimes.tsx              # Astronomical prayer schedule & Athan
│   │   ├── QiblaCompass.tsx             # Sensor-driven geodesic compass
│   │   ├── QuranReader.tsx              # Verse-by-verse reader with Ayah emphasis UX
│   │   ├── SettingsModal.tsx            # Preferences, calculation methods, alarms
│   │   └── ZakatCalculator.tsx          # Zakat asset and obligation calculator
│   ├── data/
│   │   ├── adhkarData.ts                # Authentic Hisn al-Muslim texts
│   │   ├── cities.ts                    # Pre-cached global coordinates
│   │   └── quranData.ts                 # 114 Surahs, reciters catalog & stream URLs
│   ├── hooks/
│   │   └── usePrayerTimes.ts            # Client-side adhan calculations hook
│   ├── types/
│   │   └── index.ts                     # TypeScript interfaces
│   └── utils/
│       ├── audioCache.ts                # Browser Cache Storage API for offline recitation
│       ├── hijri.ts                     # Umm al-Qura calendar algorithms
│       ├── notifications.ts             # Capacitor & Web Notification scheduler
│       └── qibla.ts                     # Great-circle bearing math
├── capacitor.config.ts                  # Capacitor configuration (appId: com.muslim.companion)
├── decisions.md                         # Architecture Decision Record (ADR log)
├── decissions.md                        # Architecture Decision Record (synced copy)
├── noor-companion-debug.apk             # Ready-to-install Android debug APK (4.67 MB)
├── package.json                         # Dependencies and scripts
├── postcss.config.mjs                   # PostCSS Tailwind v4 compiler
├── README.md                            # Comprehensive project overview
├── SESSION_STATE.md                     # This handoff file
└── tsconfig.json                        # TypeScript configuration
```

---

## 4. Runbook & Commands for Future Sessions

### Web Development Server
```powershell
npm run dev -- --port 3000
```
Access at `http://localhost:3000`.

### Production Web Build (Static Export)
```powershell
npm run build
```
Generates optimized static HTML/CSS/JS in `out/`.

### Capacitor Native Sync
```powershell
npx cap sync
```
Copies `out/` into `android/` and `ios/` and updates native plugins.

### Android Native APK Build
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
cd android
.\gradlew.bat assembleDebug
cd ..
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "noor-companion-debug.apk" -Force
```
*Note: Uses Java 21 from Android Studio's bundled runtime.*

---

## 5. Architectural Decisions (Index of ADRs)

All decisions are detailed in [`decisions.md`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/decisions.md):
- **[DEC-001]** All-in-One Daily Muslim Companion Scope & Module Architecture
- **[DEC-002]** 100% Offline-First Client-Side Astronomical Calculation (`adhan`)
- **[DEC-003]** Cross-Platform Distribution via Next.js Static Export & Capacitor
- **[DEC-004]** Geodesic Bearing & Device Sensor Orientation for Qibla Compass
- **[DEC-005]** Local Data Architecture for Quran, Adhkar, and Tasbih Persistence
- **[DEC-006]** Android Java 21 Build Environment & Native APK Assembly
- **[DEC-007]** Web Audio Synthesized Tactile Feedback & Haptic Vibrate Integration
- **[DEC-008]** PostCSS & Tailwind v4 Integration Fix for Next.js
- **[DEC-009]** Multi-Reciter Quran, Multi-Language Translations & Native Background Alarms Architecture
- **[DEC-010]** Ayah Emphasis UX & Additional Qaris (Ali Jaber, Abdur-Rahman Al-Hudhaify)
- **[DEC-011]** Dual Ali Jaber Recitation Editions & Catalog Expansion (Sudais & Shuraim)
- **[DEC-012]** Client-Side Hydration Stabilization & Device Clock Mounting Guard
- **[DEC-013]** Interactive Arabic Typography & Quranic Script Customizer
- **[DEC-014]** Synchronized Audio Recitation & Written Quran Text Alignment
- **[DEC-015]** Seamless Mid-Recitation Reciter Switching
- **[DEC-016]** Offline Quran Audio Recitations via Browser Cache Storage API
- **[DEC-017]** Cross-Surah Continuous Recitation, Per-Ayah Infinite Loop, and Background Lockscreen Audio (Web Media Session API)
- **[DEC-018]** Opening Bismillah (Ayah 0) Audio Recitation Across All Quranic Surahs

---

## 6. High-Value Roadmap Items for Subsequent Sessions

1. **Full Offline Quran Bundle (IndexedDB)**:
   - Cache full text of all 114 Surahs and translations locally in client-side IndexedDB for complete offline text access without network dependency.
2. **Storage Inspector Modal**:
   - Add a storage management card in Settings showing total cached audio size (MB), number of cached verses, and a "Clear Audio Cache" button.
3. **Dedicated Memorization (Hifdh) Range Drills**:
   - Add bracket range looping (e.g. repeat Ayah 1 to 5 continuously $N$ times) and text blur-to-recall reveal drills.
4. **Visual Display Customizations**:
   - Add OLED Pitch Black and Sepia reading themes in addition to Dark/Emerald.
5. **Augmented Reality (AR) Qibla Finder**:
   - Integrate camera overlay for visualizing the Kaaba direction in physical 3D space.

