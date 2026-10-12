import { SurahMeta, SurahDetail, AyahItem } from "@/types";

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, name: "الفاتحة", transliteration: "Al-Fatihah", translation: "The Opening", totalAyahs: 7, type: "Meccan", juz: 1 },
  { number: 2, name: "البقرة", transliteration: "Al-Baqarah", translation: "The Cow", totalAyahs: 286, type: "Medinan", juz: 1 },
  { number: 3, name: "آل عمران", transliteration: "Ali 'Imran", translation: "Family of Imran", totalAyahs: 200, type: "Medinan", juz: 3 },
  { number: 4, name: "النساء", transliteration: "An-Nisa", translation: "The Women", totalAyahs: 176, type: "Medinan", juz: 4 },
  { number: 5, name: "المائدة", transliteration: "Al-Ma'idah", translation: "The Table Spread", totalAyahs: 120, type: "Medinan", juz: 6 },
  { number: 6, name: "الأنعام", transliteration: "Al-An'am", translation: "The Cattle", totalAyahs: 165, type: "Meccan", juz: 7 },
  { number: 7, name: "الأعراف", transliteration: "Al-A'raf", translation: "The Heights", totalAyahs: 206, type: "Meccan", juz: 8 },
  { number: 8, name: "الأنفال", transliteration: "Al-Anfal", translation: "The Spoils of War", totalAyahs: 75, type: "Medinan", juz: 9 },
  { number: 9, name: "التوبة", transliteration: "At-Tawbah", translation: "The Repentance", totalAyahs: 129, type: "Medinan", juz: 10 },
  { number: 10, name: "يونس", transliteration: "Yunus", translation: "Jonah", totalAyahs: 109, type: "Meccan", juz: 11 },
  { number: 11, name: "هود", transliteration: "Hud", translation: "Hud", totalAyahs: 123, type: "Meccan", juz: 11 },
  { number: 12, name: "يوسف", transliteration: "Yusuf", translation: "Joseph", totalAyahs: 111, type: "Meccan", juz: 12 },
  { number: 13, name: "الرعد", transliteration: "Ar-Ra'd", translation: "The Thunder", totalAyahs: 43, type: "Medinan", juz: 13 },
  { number: 14, name: "ابراهيم", transliteration: "Ibrahim", translation: "Abraham", totalAyahs: 52, type: "Meccan", juz: 13 },
  { number: 15, name: "الحجر", transliteration: "Al-Hijr", translation: "The Rocky Tract", totalAyahs: 99, type: "Meccan", juz: 14 },
  { number: 16, name: "النحل", transliteration: "An-Nahl", translation: "The Bee", totalAyahs: 128, type: "Meccan", juz: 14 },
  { number: 17, name: "الإسراء", transliteration: "Al-Isra", translation: "The Night Journey", totalAyahs: 111, type: "Meccan", juz: 15 },
  { number: 18, name: "الكهف", transliteration: "Al-Kahf", translation: "The Cave", totalAyahs: 110, type: "Meccan", juz: 15 },
  { number: 19, name: "مريم", transliteration: "Maryam", translation: "Mary", totalAyahs: 98, type: "Meccan", juz: 16 },
  { number: 20, name: "طه", transliteration: "Taha", translation: "Ta-Ha", totalAyahs: 135, type: "Meccan", juz: 16 },
  { number: 21, name: "الأنبياء", transliteration: "Al-Anbiya", translation: "The Prophets", totalAyahs: 112, type: "Meccan", juz: 17 },
  { number: 22, name: "الحج", transliteration: "Al-Hajj", translation: "The Pilgrimage", totalAyahs: 78, type: "Medinan", juz: 17 },
  { number: 23, name: "المؤمنون", transliteration: "Al-Mu'minun", translation: "The Believers", totalAyahs: 118, type: "Meccan", juz: 18 },
  { number: 24, name: "النور", transliteration: "An-Nur", translation: "The Light", totalAyahs: 64, type: "Medinan", juz: 18 },
  { number: 25, name: "الفرقان", transliteration: "Al-Furqan", translation: "The Criterion", totalAyahs: 77, type: "Meccan", juz: 18 },
  { number: 26, name: "الشعراء", transliteration: "Ash-Shu'ara", translation: "The Poets", totalAyahs: 227, type: "Meccan", juz: 19 },
  { number: 27, name: "النمل", transliteration: "An-Naml", translation: "The Ant", totalAyahs: 93, type: "Meccan", juz: 19 },
  { number: 28, name: "القصص", transliteration: "Al-Qasas", translation: "The Stories", totalAyahs: 88, type: "Meccan", juz: 20 },
  { number: 29, name: "العنكبوت", transliteration: "Al-'Ankabut", translation: "The Spider", totalAyahs: 69, type: "Meccan", juz: 20 },
  { number: 30, name: "الروم", transliteration: "Ar-Rum", translation: "The Romans", totalAyahs: 60, type: "Meccan", juz: 21 },
  { number: 31, name: "لقمان", transliteration: "Luqman", translation: "Luqman", totalAyahs: 34, type: "Meccan", juz: 21 },
  { number: 32, name: "السجدة", transliteration: "As-Sajdah", translation: "The Prostration", totalAyahs: 30, type: "Meccan", juz: 21 },
  { number: 33, name: "الأحزاب", transliteration: "Al-Ahzab", translation: "The Combined Forces", totalAyahs: 73, type: "Medinan", juz: 21 },
  { number: 34, name: "سبإ", transliteration: "Saba", translation: "Sheba", totalAyahs: 54, type: "Meccan", juz: 22 },
  { number: 35, name: "فاطر", transliteration: "Fatir", translation: "Originator", totalAyahs: 45, type: "Meccan", juz: 22 },
  { number: 36, name: "يس", transliteration: "Ya-Sin", translation: "Ya-Sin", totalAyahs: 83, type: "Meccan", juz: 22 },
  { number: 37, name: "الصافات", transliteration: "As-Saffat", translation: "Those who set the Ranks", totalAyahs: 182, type: "Meccan", juz: 23 },
  { number: 38, name: "ص", transliteration: "Sad", translation: "The Letter 'Saad'", totalAyahs: 88, type: "Meccan", juz: 23 },
  { number: 39, name: "الزمر", transliteration: "Az-Zumar", translation: "The Troops", totalAyahs: 75, type: "Meccan", juz: 23 },
  { number: 40, name: "غافر", transliteration: "Ghafir", translation: "The Forgiver", totalAyahs: 85, type: "Meccan", juz: 24 },
  { number: 41, name: "فصلت", transliteration: "Fussilat", translation: "Explained in Detail", totalAyahs: 54, type: "Meccan", juz: 24 },
  { number: 42, name: "الشورى", transliteration: "Ash-Shura", translation: "The Consultation", totalAyahs: 53, type: "Meccan", juz: 25 },
  { number: 43, name: "الزخرف", transliteration: "Az-Zukhruf", translation: "The Ornaments of Gold", totalAyahs: 89, type: "Meccan", juz: 25 },
  { number: 44, name: "الدخان", transliteration: "Ad-Dukhan", translation: "The Smoke", totalAyahs: 59, type: "Meccan", juz: 25 },
  { number: 45, name: "الجاثية", transliteration: "Al-Jathiyah", translation: "The Crouching", totalAyahs: 37, type: "Meccan", juz: 25 },
  { number: 46, name: "الأحقاف", transliteration: "Al-Ahqaf", translation: "The Wind-Curved Sandhills", totalAyahs: 35, type: "Meccan", juz: 26 },
  { number: 47, name: "محمد", transliteration: "Muhammad", translation: "Muhammad", totalAyahs: 38, type: "Medinan", juz: 26 },
  { number: 48, name: "الفتح", transliteration: "Al-Fath", translation: "The Victory", totalAyahs: 29, type: "Medinan", juz: 26 },
  { number: 49, name: "الحجرات", transliteration: "Al-Hujurat", translation: "The Rooms", totalAyahs: 18, type: "Medinan", juz: 26 },
  { number: 50, name: "ق", transliteration: "Qaf", translation: "The Letter 'Qaf'", totalAyahs: 45, type: "Meccan", juz: 26 },
  { number: 51, name: "الذاريات", transliteration: "Adh-Dhariyat", translation: "The Winnowing Winds", totalAyahs: 60, type: "Meccan", juz: 26 },
  { number: 52, name: "الطور", transliteration: "At-Tur", translation: "The Mount", totalAyahs: 49, type: "Meccan", juz: 27 },
  { number: 53, name: "النجم", transliteration: "An-Najm", translation: "The Star", totalAyahs: 62, type: "Meccan", juz: 27 },
  { number: 54, name: "القمر", transliteration: "Al-Qamar", translation: "The Moon", totalAyahs: 55, type: "Meccan", juz: 27 },
  { number: 55, name: "الرحمن", transliteration: "Ar-Rahman", translation: "The Beneficent", totalAyahs: 78, type: "Medinan", juz: 27 },
  { number: 56, name: "الواقعة", transliteration: "Al-Waqi'ah", translation: "The Inevitable", totalAyahs: 96, type: "Meccan", juz: 27 },
  { number: 57, name: "الحديد", transliteration: "Al-Hadid", translation: "The Iron", totalAyahs: 29, type: "Medinan", juz: 27 },
  { number: 58, name: "المجادلة", transliteration: "Al-Mujadila", translation: "The Pleading Woman", totalAyahs: 22, type: "Medinan", juz: 28 },
  { number: 59, name: "الحشر", transliteration: "Al-Hashr", translation: "The Exile", totalAyahs: 24, type: "Medinan", juz: 28 },
  { number: 60, name: "الممتحنة", transliteration: "Al-Mumtahanah", translation: "She that is to be examined", totalAyahs: 13, type: "Medinan", juz: 28 },
  { number: 61, name: "الصف", transliteration: "As-Saff", translation: "The Ranks", totalAyahs: 14, type: "Medinan", juz: 28 },
  { number: 62, name: "الجمعة", transliteration: "Al-Jumu'ah", translation: "The Congregation, Friday", totalAyahs: 11, type: "Medinan", juz: 28 },
  { number: 63, name: "المنافقون", transliteration: "Al-Munafiqun", translation: "The Hypocrites", totalAyahs: 11, type: "Medinan", juz: 28 },
  { number: 64, name: "التغابن", transliteration: "At-Taghabun", translation: "The Mutual Disillusion", totalAyahs: 18, type: "Medinan", juz: 28 },
  { number: 65, name: "الطلاق", transliteration: "At-Talaq", translation: "The Divorce", totalAyahs: 12, type: "Medinan", juz: 28 },
  { number: 66, name: "التحريم", transliteration: "At-Tahrim", translation: "The Prohibition", totalAyahs: 12, type: "Medinan", juz: 28 },
  { number: 67, name: "الملك", transliteration: "Al-Mulk", translation: "The Sovereignty", totalAyahs: 30, type: "Meccan", juz: 29 },
  { number: 68, name: "القلم", transliteration: "Al-Qalam", translation: "The Pen", totalAyahs: 52, type: "Meccan", juz: 29 },
  { number: 69, name: "الحاقة", transliteration: "Al-Haqqah", translation: "The Reality", totalAyahs: 52, type: "Meccan", juz: 29 },
  { number: 70, name: "المعارج", transliteration: "Al-Ma'arij", translation: "The Ascending Stairways", totalAyahs: 44, type: "Meccan", juz: 29 },
  { number: 71, name: "نوح", transliteration: "Nuh", translation: "Noah", totalAyahs: 28, type: "Meccan", juz: 29 },
  { number: 72, name: "الجن", transliteration: "Al-Jinn", translation: "The Jinn", totalAyahs: 28, type: "Meccan", juz: 29 },
  { number: 73, name: "المزمل", transliteration: "Al-Muzzammil", translation: "The Enshrouded One", totalAyahs: 20, type: "Meccan", juz: 29 },
  { number: 74, name: "المدثر", transliteration: "Al-Muddaththir", translation: "The Cloaked One", totalAyahs: 56, type: "Meccan", juz: 29 },
  { number: 75, name: "القيامة", transliteration: "Al-Qiyamah", translation: "The Resurrection", totalAyahs: 40, type: "Meccan", juz: 29 },
  { number: 76, name: "الإنسان", transliteration: "Al-Insan", translation: "Man", totalAyahs: 31, type: "Medinan", juz: 29 },
  { number: 77, name: "المرسلات", transliteration: "Al-Mursalat", translation: "The Emissaries", totalAyahs: 50, type: "Meccan", juz: 29 },
  { number: 78, name: "النبإ", transliteration: "An-Naba", translation: "The Tidings", totalAyahs: 40, type: "Meccan", juz: 30 },
  { number: 79, name: "النازعات", transliteration: "An-Nazi'at", translation: "Those who drag forth", totalAyahs: 46, type: "Meccan", juz: 30 },
  { number: 80, name: "عبس", transliteration: "'Abasa", translation: "He Frowned", totalAyahs: 42, type: "Meccan", juz: 30 },
  { number: 81, name: "التكوير", transliteration: "At-Takwir", translation: "The Overthrowing", totalAyahs: 29, type: "Meccan", juz: 30 },
  { number: 82, name: "الانفطار", transliteration: "Al-Infitar", translation: "The Cleaving", totalAyahs: 19, type: "Meccan", juz: 30 },
  { number: 83, name: "المطففين", transliteration: "Al-Mutaffifin", translation: "The Defrauding", totalAyahs: 36, type: "Meccan", juz: 30 },
  { number: 84, name: "الانشقاق", transliteration: "Al-Inshiqaq", translation: "The Splitting Open", totalAyahs: 25, type: "Meccan", juz: 30 },
  { number: 85, name: "البروج", transliteration: "Al-Buruj", translation: "The Mansions of the Stars", totalAyahs: 22, type: "Meccan", juz: 30 },
  { number: 86, name: "الطارق", transliteration: "At-Tariq", translation: "The Morning Star", totalAyahs: 17, type: "Meccan", juz: 30 },
  { number: 87, name: "الأعلى", transliteration: "Al-A'la", translation: "The Most High", totalAyahs: 19, type: "Meccan", juz: 30 },
  { number: 88, name: "الغاشية", transliteration: "Al-Ghashiyah", translation: "The Overwhelming", totalAyahs: 26, type: "Meccan", juz: 30 },
  { number: 89, name: "الفجر", transliteration: "Al-Fajr", translation: "The Dawn", totalAyahs: 30, type: "Meccan", juz: 30 },
  { number: 90, name: "البلد", transliteration: "Al-Balad", translation: "The City", totalAyahs: 20, type: "Meccan", juz: 30 },
  { number: 91, name: "الشمس", transliteration: "Ash-Shams", translation: "The Sun", totalAyahs: 15, type: "Meccan", juz: 30 },
  { number: 92, name: "الليل", transliteration: "Al-Layl", translation: "The Night", totalAyahs: 21, type: "Meccan", juz: 30 },
  { number: 93, name: "الضحى", transliteration: "Ad-Duhaa", translation: "The Morning Hours", totalAyahs: 11, type: "Meccan", juz: 30 },
  { number: 94, name: "الشرح", transliteration: "Ash-Sharh", translation: "The Relief", totalAyahs: 8, type: "Meccan", juz: 30 },
  { number: 95, name: "التين", transliteration: "At-Tin", translation: "The Fig", totalAyahs: 8, type: "Meccan", juz: 30 },
  { number: 96, name: "العلق", transliteration: "Al-'Alaq", translation: "The Clot", totalAyahs: 19, type: "Meccan", juz: 30 },
  { number: 97, name: "القدر", transliteration: "Al-Qadr", translation: "The Power", totalAyahs: 5, type: "Meccan", juz: 30 },
  { number: 98, name: "البينة", transliteration: "Al-Bayyinah", translation: "The Clear Proof", totalAyahs: 8, type: "Medinan", juz: 30 },
  { number: 99, name: "الزلزلة", transliteration: "Az-Zalzalah", translation: "The Earthquake", totalAyahs: 8, type: "Medinan", juz: 30 },
  { number: 100, name: "العاديات", transliteration: "Al-'Adiyat", translation: "The Courser", totalAyahs: 11, type: "Meccan", juz: 30 },
  { number: 101, name: "القارعة", transliteration: "Al-Qari'ah", translation: "The Calamity", totalAyahs: 11, type: "Meccan", juz: 30 },
  { number: 102, name: "التكاثر", transliteration: "At-Takathur", translation: "The Rivalry in world increase", totalAyahs: 8, type: "Meccan", juz: 30 },
  { number: 103, name: "العصر", transliteration: "Al-'Asr", translation: "The Declining Day", totalAyahs: 3, type: "Meccan", juz: 30 },
  { number: 104, name: "الهمزة", transliteration: "Al-Humazah", translation: "The Traducer", totalAyahs: 9, type: "Meccan", juz: 30 },
  { number: 105, name: "الفيل", transliteration: "Al-Fil", translation: "The Elephant", totalAyahs: 5, type: "Meccan", juz: 30 },
  { number: 106, name: "قريش", transliteration: "Quraysh", translation: "Quraysh", totalAyahs: 4, type: "Meccan", juz: 30 },
  { number: 107, name: "الماعون", transliteration: "Al-Ma'un", translation: "The Small Kindness", totalAyahs: 7, type: "Meccan", juz: 30 },
  { number: 108, name: "الكوثر", transliteration: "Al-Kawthar", translation: "The Abundance", totalAyahs: 3, type: "Meccan", juz: 30 },
  { number: 109, name: "الكافرون", transliteration: "Al-Kafirun", translation: "The Disbelievers", totalAyahs: 6, type: "Meccan", juz: 30 },
  { number: 110, name: "النصر", transliteration: "An-Nasr", translation: "The Divine Support", totalAyahs: 3, type: "Medinan", juz: 30 },
  { number: 111, name: "المسد", transliteration: "Al-Masad", translation: "The Palm Fiber", totalAyahs: 5, type: "Meccan", juz: 30 },
  { number: 112, name: "الإخلاص", transliteration: "Al-Ikhlas", translation: "The Sincerity", totalAyahs: 4, type: "Meccan", juz: 30 },
  { number: 113, name: "الفلق", transliteration: "Al-Falaq", translation: "The Daybreak", totalAyahs: 5, type: "Meccan", juz: 30 },
  { number: 114, name: "الناس", transliteration: "An-Nas", translation: "Mankind", totalAyahs: 6, type: "Meccan", juz: 30 },
];

