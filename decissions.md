# Architecture Decision Log (`decisions.md`)

This document records the architectural, technical, and engineering decisions made during the lifecycle of the **Muslim Companion** app.

---

## Index of Decisions

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

---

### [DEC-001] All-in-One Daily Muslim Companion Scope & Module Architecture

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #architecture #scope #product

#### Context & Problem Statement
Muslim users often have to switch between 4-5 different single-purpose apps for their daily spiritual routine: one for prayer times, one for Qibla compass, one for Quran recitation, one for morning/evening adhkar, and another for Zakat calculations. The goal is to unify these core digital needs into a clean, modern, ad-free companion.

#### Decision
Implement a modular all-in-one companion featuring 6 dedicated modules:
1. **Prayer Times & Athan:** 5 daily prayers + Sunrise & Qiyam with countdown and audio Athan.
2. **Qibla Direction:** Geodesic compass with sensor orientation and haptic alignment.
3. **Holy Quran:** 114 Surahs, Arabic script, English translation, audio recitations, and bookmarking.
4. **Adhkar & Tasbih:** Authentic morning/evening supplications (Hisn al-Muslim) + interactive digital Tasbih.
5. **Zakat Calculator:** Real-time Nisab valuation and breakdown of obligations across wealth categories.
6. **Hijri Calendar:** Umm al-Qura lunar dates and countdowns to major Islamic holidays.

---

### [DEC-002] 100% Offline-First Client-Side Astronomical Calculation (`adhan`)

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #offline #algorithms #performance

#### Context & Problem Statement
Prayer time apps that depend on third-party REST APIs frequently break when users have poor network connections, travel on airplanes, or when the external API rate-limits or goes down.

#### Decision
Calculate all prayer times client-side using the `adhan` library (Batoul Apps). Using the user's GPS coordinates or selected city, solar coordinates and astronomical twilight angles are computed instantly on-device with zero network latency and 100% offline availability. Support standard calculation authorities (Muslim World League, ISNA, Egypt, Umm al-Qura, Karachi) and Asr juristic methods (Shafi/Hanafi).

---

### [DEC-003] Cross-Platform Distribution via Next.js Static Export & Capacitor

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #frontend #nextjs #mobile #capacitor

#### Context & Problem Statement
The app must run as an installable native mobile app on Android and iOS while also remaining accessible as a responsive Web App / PWA.

#### Decision
Develop the application with Next.js 15 (React 19, Tailwind CSS) configured with `output: 'export'` for full static HTML/JS/CSS generation. Wrap the static bundle using **Capacitor 8** for Android APK and iOS deployment.

---

### [DEC-004] Geodesic Bearing & Device Sensor Orientation for Qibla Compass

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #sensors #math #ux

#### Context & Problem Statement
Determining the exact Qibla direction requires calculating the great-circle bearing from the user's coordinates to the Kaaba in Makkah (`21.422487° N, 39.826206° E`) and rotating the compass dynamically relative to True North or Magnetic North.

#### Decision
1. Compute the forward azimuth bearing $\theta$ using the spherical trigonometry formula:
   $$\theta = \text{atan2}(\sin(\Delta\lambda)\cos(\phi_2), \cos(\phi_1)\sin(\phi_2) - \sin(\phi_1)\cos(\phi_2)\cos(\Delta\lambda))$$
2. Listen to `window.addEventListener('deviceorientation', ...)` on mobile devices for real-time heading.
3. Fallback gracefully on desktop or non-sensor devices to an interactive 360° manual dial with degree alignment.
4. Trigger haptic feedback (`navigator.vibrate`) when the device is aligned within $\pm 3^\circ$ of the Qibla.

---

### [DEC-005] Local Data Architecture for Quran, Adhkar, and Tasbih Persistence

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #storage #offline #persistence

#### Context & Problem Statement
Quran texts, English translations, and authentic Adhkar must be instantly accessible without requiring the user to wait for downloads. User preferences (calculation methods, last read Ayah, Tasbih counts) must persist.

#### Decision
1. Bundle Quran Surah metadata, Arabic Uthmani text, and English translations directly in client-side JSON / typed data structures.
2. Stream audio recitations on-demand from reliable CDNs (EveryAyah / Quran.com API) with local caching.
3. Store user state (bookmarks, last read Surah/Ayah, Tasbih counters, custom locations) in `localStorage` with reactive React state hooks.

---

### [DEC-006] Android Java 21 Build Environment & Native APK Assembly

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #android #gradle #jdk21 #mobile

#### Context & Problem Statement
Capacitor 8 with modern Android Gradle Plugin 8.7+ mandates Java 21. System default environment variables pointed to Java 17, which failed Gradle daemon checks.

#### Decision
Point Gradle build processes to Android Studio's bundled JetBrains Runtime (`C:\Program Files\Android\Android Studio\jbr`, OpenJDK 21.0.9). Set up local properties pointing to Android SDK (`C:/Users/HP/AppData/Local/Android/Sdk`). Successfully assembled installable debug APK (`noor-companion-debug.apk`, 4.7MB) in the project root.

---

### [DEC-007] Web Audio Synthesized Tactile Feedback & Haptic Vibrate Integration

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #audio #webaudio #haptics #ux

#### Context & Problem Statement
For the Digital Tasbih and Adhkar repetition counters, users need immediate tactile and auditory feedback upon tapping, similar to a physical mechanical tally counter. Loading external MP3 files for every single tap introduces network reliance, latency, and memory overhead.

