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
- **[DEC-011]** Dual Ali Jaber Recitation Editions & Catalog Expansion (Sudais & Shuraim)
- **[DEC-012]** Client-Side Hydration Stabilization & Device Clock Mounting Guard
- **[DEC-013]** Interactive Arabic Typography & Quranic Script Customizer
- **[DEC-014]** Synchronized Audio Recitation & Written Quran Text Alignment
- **[DEC-015]** Seamless Mid-Recitation Reciter Switching
- **[DEC-016]** Offline Quran Audio Recitations via Browser Cache Storage API
- **[DEC-017]** Cross-Surah Continuous Recitation, Per-Ayah Infinite Loop, and Background Lockscreen Audio (Web Media Session API)
- **[DEC-018]** Opening Bismillah (Ayah 0) Audio Recitation Across All Quranic Surahs

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

---

### [DEC-011] Reciter Expansion: Sheikh Abdur-Rahman Al-Sudais & Sheikh Saud Al-Shuraim

- **Date:** 2026-10-13
- **Status:** Accepted & Implemented
- **Author:** Noor Companion Engineering Team

#### Context & Problem Statement
Users requested expanding the available Qaris in the Quran Reader to include world-renowned Imams of the Grand Mosque in Makkah (Masjid al-Haram): Sheikh Abdur-Rahman Al-Sudais and Sheikh Saud Al-Shuraim. In addition, comparative evaluation was requested for alternative recitation styles of Sheikh Ali Jaber (e.g. historical live Taraweeh from Masjid al-Haram vs. studio Murattal).

#### Decision Details
1. **Catalog Addition:**
   - Added Sheikh Abdur-Rahman Al-Sudais (`sudais`): Full Surah via MP3Quran server11 (`sds`) and verse-by-verse via EveryAyah (`Abdurrahmaan_As-Sudais_192kbps`).
   - Added Sheikh Saud Al-Shuraim (`shuraim`): Full Surah via MP3Quran server7 (`shur`) and verse-by-verse via EveryAyah (`Saood_ash-Shuraym_128kbps`).
   - Added quick in-reader reciter dropdown selector within the active Surah modal header so users can change reciters seamlessly on the fly.
   - Verified and resolved EveryAyah directory slug for Sheikh Abu Bakr Al-Shatri (`Abu_Bakr_Ash-Shaatree_128kbps`).
2. **Dual Ali Jaber Recitation Implementation (Option 3):**
   - Retained `ali_jaber` as `Ali Jaber (Studio)` (`علي جابر (استوديو)`) mapped to MP3Quran server11 (`a_jbr`) and EveryAyah (`Ali_Jaber_64kbps`).
   - Added `ali_jaber_haram` as `Ali Jaber (Haram Taraweeh)` (`علي جابر (تراويح الحرم)`) mapped to the complete 114-Surah archive at `https://archive.org/download/ali-jaber_202205/` with EveryAyah fallback for verse audio.
   - Updated the active reader Play Surah button to dynamically distinguish between `Ali Jaber (Haram)` and Studio playback.

#### Relevant Files & Components
- [`src/data/quranData.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/data/quranData.ts)
- [`src/components/QuranReader.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/QuranReader.tsx)

---

### [DEC-012] Next.js SSR Hydration Mismatch Elimination

- **Date:** 2026-10-13
- **Status:** Accepted & Implemented
- **Author:** Noor Companion Engineering Team

#### Context & Problem Statement
In Next.js development mode, the client displayed a "Recoverable Error: Hydration failed because the server rendered text didn't match the client" overlay. This occurs when server-side rendered HTML (using build/server time, default fallback settings, and UTC/server locale) diverges from client browser execution (device time with live ticking seconds, client-side localStorage preferences, and browser locale date strings).