// Offline bundled essential Surahs
export const OFFLINE_SURAHS: Record<number, AyahItem[]> = {
  1: [
    { number: 1, numberInSurah: 1, textArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", textEnglish: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001001.mp3" },
    { number: 2, numberInSurah: 2, textArabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", textEnglish: "[All] praise is [due] to Allah, Lord of the worlds -", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001002.mp3" },
    { number: 3, numberInSurah: 3, textArabic: "الرَّحْمَٰنِ الرَّحِيمِ", textEnglish: "The Entirely Merciful, the Especially Merciful,", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001003.mp3" },
    { number: 4, numberInSurah: 4, textArabic: "مَالِكِ يَوْمِ الدِّينِ", textEnglish: "Sovereign of the Day of Recompense.", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001004.mp3" },
    { number: 5, numberInSurah: 5, textArabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", textEnglish: "It is You we worship and You we ask for help.", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001005.mp3" },
    { number: 6, numberInSurah: 6, textArabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", textEnglish: "Guide us to the straight path -", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001006.mp3" },
    { number: 7, numberInSurah: 7, textArabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", textEnglish: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/001007.mp3" },
  ],
  103: [
    { number: 6177, numberInSurah: 1, textArabic: "وَالْعَصْرِ", textEnglish: "By time,", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/103001.mp3" },
    { number: 6178, numberInSurah: 2, textArabic: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", textEnglish: "Indeed, mankind is in loss,", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/103002.mp3" },
    { number: 6179, numberInSurah: 3, textArabic: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ", textEnglish: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/103003.mp3" },
  ],
  108: [
    { number: 6194, numberInSurah: 1, textArabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", textEnglish: "Indeed, We have granted you, [O Muhammad], al-Kawthar.", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/108001.mp3" },
    { number: 6195, numberInSurah: 2, textArabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", textEnglish: "So pray to your Lord and sacrifice [to Him alone].", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/108002.mp3" },
    { number: 6196, numberInSurah: 3, textArabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ", textEnglish: "Indeed, your enemy is the one cut off.", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/108003.mp3" },
  ],
  112: [
    { number: 6222, numberInSurah: 1, textArabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", textEnglish: "Say, 'He is Allah, [who is] One,", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112001.mp3" },
    { number: 6223, numberInSurah: 2, textArabic: "اللَّهُ الصَّمَدُ", textEnglish: "Allah, the Eternal Refuge.", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112002.mp3" },
    { number: 6224, numberInSurah: 3, textArabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", textEnglish: "He neither begets nor is born,", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112003.mp3" },
    { number: 6225, numberInSurah: 4, textArabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", textEnglish: "Nor is there to Him any equivalent.'", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/112004.mp3" },
  ],
  113: [
    { number: 6226, numberInSurah: 1, textArabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", textEnglish: "Say, 'I seek refuge in the Lord of daybreak", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113001.mp3" },
    { number: 6227, numberInSurah: 2, textArabic: "مِن شَرِّ مَا خَلَقَ", textEnglish: "From the evil of that which He created", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113002.mp3" },
    { number: 6228, numberInSurah: 3, textArabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", textEnglish: "And from the evil of darkness when it settles", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113003.mp3" },
    { number: 6229, numberInSurah: 4, textArabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", textEnglish: "And from the evil of the blowers in knots", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113004.mp3" },
    { number: 6230, numberInSurah: 5, textArabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", textEnglish: "And from the evil of an envier when he envies.'", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/113005.mp3" },
  ],
  114: [
    { number: 6231, numberInSurah: 1, textArabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", textEnglish: "Say, 'I seek refuge in the Lord of mankind,", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114001.mp3" },
    { number: 6232, numberInSurah: 2, textArabic: "مَلِكِ النَّاسِ", textEnglish: "The Sovereign of mankind,", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114002.mp3" },
    { number: 6233, numberInSurah: 3, textArabic: "إِلَٰهِ النَّاسِ", textEnglish: "The God of mankind,", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114003.mp3" },
    { number: 6234, numberInSurah: 4, textArabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", textEnglish: "From the evil of the retreating whisperer -", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114004.mp3" },
    { number: 6235, numberInSurah: 5, textArabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", textEnglish: "Who whispers [evil] into the breasts of mankind -", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114005.mp3" },
    { number: 6236, numberInSurah: 6, textArabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", textEnglish: "From among the jinn and mankind.'", audioUrl: "https://everyayah.com/data/Alafasy_128kbps/114006.mp3" },
  ],
};

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  everyAyahFolder: string;
  serverUrl: (surahNumber: number) => string;
}

export const RECITERS: Reciter[] = [
  {
    id: "alafasy",
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    everyAyahFolder: "Alafasy_128kbps",
    serverUrl: (surahNumber) => `https://server8.mp3quran.net/afs/${String(surahNumber).padStart(3, "0")}.mp3`,
  },
  {
    id: "ali_jaber",
    name: "Ali Jaber",
    arabicName: "علي جابر",
    everyAyahFolder: "Ali_Jaber_64kbps",
    serverUrl: (surahNumber) => `https://server11.mp3quran.net/a_jbr/${String(surahNumber).padStart(3, "0")}.mp3`,
  },
  {
    id: "hudhaify",
    name: "Ali Abdur-Rahman Al-Hudhaify",
    arabicName: "علي عبد الرحمن الحذيفي",
    everyAyahFolder: "Hudhaify_128kbps",
    serverUrl: (surahNumber) => `https://server9.mp3quran.net/hthfi/${String(surahNumber).padStart(3, "0")}.mp3`,
  },
  {
    id: "abdulbasit",
    name: "AbdulBaset AbdulSamad",
    arabicName: "عبد الباسط عبد الصمد",
    everyAyahFolder: "Abdul_Basit_Murattal_192kbps",
    serverUrl: (surahNumber) => `https://server7.mp3quran.net/basit/${String(surahNumber).padStart(3, "0")}.mp3`,
  },
  {
    id: "maher",
    name: "Maher Al-Muaiqly",
    arabicName: "ماهر المعيقلي",
    everyAyahFolder: "Maher_AlMuaiqly_64kbps",
    serverUrl: (surahNumber) => `https://server12.mp3quran.net/maher/${String(surahNumber).padStart(3, "0")}.mp3`,
  },
  {
    id: "husary",
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    everyAyahFolder: "Husary_128kbps",
    serverUrl: (surahNumber) => `https://server13.mp3quran.net/husr/${String(surahNumber).padStart(3, "0")}.mp3`,
  },
  {
    id: "ghamdi",
    name: "Saad Al-Ghamdi",
    arabicName: "سعد الغامدي",
    everyAyahFolder: "Ghamadi_40kbps",
    serverUrl: (surahNumber) => `https://server7.mp3quran.net/s_gmd/${String(surahNumber).padStart(3, "0")}.mp3`,
  },
  {
    id: "shatri",
    name: "Abu Bakr Al-Shatri",
    arabicName: "أبو بكر الشاطري",
    everyAyahFolder: "Abu_Bakr_Ash-Shatri_128kbps",
    serverUrl: (surahNumber) => `https://server11.mp3quran.net/shatri/${String(surahNumber).padStart(3, "0")}.mp3`,
  },
];

export interface TranslationEdition {
  id: string;
  name: string;
  language: string;
  apiIdentifier: string;
}

export const TRANSLATION_EDITIONS: TranslationEdition[] = [
  { id: "en.sahih", name: "Saheeh International", language: "English", apiIdentifier: "en.sahih" },
  { id: "ur.jalandhry", name: "Fateh Muhammad Jalandhry", language: "Urdu (اردو)", apiIdentifier: "ur.jalandhry" },
  { id: "id.indonesian", name: "Bahasa Indonesia", language: "Indonesian", apiIdentifier: "id.indonesian" },
  { id: "fr.hamidullah", name: "Muhammad Hamidullah", language: "French (Français)", apiIdentifier: "fr.hamidullah" },
  { id: "tr.diyanet", name: "Diyanet İşleri", language: "Turkish (Türkçe)", apiIdentifier: "tr.diyanet" },
  { id: "es.bornez", name: "Raul Gonzalez Bornez", language: "Spanish (Español)", apiIdentifier: "es.bornez" },
];

// Full Surah Recitation Stream URL based on chosen reciter
export function getSurahAudioUrl(surahNumber: number, reciterId = "alafasy"): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  return reciter.serverUrl(surahNumber);
}

// Single Ayah Recitation Audio URL based on chosen reciter
export function getAyahAudioUrl(surahNumber: number, ayahInSurah: number, reciterId = "alafasy"): string {
  const sPadded = String(surahNumber).padStart(3, "0");
  const aPadded = String(ayahInSurah).padStart(3, "0");
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  return `https://everyayah.com/data/${reciter.everyAyahFolder}/${sPadded}${aPadded}.mp3`;
}

// Fetch or fallback surah details with selected translation and reciter
export async function fetchSurahDetail(
  surahNumber: number,
  translationId = "en.sahih",
  reciterId = "alafasy"
): Promise<SurahDetail> {
  const meta = SURAH_LIST.find((s) => s.number === surahNumber) || SURAH_LIST[0];

  // If standard English and offline bundled exists, return immediately
  if (translationId === "en.sahih" && OFFLINE_SURAHS[surahNumber]) {
    return {
      ...meta,
      ayahs: OFFLINE_SURAHS[surahNumber],
    };
  }

  try {
    // Dynamic fetch from open Quran API with selected translation edition
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,${translationId}`
    );
    if (!res.ok) throw new Error("Network response was not ok");
    const json = await res.json();
    const arabicVerses = json.data[0].ayahs;
    const translatedVerses = json.data[1].ayahs;

    const ayahs: AyahItem[] = arabicVerses.map((v: any, index: number) => {
      const globalNumber = v.number;
      return {
        number: globalNumber,
        numberInSurah: v.numberInSurah,
        textArabic: v.text,
        textEnglish: translatedVerses[index]?.text || "",
        audioUrl: getAyahAudioUrl(surahNumber, v.numberInSurah, reciterId),
      };
    });

    return {
      ...meta,
      ayahs,
    };
  } catch (error) {
    console.warn(`Failed to fetch online surah ${surahNumber}, falling back to offline content or placeholder`, error);
    if (OFFLINE_SURAHS[surahNumber]) {
      return {
        ...meta,
        ayahs: OFFLINE_SURAHS[surahNumber],
      };
    }
    return {
      ...meta,
      ayahs: [
        {
          number: 1,
          numberInSurah: 1,
          textArabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          textEnglish: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          audioUrl: getSurahAudioUrl(surahNumber),
        },
        {
          number: 2,
          numberInSurah: 2,
          textArabic: `سورة ${meta.name} (${meta.transliteration})`,
          textEnglish: `Connect to the internet to load all ${meta.totalAyahs} verses of ${meta.transliteration}, or listen to the recitation below.`,
          audioUrl: getSurahAudioUrl(surahNumber),
        },
      ],
    };
  }
}