#### Decision
Utilize the Web Audio API (`AudioContext`) with an in-memory oscillator synthesizing a high-frequency decaying click (600Hz sine wave, 50ms exponential drop-off) combined with the device Haptic Vibration API (`navigator.vibrate(35)` on count, `[80, 50, 80]` on target goal reached). This ensures 100% offline, zero-latency tactile feedback on both mobile and web.

---

### [DEC-008] PostCSS & Tailwind v4 Integration Fix for Next.js

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #css #tailwind #postcss #bugfix

#### Context & Problem Statement
In Next.js with `@tailwindcss/turbopack`, the `@import "tailwindcss"` directive was not automatically processed during development/export, leaving the rendered page as completely unstyled plain HTML (observed in user screenshot `Screenshot (574).png`).

#### Decision
Installed `@tailwindcss/postcss` and `postcss`, configured `postcss.config.mjs`, and cleaned `globals.css`. Verified compiled CSS size increased from 5.4KB (fonts only) to 73.4KB (full Tailwind utility bundle). Re-exported static bundle and re-synced Capacitor Android and iOS builds.

---

### [DEC-009] Multi-Reciter Quran, Multi-Language Translations & Native Background Alarms Architecture

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #quran #reciters #translations #notifications #alarms

#### Context & Problem Statement
Users require the ability to listen to their preferred world-renowned Qaris (e.g. Mishary Alafasy, AbdulBaset, Maher Al-Muaiqly, Husary, Saad Al-Ghamdi, Shatri) and read translations in their native tongue (English, Urdu, Indonesian, French, Turkish, Spanish). Furthermore, users need scheduled background notifications for each prayer time and daily morning/evening Adhkar.

#### Decision
1. Integrated multi-reciter CDN streaming routing across 6 prominent Qaris with per-Surah audio streaming.
2. Implemented multi-language translation selector dynamically loading Saheeh International (EN), Fateh Muhammad Jalandhry (UR), Bahasa Indonesia (ID), Muhammad Hamidullah (FR), Diyanet (TR), and Raul Gonzalez Bornez (ES).
3. Integrated `@capacitor/local-notifications` for native Android/iOS background exact alarm scheduling and the Web Notification API for desktop browsers.
4. Added an interactive Notifications/Alarms tab in Settings with granular toggles for individual prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) and Morning/Evening Adhkar.
5. Resolved Kotlin Gradle Plugin compatibility by configuring Kotlin 2.1.20 in root Gradle configuration.

---

### [DEC-010] Ayah Emphasis UX & Additional Qaris (Ali Jaber, Abdur-Rahman Al-Hudhaify)

- **Date:** 2026-10-12
- **Status:** Accepted
- **Deciders:** User & Antigravity
- **Tags:** #quran #audio #ux #reciters #accessibility

#### Context & Problem Statement
When listening to audio recitations or reading along with Surahs, users can easily lose track of the specific verse being recited without clear visual cues and automated viewport synchronization. Additionally, users explicitly requested adding two revered Haramain reciters: Sheikh Ali Jaber (late Imam of Masjid al-Haram, Makkah) and Sheikh Ali Abdur-Rahman Al-Hudhaify (Imam of Al-Masjid an-Nabawi, Madinah).

#### Decision
1. **Interactive Ayah Emphasis UX:**
   - **Visual Distinction:** Added prominent highlighted card state with emerald border glow (`ring-2 ring-emerald-500/60 shadow-2xl scale-[1.01]`), softly tinted background, and elevated z-index.
   - **Reciting Audio Waveform Badge:** Displayed an active equalizer pill (`Reciting Now • يُتلى الآن`) with dynamic animated bouncing audio bars during playback.
   - **Continuous Auto-Scroll:** Synchronized smooth viewport centering (`scrollIntoView({ behavior: 'smooth', block: 'center' })`) whenever the active Ayah changes, ensuring hands-free following.
   - **Seamless Auto-Advance:** Programmed sequential playback transitioning smoothly to the next verse upon audio end.
   - **Click-to-Focus Mode:** Enabled one-click visual focus on any verse during quiet reading without triggering audio.
2. **Qari Expansion:**
   - Added Sheikh Ali Jaber (`ali_jaber`) routed via MP3Quran server11 (`a_jbr`) and EveryAyah (`Ali_Jaber_64kbps`).
   - Added Sheikh Ali Abdur-Rahman Al-Hudhaify (`hudhaify`) routed via MP3Quran server9 (`hthfi`) and EveryAyah (`Hudhaify_128kbps`).
   - Tested and verified HTTP 200 availability for all stream endpoints across both full Surah and verse-by-verse modes.

#### Alternatives Considered
| Alternative | Pros | Cons | Why Rejected |
| :--- | :--- | :--- | :--- |
| **Full Surah Only Highlighting** | Simpler code | Cannot highlight individual verses dynamically | Does not satisfy verse-level emphasis request |
| **Third-party Heavy Quran Widget** | Ready-made features | Incompatible with offline architecture, bloats bundle | Custom implementation is lightweight, fast, and offline-compatible |
| **EveryAyah CDN + MP3Quran Fallback** | 100% verse and Surah fidelity | Requires dual-URL mapping | Selected; ensures high availability and precise verse audio |

#### Consequences & Trade-offs
- **Positive:** Greatly elevated reading and listening experience, effortless tracking for memorizers (Huffadh) and learners, broadens reciter diversity with two deeply beloved Haramain Imams.
- **Negative / Risks:** Verse-level audio relies on network availability unless pre-cached; auto-scrolling requires viewport bounds checking to prevent jarring shifts.

#### Relevant Files & Components
- [`src/components/QuranReader.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/QuranReader.tsx)
- [`src/data/quranData.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/data/quranData.ts)