#### Decision Details
1. **Mounting Guard Pattern:**
   - Introduced an `isMounted` state lifecycle in [`src/app/page.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/app/page.tsx) that serves a deterministic lightweight loading shell during SSR.
   - The full interactive client state (with local device clock, GPS, and localStorage settings) renders immediately upon client hydration.
2. **Hydration Attribute Suppression:**
   - Added `suppressHydrationWarning` to `<html>` and `<body>` in [`src/app/layout.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/app/layout.tsx) to prevent browser extension attribute injection warnings.
   - Added `suppressHydrationWarning` to the dynamic countdown timer (`timeRemaining`) and scheduled prayer time in [`src/components/PrayerTimes.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/PrayerTimes.tsx), the Gregorian date string in [`src/components/HijriCalendar.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/HijriCalendar.tsx), and the header Hijri date in [`src/components/Navbar.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/Navbar.tsx).

#### Consequences & Trade-offs
- **Positive:** Complete elimination of Next.js hydration error overlays and smooth, glitch-free initial page loading across all browsers and devices.
- **Negative:** None; standard best practice for client-first PWAs and Capacitor hybrid apps.

#### Relevant Files & Components
- [`src/app/layout.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/app/layout.tsx)
- [`src/app/page.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/app/page.tsx)
- [`src/components/Navbar.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/Navbar.tsx)
- [`src/components/PrayerTimes.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/PrayerTimes.tsx)
- [`src/components/HijriCalendar.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/HijriCalendar.tsx)

---

### [DEC-013] Interactive Arabic Typography & Quranic Script Customizer

- **Date:** 2026-10-13
- **Status:** Accepted & Implemented
- **Author:** Noor Companion Engineering Team

#### Context & Problem Statement
Users requested exploring and customizing different Arabic writing options in the browser. Reading the Holy Quran requires flexibility across diverse typographic traditions (Medina Mushaf printing, classical Egyptian Bulaq Naskh, Indo-Pak / Nastaliq script, clean modern digital fonts) as well as orthographic preferences (traditional Uthmani with Tajweed markers vs. clean standardized spelling) and dynamic font sizing.

