import { DhikrItem } from "@/types";

export interface AdhkarCategory {
  id: "morning" | "evening" | "after-salah" | "sleep" | "daily";
  title: string;
  arabicTitle: string;
  items: DhikrItem[];
}

export const ADHKAR_CATEGORIES: AdhkarCategory[] = [
  {
    id: "morning",
    title: "Morning Adhkar (Adhkar as-Sabah)",
    arabicTitle: "أَذْكَارُ الصَّبَاحِ",
    items: [
      {
        id: "m-1",
        title: "Ayat al-Kursi (The Throne Verse)",
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        transliteration: "Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatun wa la nawm. Lahu ma fis-samawati wa ma fil-ard. Man dhal-ladhi yashfa'u 'indahu illa bi-idhnih. Ya'lamu ma bayna aydihim wa ma khalfahum, wa la yuhituna bishay'im-min 'ilmihi illa bima sha'a. Wasi'a kursiyyuhus-samawati wal-arda, wa la ya'uduhu hifdhuhuma, wa Huwal-'Aliyyul-'Adhim.",
        translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        reference: "Surah Al-Baqarah 2:255 | Hakim (Authentic)",
        benefit: "Whoever recites this when he rises in the morning will be protected from jinn and harm until evening.",
        targetCount: 1,
      },
      {
        id: "m-2",
        title: "We have reached the morning...",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadir.",
        translation: "We have entered the morning and the dominion belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs the sovereignty and praise, and He has power over all things.",
        reference: "Sahih Muslim (2723)",
        benefit: "Affirms complete reliance upon Allah at the start of the day.",
        targetCount: 1,
      },
      {
        id: "m-3",
        title: "Sayyid al-Istighfar (The Master Supplication for Forgiveness)",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bini'matika 'alayya, wa abu'u bidhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa Anta.",
        translation: "O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your slave. I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge before You Your blessing upon me, and I confess to You my sin, so forgive me, for none forgives sins except You.",
        reference: "Sahih al-Bukhari (6306)",
        benefit: "Whoever recites this with firm faith in the morning and dies before evening will be among the people of Paradise.",
        targetCount: 1,
      },
      {
        id: "m-4",
        title: "Protection with Allah's Name",
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        transliteration: "Bismillahil-ladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa Huwas-Sami'ul-'Alim.",
        translation: "In the Name of Allah, with Whose Name nothing upon earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.",
        reference: "Abu Dawud (5088), At-Tirmidhi (3388)",
        benefit: "Whoever recites this three times in the morning will not be harmed by anything until evening.",
        targetCount: 3,
      },
      {
        id: "m-5",
        title: "Pleasure with Allah, Islam, and Muhammad",
        arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        transliteration: "Raditu billahi Rabba, wa bil-Islami dina, wa bi-Muhammadin sallallahu 'alayhi wa sallama Nabiyya.",
        translation: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace and blessings be upon him) as my Prophet.",
        reference: "Ahmad (4/337), At-Tirmidhi (3389)",
        benefit: "Allah has promised that whoever says this three times in the morning and evening, He will surely please him on the Day of Resurrection.",
        targetCount: 3,
      },
      {
        id: "m-6",
        title: "Subhanallah wa bihamdihi (100 times)",
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "Subhanallahi wa bihamdih.",
        translation: "Glory be to Allah and all praise is due to Him.",
        reference: "Sahih Muslim (2692)",
        benefit: "Whoever says this 100 times in the morning and evening, their sins will be erased even if they are like the foam of the sea.",
        targetCount: 100,
      },
    ],
  },
  {
    id: "evening",
    title: "Evening Adhkar (Adhkar al-Masaa)",
    arabicTitle: "أَذْكَارُ المَسَاءِ",
    items: [
      {
        id: "e-1",
        title: "We have reached the evening...",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        transliteration: "Amsayna wa amsal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa Huwa 'ala kulli shay'in Qadir.",
        translation: "We have entered the evening and the dominion belongs to Allah, and all praise is for Allah. None has the right to be worshipped except Allah alone, without partner. To Him belongs the sovereignty and praise, and He has power over all things.",
        reference: "Sahih Muslim (2723)",
        benefit: "Proclaims submission to Allah as day turns to night.",
        targetCount: 1,
      },
      {
        id: "e-2",
        title: "Ayat al-Kursi",
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
        transliteration: "Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum...",
        translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...",
        reference: "Surah Al-Baqarah 2:255",
        benefit: "Protection from harm and evil spirits through the night until morning.",
        targetCount: 1,
      },
      {
        id: "e-3",
        title: "Seeking refuge in the Perfect Words of Allah",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq.",
        translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        reference: "Sahih Muslim (2709)",
        benefit: "Whoever recites this three times in the evening will be protected from venomous bites and harm that night.",
        targetCount: 3,
      },
      {
        id: "e-4",
        title: "Sayyid al-Istighfar",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka...",
        translation: "O Allah, You are my Lord, none has the right to be worshipped except You...",
        reference: "Sahih al-Bukhari (6306)",
        benefit: "Whoever recites this with firm faith in the evening and dies before morning will enter Paradise.",
        targetCount: 1,
      },
    ],
  },
  {
    id: "after-salah",
    title: "After Prayer Adhkar (Ba'd as-Salah)",
    arabicTitle: "أَذْكَارُ بَعْدَ الصَّلَاةِ",
    items: [
      {
        id: "s-1",
        title: "Astaghfirullah (3 times)",
        arabic: "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ",
        transliteration: "Astaghfirullah, Astaghfirullah, Astaghfirullah.",
        translation: "I ask Allah for forgiveness (three times).",
        reference: "Sahih Muslim (591)",
        benefit: "Recited immediately upon completing the obligatory prayer.",
        targetCount: 3,
      },
      {
        id: "s-2",
        title: "Allahumma Antas-Salam",
        arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        transliteration: "Allahumma Antas-Salamu wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
        translation: "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.",
        reference: "Sahih Muslim (591)",
        benefit: "Sunnah praise after concluding prayer.",
        targetCount: 1,
      },
      {
        id: "s-3",
        title: "Subhanallah (33 times)",
        arabic: "سُبْحَانَ اللَّهِ",
        transliteration: "Subhanallah.",
        translation: "Glory be to Allah.",
        reference: "Sahih Muslim (597)",
        benefit: "Part of the 33-33-33 Tasbih after prayer that wipes out sins.",
        targetCount: 33,
      },
      {
        id: "s-4",
        title: "Alhamdulillah (33 times)",
        arabic: "الْحَمْدُ لِلَّهِ",
        transliteration: "Alhamdulillah.",
        translation: "All praise is for Allah.",
        reference: "Sahih Muslim (597)",
        benefit: "Exalts gratitude to Allah after prayer.",
        targetCount: 33,
      },
      {
        id: "s-5",
        title: "Allahu Akbar (34 times / 33 times)",
        arabic: "اللَّهُ أَكْبَرُ",
        transliteration: "Allahu Akbar.",
        translation: "Allah is the Greatest.",
        reference: "Sahih Muslim (597)",
        benefit: "Complete the remembrance after prayer.",
        targetCount: 34,
      },
    ],
  },
  {
    id: "sleep",
    title: "Before Sleep Adhkar (Adhkar an-Nawm)",
    arabicTitle: "أَذْكَارُ النَّوْمِ",
    items: [
      {
        id: "n-1",
        title: "In Your Name O Allah, I die and I live",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya.",
        translation: "In Your Name, O Allah, I die (sleep) and I live (wake).",
        reference: "Sahih al-Bukhari (6324)",
        benefit: "Entrusts the soul to Allah before entering sleep, the minor death.",
        targetCount: 1,
      },
      {
        id: "n-2",
        title: "Three Quls Blown into Palms",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        transliteration: "Qul Huwallahu Ahad... Qul A'udhu bi-Rabbil-Falaq... Qul A'udhu bi-Rabbin-Nas...",
        translation: "Cup the palms together, blow gently into them, recite Surah Al-Ikhlas, Al-Falaq, and An-Nas, then wipe over the head, face, and body.",
        reference: "Sahih al-Bukhari (5017)",
        benefit: "Prophetic nightly Sunnah for complete physical and spiritual protection while sleeping.",
        targetCount: 3,
      },
      {
        id: "n-3",
        title: "Tasbih of Fatimah Before Sleep (Subhanallah 33, Alhamdulillah 33, Allahu Akbar 34)",
        arabic: "سُبْحَانَ اللَّهِ (٣٣) ۝ الْحَمْدُ لِلَّهِ (٣٣) ۝ اللَّهُ أَكْبَرُ (٣٤)",
        transliteration: "Subhanallah (33), Alhamdulillah (33), Allahu Akbar (34).",
        translation: "Glory be to Allah (33), Praise be to Allah (33), Allah is the Greatest (34).",
        reference: "Sahih al-Bukhari (5361)",
        benefit: "Taught by the Prophet ﷺ to Fatimah & Ali as better than having a servant, granting strength and barakah.",
        targetCount: 34,
      },
      {
        id: "n-4",
        title: "Surrendering the Soul to Allah",
        arabic: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
        transliteration: "Allahumma aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa wajjahtu wajhi ilayk, wa alja'tu dhahri ilayk, raghbatan wa rahbatan ilayk, la malja'a wa la manja minka illa ilayk, amantu bikitabikal-ladhi anzalt, wa binabiyyikal-ladhi arsalt.",
        translation: "O Allah, I submit my soul unto You, and I entrust my affair unto You, and I turn my face towards You, and I totally rely on You, in hope and fear of You. There is no refuge or safe haven from You except with You. I believe in Your Book which You have revealed and in Your Prophet whom You have sent.",
        reference: "Sahih al-Bukhari (6311)",
        benefit: "If you die that night after reciting this as your final words, you die upon the natural Islamic Fitrah.",
        targetCount: 1,
      },
    ],
  },
];

export const MORNING_ADHKAR: DhikrItem[] =
  ADHKAR_CATEGORIES.find((c) => c.id === "morning")?.items || [];

export const EVENING_ADHKAR: DhikrItem[] =
  ADHKAR_CATEGORIES.find((c) => c.id === "evening")?.items || [];

export const AFTER_SALAH_ADHKAR: DhikrItem[] =
  ADHKAR_CATEGORIES.find((c) => c.id === "after-salah")?.items || [];

export const SLEEP_ADHKAR: DhikrItem[] =
  ADHKAR_CATEGORIES.find((c) => c.id === "sleep")?.items || [];
