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