#### Decision Details
1. **Google Fonts Typography Suite:**
   - Imported 5 world-class Arabic web font families:
     - `Scheherazade New` (Madani Mushaf / King Fahd Complex printing aesthetic)
     - `Amiri` (Classical Bulaq Egyptian Naskh)
     - `Noto Naskh Arabic` (Google's crisp, ultra-legible digital Naskh)
     - `Noto Nastaliq Urdu` (South Asian cascading Nastaliq calligraphy)
     - `Cairo` (Modern geometric contemporary Arabic)
2. **Quranic Script Orthography Integration:**
   - Integrated dual text editions via Al-Quran Cloud API:
     - `quran-uthmani` (Traditional Quranic orthography with dagger alifs, waslah, and Tajweed signs)
     - `quran-simple` (Standardized modern Arabic spelling for effortless reading)
3. **Interactive In-Browser Customizer Modal:**
   - Added interactive `Arabic Style` triggers on the Quran toolbar and inside the active Surah reader modal.
   - Built a dedicated modal with:
     - Real-time live verse preview card (*Bismillah* & *Al-Hamd*) rendered dynamically in the chosen font, size, and script.
     - 5 calligraphy cards with native Arabic previews.
     - Dual script radio cards.
     - 4 font size scaling pills (`Normal (24px)`, `Large (30px)`, `Extra Large (36px)`, `Huge (44px)`).
     - Persistent `localStorage` state (`noor_arabic_font`, `noor_arabic_script`, `noor_arabic_size`).

#### Consequences & Trade-offs
- **Positive:** Greatly elevates the spiritual, visual, and accessibility experience for users worldwide from diverse linguistic backgrounds (Arab, South Asian, Western converts).
- **Negative:** Additional web fonts loaded on demand via Google Fonts CDN; cached efficiently across sessions.

#### Relevant Files & Components
- [`src/app/layout.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/app/layout.tsx)
- [`src/app/globals.css`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/app/globals.css)
- [`src/types/index.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/types/index.ts)
- [`src/data/quranData.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/data/quranData.ts)
- [`src/components/QuranReader.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/QuranReader.tsx)



---

### [DEC-014] Synchronized Audio Recitation & Written Quran Text Alignment

- **Date:** 2026-10-13
- **Status:** Accepted & Implemented
- **Author:** Noor Companion Engineering Team
- **Tags:** #quran #audio #synchronization #ux #accessibility

#### Context & Problem Statement
Previously, the "Play Surah" action streamed an unsegmented monolithic MP3 file from MP3Quran/Archive.org. Because whole-chapter files lack verse boundary metadata, `activeAyahNumber` remained static, preventing the app from tracking the reciter or highlighting verses in real-time. Users could not easily follow along, memorize, or read hands-free while listening to the recitation.

#### Decision Details
1. **Segmented Verse-by-Verse Playback Engine:**
   - Unified recitation playback using EveryAyah CDN URLs (`getAyahAudioUrl(surahNumber, ayahNumber, reciterId)`), enabling 100% deterministic verse tracking across all 11 Qaris (Alafasy, Sudais, Shuraim, Ali Jaber Studio/Haram, AbdulBasit, Maher Al-Muaiqly, Husary, Hudhaify, Ghamdi, Shatri).
2. **Visual Verse Highlighting & Live Equalizer:**
   - Active reciting Ayah cards receive an emerald glow halo (`border-emerald-400 ring-2 ring-emerald-500/60 shadow-2xl`), high-contrast illuminated Arabic typography, and a prominent badge with animated bouncing equalizer bars (`Reciting Now • يُتلى الآن`).
3. **Hands-Free Smooth Auto-Scroll & Auto-Centering:**
   - Reactive `useEffect` automatically centers the viewport on `ayah-{activeAyahNumber}` using `scrollIntoView({ behavior: 'smooth', block: 'center' })`.
   - Added user toggle (`isAutoScrollEnabled`) via both the top bar and docked player so readers can switch between automatic hands-free scrolling and manual exploration at will.
4. **Persistent MediaElement & Browser Autoplay Preservation:**
   - Instead of instantiating `new Audio()` on every verse (which gets blocked by Chromium/WebKit autoplay policies during asynchronous `onended` events), a single persistent `HTMLAudioElement` is reused via `audioRef.current`.
   - React ref mirrors (`isContinuousPlayRef`, `surahDetailRef`, `activeAyahNumberRef`, `playbackSpeedRef`) prevent stale closures so that `audio.onended` seamlessly advances to verse $N+1$ without interruption.
5. **Zero-Latency HTTP Cache Prefetching:**
   - Instantiates a secondary preload element (`nextAudioPreloadRef.current.src = nextUrl; nextAudioPreloadRef.current.preload = "auto"`) for Ayah $N+1$ so the browser HTTP cache serves the audio instantaneously upon verse advance.
6. **Docked Sticky Audio Player Controller:**
   - Pinned a sleek glassmorphic audio control console to the bottom of the Quran reader modal:
     - Real-time time progress (`currentTime / duration`) and micro progress bar.
     - Skip Previous Verse & Skip Next Verse buttons.
     - Glowing Play/Pause circle with state persistence.
     - Auto-advance (continuous reading) toggle with active ON/OFF badge and `localStorage` persistence.
     - Auto-center toggle with `Eye` icon indicator.
     - Playback speed controller (`0.75x`, `1.0x`, `1.25x`, `1.5x`) dynamically updating `audio.playbackRate`.

#### Consequences & Trade-offs
- **Positive:** Creates an immersive, synchronized recitation and reading experience ideal for daily tilawah, memorization (hifz), and non-native Arabic speakers learning pronunciation.
- **Negative:** Requires internet connection to fetch individual EveryAyah audio files when outside the offline-bundled Surahs (Surah 1, 103, 108, 112, 113, 114).

#### Relevant Files & Components
- [`src/components/QuranReader.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/QuranReader.tsx)
- [`src/data/quranData.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/data/quranData.ts)
---

### [DEC-015] Seamless Mid-Recitation Reciter Switching

- **Date:** 2026-10-13
- **Status:** Accepted & Implemented
- **Author:** Noor Companion Engineering Team
- **Tags:** #quran #audio #ux #reciter #seamless

#### Context & Problem Statement
Previously, selecting a different reciter triggered the Surah text fetch effect, causing an unnecessary loading spinner and resetting `activeAyahNumber` back to Verse 1. Users who wanted to compare recitation styles (e.g. comparing Sudais and Shuraim or Ali Jaber Studio vs. Haram) could not switch reciters mid-recitation without losing their place.

#### Decision Details
1. **Decouple Reciter from Surah Text Lifecycle:**
   - Removed `selectedReciterId` from the `fetchSurahDetail` effect dependency array. Because written text and translation do not vary by reciter, no network re-fetch of text is required.
2. **Graceful Completion of Current Verse & Queued Next-Verse Transition:**
   - In `handleReciterChange`, when a user selects a different reciter mid-recitation, the currently playing verse is allowed to conclude naturally without abrupt cutoff.
   - The audio engine immediately prebuffers verse $N+1$ (`nextAudioPreloadRef`) using the newly selected reciter.
   - A floating status pill appears above the bottom player bar (`Sheikh [Name] begins on Verse [N+1]`), confirming the queued transition.
   - Once verse $N$ ends, verse $N+1$ starts seamlessly with the new Sheikh's voice.
   - If audio is paused or stopped, the new reciter applies immediately to the active verse.
3. **Ubiquitous In-Player Switcher:**
   - Embedded an interactive reciter selector directly into the sticky bottom audio player console (alongside the header dropdown), enabling one-tap Sheikh switching on both mobile and desktop while listening.

#### Consequences & Trade-offs
- **Positive:** Users can dynamically compare and switch between any of the 11 Qaris in real-time mid-recitation with zero screen flicker, zero loading delays, and zero lost progress.
- **Negative:** None.

#### Relevant Files & Components
- [`src/components/QuranReader.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/QuranReader.tsx)

---

### [DEC-016] Offline Quran Audio Recitations via Browser Cache Storage API

- **Date:** 2026-10-13
- **Status:** Accepted & Implemented
- **Author:** Noor Companion Engineering Team
- **Tags:** #quran #audio #offline #pwa #cache-storage #storage-management

#### Context & Problem Statement
Quran audio recitations were previously streamed online verse-by-verse from EveryAyah CDN. Users commuting, traveling, on flights, or in areas with intermittent connectivity requested the ability to save recitation audio locally to their device for 100% offline playback with zero data consumption.

#### Decision Details
1. **Native Browser Cache Storage API Engine (`src/utils/audioCache.ts`):**
   - Utilizes standard Web `Cache` API (`noor-quran-audio-v1`), supported natively across all modern desktop browsers, mobile browsers (iOS Safari, Android Chrome), PWAs, and Capacitor WebViews without external plugins or storage size artificial limits.
   - Converts stored MP3 HTTP responses to Blob Object URLs (`URL.createObjectURL(blob)`), enabling native `<audio>` elements to seek, play, and loop without network access.
2. **Batch Downloader with Throttled Concurrency:**
   - Implemented `downloadSurahAudio(surahNumber, totalAyahs, reciterId, onProgress)` with parallel batching (concurrency of 3) to prevent browser connection throttling while completing typical Surahs in 1–3 seconds.
   - Provides live completion callbacks (`completed / total` and integer percentage) for real-time UI indicators.
3. **Offline-First Playback Lifecycle:**
   - In `playSynchronizedAyah`, the player resolves `getOfflineAudioUrl(currentUrl)` prior to loading. If cached, the local Blob URL is used with 0 network calls.
   - If not cached and online, the player streams the verse while silently executing `cacheAudioUrl(currentUrl)` in the background ("Smart Auto-Cache on Play"), ensuring frequently recited verses automatically become offline-ready.
   - Preloader (`nextAudioPreloadRef`) similarly resolves local cache for verse $N+1$ for instantaneous transitions.
4. **Storage Management & User Transparency:**
   - Surah Reader Top Bar features dynamic status:
     - *Saving State:* Live spinner with `Saving X%`.
     - *Saved State:* Emerald `Offline Ready` badge + single-tap delete (`Trash2`) button to reclaim device storage.
     - *Unsaved State:* `Save Offline` download button.
   - Surah Header Card includes an offline recitation banner with progress bar and Qari confirmation.
   - Surah Catalog Grid displays an `Audio Saved` badge on chapter cards when local audio exists.
   - Added `deleteSurahAudio` and `getAudioCacheStorageUsage` for transparent storage control.

#### Consequences & Trade-offs
- **Positive:** Full offline independence for Quran recitations; zero network data consumption when re-listening; seamless compatibility across mobile PWA and native hybrid wrappers.
- **Negative:** Consumes local browser cache storage (~2-5 MB per average Surah); mitigated by user-facing delete action and Surah-level granularity.

#### Relevant Files & Components
- [`src/utils/audioCache.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/utils/audioCache.ts)
- [`src/components/QuranReader.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/QuranReader.tsx)
- [`src/data/quranData.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/data/quranData.ts)

---

### [DEC-017] Cross-Surah Continuous Recitation, Per-Ayah Infinite Loop, and Background Lockscreen Audio (Web Media Session API)

- **Date:** 2026-10-13
- **Status:** Accepted & Implemented
- **Author:** Noor Companion Engineering Team
- **Tags:** #quran #audio #loop #memorization #media-session #background-playback #cross-surah

#### Context & Problem Statement
Users required three interrelated playback improvements:
1. Continuous auto-advance across chapter boundaries (when finishing Surah $N$, seamlessly load Surah $N+1$ without stopping).
2. A single-verse repeat loop on each Ayah (repeat until stopped) for Quran memorization (Hifdh).
3. Background playback when the browser tab is minimized or the device screen locks.
Comparative evaluation was performed on whether to spin off a separate memorization app or integrate these features directly into Noor Companion.

#### Decision Details
1. **Seamless Cross-Surah Continuous Flow:**
   - In `audio.onended`, when the final Ayah of Surah $N$ finishes with `isContinuousPlay` active, `advanceToNextSurah(N + 1, true)` immediately loads chapter $N+1$ and initiates recitation from Ayah 1 without stopping.
   - Surah transition notification pill (`Advancing to Surah N: [Name]`) animates above the player.
   - Added Prev/Next Surah arrow buttons in the Reader top bar and smart skip boundaries on the docked player console.
2. **Per-Ayah Infinite Loop (Memorization Drill):**
   - Added an intuitive `Repeat` button (`Repeat1` icon) on every Ayah card header.
   - When clicked on Ayah $K$, activates `loopingAyahNumber = K`. The card gains a radiant amber halo and an animated `Repeating until stopped • تكرار` badge.
   - `audio.onended` immediately replays Ayah $K$ without advancing until the user clicks to cancel.
   - Docked bottom player displays a quick-cancel pill: `Looping Verse K [x]`.
3. **Web Media Session API (`navigator.mediaSession`):**
   - Updates OS lockscreen & notification shade metadata dynamically:
     - `title`: `Surah [Transliteration] ([Arabic]) — Verse [K]`
     - `artist`: `[Qari Name] ([Arabic Name])`
     - `album`: `Noor Companion • Holy Quran`
     - `artwork`: App icon and Medina calligraphy badge.
   - Binds OS lockscreen action handlers for `play`, `pause`, `previoustrack`, and `nexttrack`.
   - Audio continues playing in background tabs and when device display locks.
4. **Architectural Unification in Noor Companion:**
   - Rejected splitting into a standalone app to prevent user context-switching, avoid duplicating offline audio cache storage, and unify reciter choices and Mushaf calligraphy styling.

#### Consequences & Trade-offs
- **Positive:** Unlocks powerful memorization and continuous Tilawah listening in a single app; full OS lockscreen media widget support on desktop and mobile.
- **Negative:** None.

#### Relevant Files & Components
- [`src/components/QuranReader.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/QuranReader.tsx)
- [`src/data/quranData.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/data/quranData.ts)

---

### [DEC-018] Opening Bismillah (Ayah 0) Audio Recitation Across All Quranic Surahs

- **Date:** 2026-10-13
- **Status:** Accepted & Implemented
- **Author:** Noor Companion Engineering Team
- **Tags:** #quran #bismillah #audio #everyayah #quran-orthography #ux

#### Context & Problem Statement
In authentic Quranic orthography (*Hafs 'an 'Asim*), Surah 1 (*Al-Fatihah*) counts the Basmalah (*Bismillahir-Rahmanir-Rahim*) as its numbered first verse (Ayah 1). In Surahs 2 through 114 (except Surah 9 *At-Tawbah*, which revealed without Bismillah), the Basmalah serves as an unnumbered opening header.
On the EveryAyah CDN audio repository, this opening Basmalah for Surahs 2–114 is stored as Ayah `000` (`[surahPadded]000.mp3`, e.g., `002000.mp3`, `067000.mp3`, `112000.mp3`).
Previously, the audio player began reciting directly at Ayah 1, omitting the opening Bismillah for all chapters except Al-Fatihah.

#### Decision Details
1. **URL Resolution & Reciter Fallbacks (`src/data/quranData.ts`):**
   - Updated `getAyahAudioUrl(surahNumber, ayahInSurah, reciterId)`:
     - When `ayahInSurah === 0`:
       - If `surahNumber === 9`, returns empty string (no Bismillah by divine revelation).
       - If `surahNumber === 1` or reciter lacks separate `000.mp3` (Husary, Ghamdi), safely fallbacks to their recorded Al-Fatihah Basmalah (`001001.mp3`).
       - For all other Surahs and reciters, requests `[surahPadded]000.mp3` from EveryAyah CDN.
2. **Synchronized Playback Engine (`src/components/QuranReader.tsx`):**
   - Bound clamping: `minAyah = (detail.number === 9 || detail.number === 1) ? 1 : 0`.
   - Initial active verse on Surah load: defaults to `startAyah = (data.number === 9 || data.number === 1) ? 1 : 0`.
   - Sequential flow: In `audio.onended`, when Ayah 0 finishes, it automatically advances to Ayah 1 without user interaction.
   - Cross-Surah transition: Transitioning to the next Surah starts recitation at Ayah 0 (or Ayah 1 for Surahs 1 and 9).
   - Stepping boundaries: `playPreviousAyah` allows stepping back to Ayah 0 before jumping to the previous Surah.
3. **Interactive Bismillah Card UI:**
   - Gave the Surah Header Bismillah card `id="ayah-0"` so auto-scroll smoothly centers on it during recitation.
   - Added interactive `Listen/Pause` and `Repeat` (`Repeat1`) buttons directly on the Bismillah card header.
   - Highlights with radiant emerald halo and animated equalizer bars (`Reciting Bismillah • يُتلى البسملة`) when active.
   - Styled calligraphy using user-selected Arabic font and orthographic script (Uthmani vs IndoPak/Standard).
4. **Docked Console & OS MediaSession Integration:**
   - Bottom floating player bar displays `Bismillah • Opening` badge instead of `Verse 0 of X`.
   - System lockscreen and notification widget display `Surah [Name] — Bismillah (Opening)`.
5. **Offline Storage Engine (`src/utils/audioCache.ts`):**
   - Surah offline caching now includes Ayah 0 for eligible Surahs (`surahNumber !== 9 && surahNumber !== 1`), caching $N + 1$ audio files so Bismillah plays completely offline.

#### Consequences & Trade-offs
- **Positive:** Faithful adherence to Islamic recitation tradition and EveryAyah audio standards; fluid transition from opening invocation into the first verse; interactive controls for memorizing the Basmalah.
- **Negative:** None.

#### Relevant Files & Components
- [`src/components/QuranReader.tsx`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/components/QuranReader.tsx)
- [`src/data/quranData.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/data/quranData.ts)
- [`src/utils/audioCache.ts`](file:///C:/Users/HP/.gemini/antigravity/scratch/muslim-companion/src/utils/audioCache.ts)



