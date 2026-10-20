export interface LocationCoords {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export type CalculationMethodKey =
  | "MuslimWorldLeague"
  | "ISNA"
  | "Egyptian"
  | "UmmAlQura"
  | "Karachi"
  | "Dubai"
  | "Qatar"
  | "Kuwait"
  | "Singapore"
  | "NorthAmerica";

export type MadhabKey = "shafi" | "hanafi";

export interface PrayerTimeItem {
  id: "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
  name: string;
  arabicName: string;
  time: Date;
  formattedTime: string;
  isNext: boolean;
  isPast: boolean;
}

export interface SurahMeta {
  number: number;
  name: string;
  transliteration: string;
  translation: string;
  totalAyahs: number;
  type: "Meccan" | "Medinan";
  juz: number;
}

export interface AyahItem {
  number: number;
  numberInSurah: number;
  textArabic: string;
  textEnglish: string;
  audioUrl?: string;
}

export interface SurahDetail extends SurahMeta {
  ayahs: AyahItem[];
}

export interface DhikrItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  benefit: string;
  targetCount: number;
  currentCount?: number;
}

export interface IslamicEvent {
  title: string;
  arabicTitle: string;
  hijriDay: number;
  hijriMonth: number;
  hijriMonthName: string;
  description: string;
}

export type ArabicFontId = "uthmani" | "amiri" | "naskh" | "nastaliq" | "cairo";
export type ArabicScriptType = "quran-uthmani" | "quran-simple";
export type ArabicFontSize = "normal" | "large" | "xl" | "2xl";

export interface ArabicFontOption {
  id: ArabicFontId;
  name: string;
  arabicName: string;
  fontFamilyClass: string;
  description: string;
}

// Ramadan & Fasting Types
export interface RamadanDua {
  id: string;
  category: "iftar" | "suhoor" | "general" | "laylatul_qadr";
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
}

export interface FastingDayLog {
  date: string; // YYYY-MM-DD
  fasted: boolean;
  taraweehCompleted?: boolean;
  notes?: string;
}

// Quran Khatmah & Hifz Looper Types
export interface KhatmahProgress {
  targetDays: number;
  completedJuz: number[]; // 1 to 30
  startDate: string;
  completedSurahs: number[]; // 1 to 114
}

export interface HifzLooperSettings {
  enabled: boolean;
  repeatCount: number; // 1, 3, 5, 10, or 99 for infinite
  pauseSeconds: number; // delay between loops
  currentLoop: number;
}

// Card Studio Types
export type CardPalette = "emerald" | "gold" | "indigo" | "crimson" | "sand";

export interface CardTemplate {
  id: string;
  category: "ramadan" | "ayah" | "dhikr" | "jummah" | "meme";
  title: string;
  arabicText: string;
  englishText: string;
  attribution: string;
  palette: CardPalette;
}

// Media Hub Types
export type MediaCategory = "all" | "ramadan" | "tafseer" | "lectures" | "nasheeds" | "family";

export interface MediaItem {
  id: string;
  title: string;
  speakerOrArtist: string;
  category: MediaCategory;
  duration: string;
  youtubeId?: string;
  audioUrl?: string;
  thumbnailUrl: string;
  description: string;
  isFeatured?: boolean;
}

// App Theme & Prayer Fine-Tuning Types
export type AppTheme = "emerald-dark" | "oled-black" | "sepia";

export type HighLatitudeRuleKey = "MiddleOfTheNight" | "SeventhOfTheNight" | "TwilightAngle";

export interface PrayerOffsets {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export type SalahStatus = "unlogged" | "on-time" | "jamaah" | "late" | "qaza";

export interface DailySalahRecord {
  fajr: SalahStatus;
  dhuhr: SalahStatus;
  asr: SalahStatus;
  maghrib: SalahStatus;
  isha: SalahStatus;
  excused?: boolean;
}

// Quran Reading & Bookmarking Types
export type QuranReadingMode = "cards" | "mushaf";

export interface QuranBookmark {
  surahNumber: number;
  surahName: string;
  surahArabic?: string;
  ayahNumber: number;
  textPreview?: string;
  timestamp: number;
}


