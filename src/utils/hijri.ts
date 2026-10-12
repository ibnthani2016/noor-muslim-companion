import { IslamicEvent } from "@/types";

export interface HijriDateInfo {
  day: number;
  month: number;
  monthIndex: number; // 1-12
  monthName: string;
  monthNameEn: string;
  monthArabic: string;
  monthNameAr: string;
  year: number;
  formattedEn: string;
  formattedAr: string;
}

export const HIJRI_MONTHS = [
  { index: 1, en: "Muharram", ar: "مُحَرَّم" },
  { index: 2, en: "Safar", ar: "صَفَر" },
  { index: 3, en: "Rabi' al-Awwal", ar: "رَبِيع الأَوَّل" },
  { index: 4, en: "Rabi' al-Thani", ar: "رَبِيع الآخِر" },
  { index: 5, en: "Jumada al-Ula", ar: "جُمَادَى الأُولَى" },
  { index: 6, en: "Jumada al-Akhirah", ar: "جُمَادَى الآخِرَة" },
  { index: 7, en: "Rajab", ar: "رَجَب" },
  { index: 8, en: "Sha'ban", ar: "شَعْبَان" },
  { index: 9, en: "Ramadan", ar: "رَمَضَان" },
  { index: 10, en: "Shawwal", ar: "شَوَّال" },
  { index: 11, en: "Dhul-Qi'dah", ar: "ذُو القَعْدَة" },
  { index: 12, en: "Dhul-Hijjah", ar: "ذُو الحِجَّة" },
];

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    title: "Islamic New Year",
    arabicTitle: "رأس السنة الهجرية",
    hijriDay: 1,
    hijriMonth: 1,
    hijriMonthName: "Muharram",
    description: "Start of the Hijri year (1 Muharram), commemorating the Prophet's migration (Hijrah).",
  },
  {
    title: "Day of Ashura",
    arabicTitle: "يوم عاشوراء",
    hijriDay: 10,
    hijriMonth: 1,
    hijriMonthName: "Muharram",
    description: "Sunnah fast commemorating Prophet Musa's (Moses) deliverance from Pharaoh.",
  },
  {
    title: "Mawlid an-Nabi",
    arabicTitle: "المولد النبوي الشريف",
    hijriDay: 12,
    hijriMonth: 3,
    hijriMonthName: "Rabi' al-Awwal",
    description: "Birth of Prophet Muhammad (peace and blessings be upon him).",
  },
  {
    title: "Isra and Mi'raj",
    arabicTitle: "الإسراء والمعراج",
    hijriDay: 27,
    hijriMonth: 7,
    hijriMonthName: "Rajab",
    description: "The miraculous Night Journey to Al-Aqsa and Ascension through the heavens.",
  },
  {
    title: "Mid-Sha'ban",
    arabicTitle: "ليلة النصف من شعبان",
    hijriDay: 15,
    hijriMonth: 8,
    hijriMonthName: "Sha'ban",
    description: "Night of forgiveness preceding the blessed month of Ramadan.",
  },
  {
    title: "First Day of Ramadan",
    arabicTitle: "أول أيام شهر رمضان المبارك",
    hijriDay: 1,
    hijriMonth: 9,
    hijriMonthName: "Ramadan",
    description: "Beginning of the holy month of fasting, prayer, and Quran revelation.",
  },
  {
    title: "Laylat al-Qadr (Expected)",
    arabicTitle: "ليلة القدر المباركة",
    hijriDay: 27,
    hijriMonth: 9,
    hijriMonthName: "Ramadan",
    description: "The Night of Decree, better than a thousand months of worship.",
  },
  {
    title: "Eid al-Fitr",
    arabicTitle: "عيد الفطر المبارك",
    hijriDay: 1,
    hijriMonth: 10,
    hijriMonthName: "Shawwal",
    description: "Joyful celebration of completing Ramadan's month of fasting and charity.",
  },
  {
    title: "Day of Arafah",
    arabicTitle: "يوم عرفة",
    hijriDay: 9,
    hijriMonth: 12,
    hijriMonthName: "Dhul-Hijjah",
    description: "The pinnacle day of the Hajj pilgrimage; immense reward for fasting for non-pilgrims.",
  },
  {
    title: "Eid al-Adha",
    arabicTitle: "عيد الأضحى المبارك",
    hijriDay: 10,
    hijriMonth: 12,
    hijriMonthName: "Dhul-Hijjah",
    description: "Feast of the Sacrifice commemorating Prophet Ibrahim's devotion to Allah.",
  },
];

/**
 * Converts a Gregorian date to Hijri with optional day adjustment for local moon sightings.
 */
export function getHijriDate(date: Date = new Date(), dayAdjustment = 0): HijriDateInfo {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + dayAdjustment);

  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    const parts = formatter.formatToParts(adjustedDate);
    const day = parseInt(parts.find((p) => p.type === "day")?.value || "1", 10);
    const month = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10);
    const year = parseInt(parts.find((p) => p.type === "year")?.value || "1448", 10);

    const monthObj = HIJRI_MONTHS.find((m) => m.index === month) || HIJRI_MONTHS[0];

    const formatterAr = new Intl.DateTimeFormat("ar-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      day,
      month,
      monthIndex: month,
      monthName: monthObj.en,
      monthNameEn: monthObj.en,
      monthArabic: monthObj.ar,
      monthNameAr: monthObj.ar,
      year,
      formattedEn: `${day} ${monthObj.en} ${year} AH`,
      formattedAr: formatterAr.format(adjustedDate),
    };
  } catch (err) {
    console.warn("Intl islamic-umalqura format fallback:", err);
    return {
      day: 24,
      month: 3,
      monthIndex: 3,
      monthName: "Rabi' al-Awwal",
      monthNameEn: "Rabi' al-Awwal",
      monthArabic: "رَبِيع الأَوَّل",
      monthNameAr: "رَبِيع الأَوَّل",
      year: 1448,
      formattedEn: "24 Rabi' al-Awwal 1448 AH",
      formattedAr: "٢٤ ربيع الأول ١٤٤٨ هـ",
    };
  }
}

export const getHijriDateDetails = getHijriDate;

export function formatHijriDate(date: Date = new Date(), dayAdjustment = 0): string {
  const info = getHijriDate(date, dayAdjustment);
  return info.formattedEn;
}
