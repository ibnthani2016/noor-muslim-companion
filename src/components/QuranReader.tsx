"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SurahDetail,
  ArabicFontId,
  ArabicScriptType,
  ArabicFontSize,
  QuranReadingMode,
  QuranBookmark,
} from "@/types";
import {
  SURAH_LIST,
  fetchSurahDetail,
  fetchAyahTafsir,
  isSurahTextCached,
  toArabicIndicDigits,
  getAyahAudioUrl,
  RECITERS,
  TRANSLATION_EDITIONS,
  ARABIC_FONTS,
  ARABIC_SCRIPTS,
} from "@/data/quranData";
import {
  getOfflineAudioUrl,
  cacheAudioUrl,
  getSurahCacheStatus,
  downloadSurahAudio,
  deleteSurahAudio,
  getCachedSurahMap,
} from "@/utils/audioCache";
import {
  Search,
  BookOpen,
  Play,
  Pause,
  Bookmark,
  Volume2,
  X,
  Languages,
  Mic,
  Sparkles,
  Repeat,
  CheckCircle2,
  Type,
  Check,
  SkipBack,
  SkipForward,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Repeat1,
  ChevronLeft,
  ChevronRight,
  Palette,
  Trophy,
  Copy,
  FileText,
  Layers,
  GraduationCap,
} from "lucide-react";
import { KhatmahTracker } from "@/components/KhatmahTracker";

interface QuranReaderProps {
  onOpenCardStudio?: (ayahData: { arabic: string; english: string; reference: string }) => void;
}

const QUICK_SURAHS = [
  { label: "Ayat al-Kursi", surah: 2, ayah: 255 },
  { label: "Al-Kahf", surah: 18, ayah: 1 },
  { label: "Ya-Sin", surah: 36, ayah: 1 },
  { label: "Ar-Rahman", surah: 55, ayah: 1 },
  { label: "Al-Waqi'ah", surah: 56, ayah: 1 },
  { label: "Al-Mulk", surah: 67, ayah: 1 },
];

export const QuranReader: React.FC<QuranReaderProps> = ({ onOpenCardStudio }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [isKhatmahModalOpen, setIsKhatmahModalOpen] = useState(false);
  const [completedJuzCount, setCompletedJuzCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_khatmah_juz");
      return saved ? JSON.parse(saved).length : 0;
    }
    return 0;
  });

  // Reading View Mode: Verse-by-Verse Cards vs Mushaf Flowing Page
  const [readingMode, setReadingMode] = useState<QuranReadingMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("noor_quran_reading_mode") as QuranReadingMode) || "cards";
    }
    return "cards";
  });

  // Hifdh Self-Test Blur Mode
  const [isHifdhBlurMode, setIsHifdhBlurMode] = useState<boolean>(false);
  const [revealedAyahs, setRevealedAyahs] = useState<Record<number, boolean>>({});

  // Ayah Range Loop State (From Verse X to Verse Y)
  const [isRangeLoopOpen, setIsRangeLoopOpen] = useState<boolean>(false);
  const [rangeLoopEnabled, setRangeLoopEnabled] = useState<boolean>(false);
  const [rangeStartAyah, setRangeStartAyah] = useState<number>(1);
  const [rangeEndAyah, setRangeEndAyah] = useState<number>(5);
  const rangeLoopRef = useRef<{ enabled: boolean; start: number; end: number }>({
    enabled: false,
    start: 1,
    end: 5,
  });

  useEffect(() => {
    rangeLoopRef.current = {
      enabled: rangeLoopEnabled,
      start: rangeStartAyah,
      end: rangeEndAyah,
    };
  }, [rangeLoopEnabled, rangeStartAyah, rangeEndAyah]);

  // Hifz Single-Verse Looper State (Repeat Count & Delay)
  const [hifzRepeatTarget, setHifzRepeatTarget] = useState<number>(3); // 1, 3, 5, 10, or 99
  const [hifzCurrentLoop, setHifzCurrentLoop] = useState<number>(1);
  const [hifzDelaySeconds, setHifzDelaySeconds] = useState<number>(1);
  const hifzRepeatTargetRef = useRef<number>(3);
  const hifzCurrentLoopRef = useRef<number>(1);
  const hifzDelaySecondsRef = useRef<number>(1);

  useEffect(() => {
    hifzRepeatTargetRef.current = hifzRepeatTarget;
  }, [hifzRepeatTarget]);

  useEffect(() => {
    hifzCurrentLoopRef.current = hifzCurrentLoop;
  }, [hifzCurrentLoop]);

  useEffect(() => {
    hifzDelaySecondsRef.current = hifzDelaySeconds;
  }, [hifzDelaySeconds]);

  const refreshKhatmahCount = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_khatmah_juz");
      setCompletedJuzCount(saved ? JSON.parse(saved).length : 0);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "Meccan" | "Medinan">("all");
  const [selectedJuzFilter, setSelectedJuzFilter] = useState<number>(0); // 0 = All Juz

  // Exact { surah, ayah } Last-Read Position & Multi-Ayah Bookmarks
  const [lastReadPos, setLastReadPos] = useState<{ surah: number; ayah: number }>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_last_read_pos");
        if (saved) return JSON.parse(saved);
        const legacySurah = localStorage.getItem("noor_last_surah");
        if (legacySurah) return { surah: parseInt(legacySurah, 10) || 1, ayah: 1 };
      } catch {
        // Ignore
      }
    }
    return { surah: 1, ayah: 1 };
  });

  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_quran_bookmarks");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  const pendingJumpAyahRef = useRef<number | null>(null);

  // Copy & Tafsir Drawer State
  const [copiedAyahNum, setCopiedAyahNum] = useState<number | null>(null);
  const [openTafsirAyah, setOpenTafsirAyah] = useState<number | null>(null);
  const [tafsirDataMap, setTafsirDataMap] = useState<
    Record<string, { arabicTafsir: string; englishTafsir: string; loading?: boolean }>
  >({});

  // Arabic Typography & Script State
  const [selectedFontId, setSelectedFontId] = useState<ArabicFontId>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("noor_arabic_font") as ArabicFontId) || "uthmani";
    }
    return "uthmani";
  });

  const [selectedScriptType, setSelectedScriptType] = useState<ArabicScriptType>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("noor_arabic_script") as ArabicScriptType) || "quran-uthmani";
    }
    return "quran-uthmani";
  });

  const [arabicFontSize, setArabicFontSize] = useState<ArabicFontSize>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("noor_arabic_size") as ArabicFontSize) || "large";
    }
    return "large";
  });

  const [isTypographyModalOpen, setIsTypographyModalOpen] = useState(false);

  // Reciter & Translation state
  const [selectedReciterId, setSelectedReciterId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("noor_reciter") || "alafasy";
    }
    return "alafasy";
  });

  const [selectedTranslationId, setSelectedTranslationId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("noor_translation") || "en.sahih";
    }
    return "en.sahih";
  });

  // Synchronized Audio Player State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number>(1);
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_continuous_play");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioProgress, setAudioProgress] = useState<{ currentTime: number; duration: number }>({
    currentTime: 0,
    duration: 0,
  });

  // Notice for queued reciter change on next verse
  const [reciterChangeNotice, setReciterChangeNotice] = useState<string | null>(null);
  const reciterChangeNoticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Offline Recitation Audio State
  const [isSurahAudioDownloaded, setIsSurahAudioDownloaded] = useState<boolean>(false);
  const [isDownloadingAudio, setIsDownloadingAudio] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{
    completed: number;
    total: number;
    percentage: number;
  }>({ completed: 0, total: 0, percentage: 0 });
  const [cachedSurahsMap, setCachedSurahsMap] = useState<Record<number, boolean>>({});

  // Single Verse Infinite Repeat Mode (Repeat Until Stopped)
  const [loopingAyahNumber, setLoopingAyahNumber] = useState<number | null>(null);
  const loopingAyahNumberRef = useRef<number | null>(null);

  // Cross-Surah auto-advancing transition state
  const [surahTransitionNotice, setSurahTransitionNotice] = useState<string | null>(null);
  const surahTransitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoAdvancingNextSurahRef = useRef<boolean>(false);

  // Persistent audio elements, active Blob URL tracker, and ref mirrors
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioPreloadRef = useRef<HTMLAudioElement | null>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const preloadBlobUrlRef = useRef<string | null>(null);

  const isContinuousPlayRef = useRef<boolean>(isContinuousPlay);
  const surahDetailRef = useRef<SurahDetail | null>(surahDetail);
  const selectedReciterIdRef = useRef<string>(selectedReciterId);
  const activeAyahNumberRef = useRef<number>(activeAyahNumber);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  const isPlayingRef = useRef<boolean>(isPlaying);

  const revokeActiveBlobUrls = () => {
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }
    if (preloadBlobUrlRef.current && preloadBlobUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(preloadBlobUrlRef.current);
      preloadBlobUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      revokeActiveBlobUrls();
    };
  }, []);

  useEffect(() => {
    loopingAyahNumberRef.current = loopingAyahNumber;
  }, [loopingAyahNumber]);

  useEffect(() => {
    isContinuousPlayRef.current = isContinuousPlay;
  }, [isContinuousPlay]);

  useEffect(() => {
    surahDetailRef.current = surahDetail;
  }, [surahDetail]);

  useEffect(() => {
    selectedReciterIdRef.current = selectedReciterId;
  }, [selectedReciterId]);

  useEffect(() => {
    activeAyahNumberRef.current = activeAyahNumber;
    // Persist exact { surah, ayah } reading position whenever activeAyahNumber updates inside an open Surah
    if (selectedSurahNumber && activeAyahNumber >= 1) {
      const nextPos = { surah: selectedSurahNumber, ayah: activeAyahNumber };
      setLastReadPos(nextPos);
      if (typeof window !== "undefined") {
        localStorage.setItem("noor_last_read_pos", JSON.stringify(nextPos));
        localStorage.setItem("noor_last_surah", String(selectedSurahNumber));
      }
    }
  }, [activeAyahNumber, selectedSurahNumber]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const activeReciter = RECITERS.find((r) => r.id === selectedReciterId) || RECITERS[0];
  const activeTranslation =
    TRANSLATION_EDITIONS.find((t) => t.id === selectedTranslationId) || TRANSLATION_EDITIONS[0];
  const activeFont = ARABIC_FONTS.find((f) => f.id === selectedFontId) || ARABIC_FONTS[0];

  const FONT_SIZE_MAP: Record<ArabicFontSize, { arabic: string; label: string; previewPx: string }> = {
    normal: { arabic: "text-xl sm:text-2xl leading-[2.3]", label: "Normal", previewPx: "24px" },
    large: { arabic: "text-2xl sm:text-3xl leading-[2.5]", label: "Large", previewPx: "30px" },
    xl: { arabic: "text-3xl sm:text-4xl leading-[2.7]", label: "Extra Large", previewPx: "36px" },
    "2xl": { arabic: "text-4xl sm:text-5xl leading-[2.9]", label: "Huge", previewPx: "44px" },
  };

  const handleReadingModeChange = (mode: QuranReadingMode) => {
    setReadingMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_quran_reading_mode", mode);
    }
  };

  const handleFontChange = (id: ArabicFontId) => {
    setSelectedFontId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_arabic_font", id);
    }
  };

  const handleScriptChange = (script: ArabicScriptType) => {
    setSelectedScriptType(script);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_arabic_script", script);
    }
  };

  const handleFontSizeChange = (size: ArabicFontSize) => {
    setArabicFontSize(size);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_arabic_size", size);
    }
  };

  const toggleContinuousPlay = () => {
    setIsContinuousPlay((prev) => {
      const next = !prev;
      isContinuousPlayRef.current = next;
      if (typeof window !== "undefined") {
        localStorage.setItem("noor_continuous_play", String(next));
      }
      return next;
    });
  };

  // Multi-Ayah Bookmark Toggle
  const isAyahBookmarked = (surahNum: number, ayahNum: number) => {
    return bookmarks.some((b) => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
  };

  const toggleBookmarkAyah = (surahNum: number, surahName: string, ayahNum: number) => {
    const exists = isAyahBookmarked(surahNum, ayahNum);
    const updated = exists
      ? bookmarks.filter((b) => !(b.surahNumber === surahNum && b.ayahNumber === ayahNum))
      : [
          {
            surahNumber: surahNum,
            surahName,
            ayahNumber: ayahNum,
            timestamp: Date.now(),
          },
          ...bookmarks,
        ];
    setBookmarks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_quran_bookmarks", JSON.stringify(updated));
    }
  };

  const openSurahAtAyah = (surahNum: number, ayahNum: number = 1) => {
    pendingJumpAyahRef.current = ayahNum;
    setSelectedSurahNumber(surahNum);
  };

  // Copy Ayah to clipboard
  const handleCopyAyah = (ayahNum: number, arabic: string, english: string) => {
    if (!surahDetail || typeof navigator === "undefined") return;
    const text = `${arabic}\n\n"${english}"\n— Surah ${surahDetail.transliteration} (${surahDetail.number}:${ayahNum})`;
    navigator.clipboard.writeText(text);
    setCopiedAyahNum(ayahNum);
    setTimeout(() => setCopiedAyahNum(null), 2000);
  };

  // Toggle Tafsir Drawer for a verse
  const handleToggleTafsir = async (ayahNum: number) => {
    if (!surahDetail) return;
    if (openTafsirAyah === ayahNum) {
      setOpenTafsirAyah(null);
      return;
    }
    setOpenTafsirAyah(ayahNum);
    const key = `${surahDetail.number}:${ayahNum}`;
    if (!tafsirDataMap[key]) {
      setTafsirDataMap((prev) => ({
        ...prev,
        [key]: { arabicTafsir: "", englishTafsir: "", loading: true },
      }));
      const data = await fetchAyahTafsir(surahDetail.number, ayahNum);
      setTafsirDataMap((prev) => ({
        ...prev,
        [key]: { ...data, loading: false },
      }));
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Auto-scroll to active Ayah if auto-scroll is enabled
  useEffect(() => {
    if (activeAyahNumber !== null && isAutoScrollEnabled && typeof document !== "undefined") {
      const el = document.getElementById(`ayah-${activeAyahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeAyahNumber, isAutoScrollEnabled, readingMode]);

  // Stop & clear all audio elements
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    revokeActiveBlobUrls();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setAudioProgress({ currentTime: 0, duration: 0 });
    setReciterChangeNotice(null);
    if (reciterChangeNoticeTimerRef.current) {
      clearTimeout(reciterChangeNoticeTimerRef.current);
    }
    if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  };

  // Advance to next or target Surah (supports cross-Surah auto-advance)
  const advanceToNextSurah = (targetSurahNum: number, autoStartRecite: boolean = true) => {
    if (targetSurahNum < 1 || targetSurahNum > 114) return;
    const nextMeta = SURAH_LIST.find((s) => s.number === targetSurahNum);

    if (autoStartRecite) {
      isAutoAdvancingNextSurahRef.current = true;
    }
    setLoopingAyahNumber(null);
    loopingAyahNumberRef.current = null;

    if (nextMeta) {
      setSurahTransitionNotice(
        `Surah ${nextMeta.number}: ${nextMeta.transliteration} (${nextMeta.name})`
      );
      if (surahTransitionTimerRef.current) {
        clearTimeout(surahTransitionTimerRef.current);
      }
      surahTransitionTimerRef.current = setTimeout(() => {
        setSurahTransitionNotice(null);
      }, 5000);
    }

    setSelectedSurahNumber(targetSurahNum);
  };

  // Toggle single-verse repeat loop (Hifz memorization looper)
  const handleToggleLoopAyah = (ayahNum: number) => {
    if (loopingAyahNumber === ayahNum) {
      setLoopingAyahNumber(null);
      loopingAyahNumberRef.current = null;
      setHifzCurrentLoop(1);
      hifzCurrentLoopRef.current = 1;
    } else {
      setLoopingAyahNumber(ayahNum);
      loopingAyahNumberRef.current = ayahNum;
      setHifzCurrentLoop(1);
      hifzCurrentLoopRef.current = 1;
      if (!isPlaying || activeAyahNumber !== ayahNum) {
        playSynchronizedAyah(ayahNum, true);
      }
    }
  };

  // Check if current Surah has downloaded offline audio
  useEffect(() => {
    if (selectedSurahNumber && surahDetail) {
      getSurahCacheStatus(selectedSurahNumber, surahDetail.totalAyahs, selectedReciterId).then(
        (status) => {
          setIsSurahAudioDownloaded(status.isFullyCached);
          if (status.isFullyCached) {
            setCachedSurahsMap((prev) => ({ ...prev, [selectedSurahNumber]: true }));
          }
        }
      );
    }
  }, [selectedSurahNumber, surahDetail, selectedReciterId]);

  // Scan cached surahs on mount
  useEffect(() => {
    getCachedSurahMap().then((map) => {
      setCachedSurahsMap(map);
    });
  }, []);

  // Handle Download current Surah for offline listening
  const handleDownloadSurahAudio = async () => {
    if (!surahDetail || isDownloadingAudio) return;

    setIsDownloadingAudio(true);
    setDownloadProgress({ completed: 0, total: surahDetail.totalAyahs, percentage: 0 });

    const result = await downloadSurahAudio(
      surahDetail.number,
      surahDetail.totalAyahs,
      selectedReciterId,
      (completed, total) => {
        const pct = Math.round((completed / total) * 100);
        setDownloadProgress({ completed, total, percentage: pct });
      }
    );

    setIsDownloadingAudio(false);
    if (result.success) {
      setIsSurahAudioDownloaded(true);
      setCachedSurahsMap((prev) => ({ ...prev, [surahDetail.number]: true }));
    }
  };

  // Handle Delete downloaded audio for current Surah
  const handleDeleteSurahAudio = async () => {
    if (!surahDetail) return;
    await deleteSurahAudio(surahDetail.number, surahDetail.totalAyahs, selectedReciterId);
    setIsSurahAudioDownloaded(false);
    setCachedSurahsMap((prev) => {
      const copy = { ...prev };
      delete copy[surahDetail.number];
      return copy;
    });
  };

  // Play a specific Ayah using persistent HTMLAudioElement with offline-first resolution
  const playSynchronizedAyah = async (ayahNum: number, startPlaying: boolean = true) => {
    const detail = surahDetailRef.current;
    if (!detail) return;

    // Clear any queued reciter notification once a verse starts
    setReciterChangeNotice(null);
    if (reciterChangeNoticeTimerRef.current) {
      clearTimeout(reciterChangeNoticeTimerRef.current);
    }

    // Clamp Ayah number within surah bounds (Ayah 0 is Opening Bismillah for Surahs 2-114 except 9)
    const minAyah = detail.number === 9 || detail.number === 1 ? 1 : 0;
    const clampedAyah = Math.max(minAyah, Math.min(detail.totalAyahs, ayahNum));
    setActiveAyahNumber(clampedAyah);
    activeAyahNumberRef.current = clampedAyah;

    // Reuse persistent audio element to maintain browser user gesture authorization
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audioRef.current = audio;
    }

    const currentUrl = getAyahAudioUrl(detail.number, clampedAyah, selectedReciterIdRef.current);

    // Revoke previous Blob URL before creating a new one to prevent memory leaks
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(activeBlobUrlRef.current);
      activeBlobUrlRef.current = null;
    }

    let audioSrcToPlay = currentUrl;
    try {
      const offlineBlobUrl = await getOfflineAudioUrl(currentUrl);
      if (offlineBlobUrl) {
        activeBlobUrlRef.current = offlineBlobUrl;
        audioSrcToPlay = offlineBlobUrl;
      } else {
        cacheAudioUrl(currentUrl);
      }
    } catch {
      audioSrcToPlay = currentUrl;
    }

    audio.ontimeupdate = () => {
      setAudioProgress({
        currentTime: audio?.currentTime || 0,
        duration: audio?.duration || 0,
      });
    };

    audio.onloadedmetadata = () => {
      setAudioProgress((prev) => ({
        ...prev,
        duration: audio?.duration || 0,
      }));
    };

    // Auto-advance to next verse, single-verse loop, range loop, or advance to next Surah
    audio.onended = () => {
      const curDetail = surahDetailRef.current;
      const curAyah = activeAyahNumberRef.current;
      const autoAdvance = isContinuousPlayRef.current;
      const loopAyah = loopingAyahNumberRef.current;
      const rLoop = rangeLoopRef.current;

      // 1. Single-Verse Hifz Repeat Mode (Repeat N times or infinite)
      if (loopAyah !== null && loopAyah === curAyah) {
        const targetLoops = hifzRepeatTargetRef.current; // 1, 3, 5, 10, or 99
        const curLoop = hifzCurrentLoopRef.current;
        const delayMs = hifzDelaySecondsRef.current * 1000;

        if (targetLoops === 99 || curLoop < targetLoops) {
          const nextLoop = curLoop + 1;
          setHifzCurrentLoop(nextLoop);
          hifzCurrentLoopRef.current = nextLoop;
          setTimeout(() => {
            playSynchronizedAyah(curAyah, true);
          }, Math.max(120, delayMs));
          return;
        } else {
          setHifzCurrentLoop(1);
          hifzCurrentLoopRef.current = 1;
          setLoopingAyahNumber(null);
          loopingAyahNumberRef.current = null;
        }
      }

      // 2. Ayah-Range Loop Mode (From Verse X to Verse Y)
      if (rLoop.enabled && curDetail) {
        const validStart = Math.max(1, Math.min(curDetail.totalAyahs, rLoop.start));
        const validEnd = Math.max(validStart, Math.min(curDetail.totalAyahs, rLoop.end));
        if (curAyah >= validEnd) {
          playSynchronizedAyah(validStart, true);
          return;
        } else if (curAyah < validEnd) {
          playSynchronizedAyah(curAyah + 1, true);
          return;
        }
      }

      // 3. Opening Bismillah (Ayah 0) seamlessly transitions to Ayah 1; or Normal Auto-Advance within Current Surah
      if (curAyah === 0 || (autoAdvance && curDetail && curAyah < curDetail.totalAyahs)) {
        if (curDetail && curAyah < curDetail.totalAyahs) {
          const nextAyah = curAyah + 1;
          playSynchronizedAyah(nextAyah, true);
          return;
        }
      }

      // 4. Current Surah Completed -> Cross-Surah Auto-Advance to Next Surah
      if (autoAdvance && curDetail && curAyah >= curDetail.totalAyahs && curDetail.number < 114) {
        advanceToNextSurah(curDetail.number + 1, true);
        return;
      }

      // Reached end of Surah without continuous play or end of Quran (Surah 114)
      setIsPlaying(false);
      isPlayingRef.current = false;
      setAudioProgress({ currentTime: 0, duration: 0 });
      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    };

    audio.onerror = (e) => {
      console.warn(`[Quran Audio] Verse ${clampedAyah} stream error:`, e);
      const curDetail = surahDetailRef.current;
      const loopAyah = loopingAyahNumberRef.current;

      if (loopAyah !== null && loopAyah === clampedAyah) {
        setTimeout(() => playSynchronizedAyah(clampedAyah, true), 1000);
        return;
      }

      if (isContinuousPlayRef.current && curDetail) {
        if (clampedAyah < curDetail.totalAyahs) {
          setTimeout(() => {
            playSynchronizedAyah(clampedAyah + 1, true);
          }, 400);
        } else if (curDetail.number < 114) {
          advanceToNextSurah(curDetail.number + 1, true);
        }
      } else {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    audio.src = audioSrcToPlay;
    audio.playbackRate = playbackSpeedRef.current;

    // Preload next verse (revoking any previous preload blob URL)
    if (clampedAyah < detail.totalAyahs) {
      const nextUrl = getAyahAudioUrl(detail.number, clampedAyah + 1, selectedReciterIdRef.current);
      getOfflineAudioUrl(nextUrl).then((cachedNext) => {
        if (preloadBlobUrlRef.current && preloadBlobUrlRef.current.startsWith("blob:")) {
          URL.revokeObjectURL(preloadBlobUrlRef.current);
          preloadBlobUrlRef.current = null;
        }
        if (cachedNext) {
          preloadBlobUrlRef.current = cachedNext;
        }
        if (!nextAudioPreloadRef.current) {
          nextAudioPreloadRef.current = new Audio();
        }
        nextAudioPreloadRef.current.src = cachedNext || nextUrl;
        nextAudioPreloadRef.current.preload = "auto";
      });
    }

    if (startPlaying) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
            navigator.mediaSession.playbackState = "playing";
          }
        })
        .catch((err) => {
          console.warn("[Quran Audio] Autoplay interrupted:", err);
          setIsPlaying(false);
          isPlayingRef.current = false;
        });
    } else {
      audio.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    }
  };

  // Toggle Play / Pause for the active Ayah
  const togglePlayPause = () => {
    if (!surahDetail) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else if (audioRef.current && !isPlaying && audioRef.current.src && !audioRef.current.ended) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
        })
        .catch(() => playSynchronizedAyah(activeAyahNumber, true));
    } else {
      playSynchronizedAyah(activeAyahNumber, true);
    }
  };

  // Previous Ayah (with previous Surah transition if at minimum Ayah)
  const playPreviousAyah = () => {
    if (!surahDetail) return;
    const minAyah = surahDetail.number === 9 || surahDetail.number === 1 ? 1 : 0;
    if (activeAyahNumber > minAyah) {
      const target = activeAyahNumber - 1;
      playSynchronizedAyah(target, isPlaying);
    } else if (surahDetail.number > 1) {
      advanceToNextSurah(surahDetail.number - 1, isPlaying);
    }
  };

  // Next Ayah (with next Surah transition if at final Ayah)
  const playNextAyah = () => {
    if (!surahDetail) return;
    if (activeAyahNumber < surahDetail.totalAyahs) {
      const target = activeAyahNumber + 1;
      playSynchronizedAyah(target, isPlaying);
    } else if (surahDetail.number < 114) {
      advanceToNextSurah(surahDetail.number + 1, isPlaying);
    }
  };

  // Change playback speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Reciter switch handler - allows current verse to finish reciting and seamlessly begins new reciter on the next verse
  const handleReciterChange = (id: string) => {
    setSelectedReciterId(id);
    selectedReciterIdRef.current = id;
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_reciter", id);
    }

    const isCurrentlyPlaying = isPlayingRef.current;
    const detail = surahDetailRef.current;
    const currentAyah = activeAyahNumberRef.current;
    const newReciter = RECITERS.find((r) => r.id === id);

    if (isCurrentlyPlaying && detail) {
      if (currentAyah < detail.totalAyahs) {
        const nextUrl = getAyahAudioUrl(detail.number, currentAyah + 1, id);
        if (!nextAudioPreloadRef.current) {
          nextAudioPreloadRef.current = new Audio();
        }
        nextAudioPreloadRef.current.src = nextUrl;
        nextAudioPreloadRef.current.preload = "auto";

        if (reciterChangeNoticeTimerRef.current) {
          clearTimeout(reciterChangeNoticeTimerRef.current);
        }
        setReciterChangeNotice(
          `${newReciter?.name || id} begins on Verse ${currentAyah + 1}`
        );
        reciterChangeNoticeTimerRef.current = setTimeout(() => {
          setReciterChangeNotice(null);
        }, 5000);
      }
    } else {
      setReciterChangeNotice(null);
      if (reciterChangeNoticeTimerRef.current) {
        clearTimeout(reciterChangeNoticeTimerRef.current);
      }
    }
  };

  // Translation switch handler
  const handleTranslationChange = (id: string) => {
    setSelectedTranslationId(id);
    localStorage.setItem("noor_translation", id);
  };

  // Filtered surah list (by search, Meccan/Medinan type, and Juz filter)
  const filteredSurahs = SURAH_LIST.filter((s) => {
    const matchesSearch =
      s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.includes(searchQuery) ||
      s.number.toString() === searchQuery.trim();
    const matchesType = filterType === "all" || s.type === filterType;
    const matchesJuz = selectedJuzFilter === 0 || s.juz === selectedJuzFilter;
    return matchesSearch && matchesType && matchesJuz;
  });

  // Load surah when selected or when translation/script changes
  useEffect(() => {
    if (selectedSurahNumber === null) {
      setSurahDetail(null);
      surahDetailRef.current = null;
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setOpenTafsirAyah(null);
    setRevealedAyahs({});
    if (!isAutoAdvancingNextSurahRef.current) {
      stopAudio();
    }

    fetchSurahDetail(
      selectedSurahNumber,
      selectedTranslationId,
      selectedReciterIdRef.current,
      selectedScriptType
    ).then((data) => {
      if (isMounted) {
        setSurahDetail(data);
        surahDetailRef.current = data;
        setIsLoading(false);
        setRangeStartAyah(1);
        setRangeEndAyah(Math.min(5, data.totalAyahs));

        const defaultStartAyah = data.number === 9 || data.number === 1 ? 1 : 0;
        const targetStartAyah =
          pendingJumpAyahRef.current !== null ? pendingJumpAyahRef.current : defaultStartAyah;
        pendingJumpAyahRef.current = null;

        setActiveAyahNumber(targetStartAyah);
        activeAyahNumberRef.current = targetStartAyah;

        if (isAutoAdvancingNextSurahRef.current) {
          isAutoAdvancingNextSurahRef.current = false;
          setTimeout(() => {
            playSynchronizedAyah(defaultStartAyah, true);
          }, 350);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber, selectedTranslationId, selectedScriptType]);

  // Close reader modal
  const closeReader = () => {
    stopAudio();
    setLoopingAyahNumber(null);
    loopingAyahNumberRef.current = null;
    setRangeLoopEnabled(false);
    isAutoAdvancingNextSurahRef.current = false;
    setSelectedSurahNumber(null);
    setActiveAyahNumber(1);
    activeAyahNumberRef.current = 1;
  };

  // Web Media Session API for Background Playback & OS Lockscreen Controls
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!surahDetail) return;

    const reciter = RECITERS.find((r) => r.id === selectedReciterId) || RECITERS[0];
    const isLooping = loopingAyahNumber === activeAyahNumber;
    const ayahLabel = activeAyahNumber === 0 ? "Bismillah (Opening)" : `Verse ${activeAyahNumber}`;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Surah ${surahDetail.transliteration} (${surahDetail.name}) — ${ayahLabel}${
          isLooping ? " [Repeating]" : ""
        }`,
        artist: `${reciter.name} (${reciter.arabicName})`,
        album: `Noor Companion • Holy Quran`,
        artwork: [{ src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" }],
      });

      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("pause", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("previoustrack", () => playPreviousAyah());
      navigator.mediaSession.setActionHandler("nexttrack", () => playNextAyah());
    } catch (err) {
      console.warn("[MediaSession] Error setting metadata/handlers:", err);
    }
  }, [isPlaying, activeAyahNumber, selectedSurahNumber, selectedReciterId, surahDetail, loopingAyahNumber]);

  const lastReadSurahMeta = SURAH_LIST.find((s) => s.number === lastReadPos.surah) || SURAH_LIST[0];

  return (
    <div className="space-y-6">
      {/* Top Row: Continue Reading Resume Card + 30-Day Khatmah Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Continue Reading Exact Surah:Ayah Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/70 to-slate-900 border border-emerald-500/40 p-5 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Last Read Position</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Surah {lastReadSurahMeta.transliteration}</span>
              <span className="font-arabic text-emerald-400">{lastReadSurahMeta.name}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Verse <strong className="text-emerald-300">{lastReadPos.ayah}</strong> of{" "}
              {lastReadSurahMeta.totalAyahs} • Juz {lastReadSurahMeta.juz}
            </p>
          </div>

          <button
            onClick={() => openSurahAtAyah(lastReadPos.surah, lastReadPos.ayah)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Resume {lastReadPos.surah}:{lastReadPos.ayah}</span>
          </button>
        </div>

        {/* 30-Day Ramadan Khatmah Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-700/40 p-5 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Khatmah Planner</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {completedJuzCount} of 30 Juz Completed ({Math.round((completedJuzCount / 30) * 100)}%)
            </h3>
            <p className="text-xs text-slate-400">
              Track your daily Juz goals and complete the Holy Quran at your own pace.
            </p>
          </div>

          <button
            onClick={() => setIsKhatmahModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all shrink-0"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Khatmah</span>
          </button>
        </div>
      </div>

      {/* Quick-Access Sunnah Surahs & Saved Bookmarks Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 shrink-0">
            Quick Jump:
          </span>
          {QUICK_SURAHS.map((q) => (
            <button
              key={q.label}
              onClick={() => openSurahAtAyah(q.surah, q.ayah)}
              className="px-3 py-1 rounded-xl bg-slate-800/90 hover:bg-emerald-950/80 border border-slate-700/70 hover:border-emerald-500/50 text-xs font-medium text-slate-200 hover:text-emerald-300 transition whitespace-nowrap"
            >
              {q.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowBookmarksPanel(!showBookmarksPanel)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
            showBookmarksPanel
              ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
              : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Saved Verses ({bookmarks.length})</span>
        </button>
      </div>

      {/* Expandable Saved Bookmarks Drawer */}
      {showBookmarksPanel && (
        <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Bookmarked Verses ({bookmarks.length})</span>
            </h4>
            <button
              onClick={() => setShowBookmarksPanel(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-xs text-slate-400">
              No bookmarked verses yet. Tap the bookmark icon on any verse inside a Surah to save it here.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {bookmarks.map((b) => (
                <div
                  key={`${b.surahNumber}:${b.ayahNumber}`}
                  onClick={() => openSurahAtAyah(b.surahNumber, b.ayahNumber)}
                  className="cursor-pointer p-3 rounded-xl bg-slate-950/70 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between transition"
                >
                  <div>
                    <div className="text-xs font-bold text-white">
                      Surah {b.surahName} ({b.surahNumber}:{b.ayahNumber})
                    </div>
                    <div className="text-[10px] text-slate-400">Tap to jump to verse</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmarkAyah(b.surahNumber, b.surahName, b.ayahNumber);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Remove Bookmark"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Khatmah Tracker Modal */}
      <KhatmahTracker
        isOpen={isKhatmahModalOpen}
        onClose={() => {
          setIsKhatmahModalOpen(false);
          refreshKhatmahCount();
        }}
        onSelectSurah={(surahNum) => setSelectedSurahNumber(surahNum)}
      />

      {/* Top Controls: Search + Juz Filter + Reciter & Language Selectors */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Surah (e.g., Al-Mulk, Yasin, 67, البقرة)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Juz Filter Dropdown */}
          <select
            value={selectedJuzFilter}
            onChange={(e) => setSelectedJuzFilter(parseInt(e.target.value, 10))}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            aria-label="Filter by Juz"
          >
            <option value={0}>All 30 Juz</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => (
              <option key={juzNum} value={juzNum}>
                Juz {juzNum}
              </option>
            ))}
          </select>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            {(["all", "Meccan", "Medinan"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                  filterType === t
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "all" ? "All (114)" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Global Reciter, Translation & Typography Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-xs">
          {/* Reciter selector */}
          <div className="flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-medium">Qari:</span>
            <select
              value={selectedReciterId}
              onChange={(e) => handleReciterChange(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 text-emerald-300 font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500 max-w-[200px] truncate"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.arabicName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Translation language selector */}
            <div className="flex items-center gap-2">
              <Languages className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="text-slate-400 font-medium">Translation:</span>
              <select
                value={selectedTranslationId}
                onChange={(e) => handleTranslationChange(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
              >
                {TRANSLATION_EDITIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.language} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Typography Customizer Button */}
            <button
              onClick={() => setIsTypographyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-semibold transition shadow-sm"
              title="Change Arabic Calligraphy Font, Script, and Text Size"
            >
              <Type className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Arabic Style: <strong className="text-white">{activeFont.name}</strong>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                {FONT_SIZE_MAP[arabicFontSize].previewPx}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Surah List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSurahs.map((surah) => {
          const isOfflineCached = isSurahTextCached(
            surah.number,
            selectedScriptType,
            selectedTranslationId
          );
          const isLastRead = lastReadPos.surah === surah.number;

          return (
            <div
              key={surah.number}
              onClick={() => setSelectedSurahNumber(surah.number)}
              className="group cursor-pointer rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 p-4 transition-all hover:shadow-lg hover:shadow-emerald-950/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                {/* Surah Number Icon */}
                <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-emerald-500/15 border border-slate-700/60 group-hover:border-emerald-500/30 flex items-center justify-center font-mono font-bold text-sm text-slate-300 group-hover:text-emerald-400 transition">
                  {surah.number}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-semibold text-white group-hover:text-emerald-300 transition text-sm">
                      {surah.transliteration}
                    </h3>
                    {isOfflineCached && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-medium">
                        Offline Text
                      </span>
                    )}
                    {cachedSurahsMap[surah.number] && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-500/20 border border-teal-500/40 text-teal-300 font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-400" />
                        Audio Saved
                      </span>
                    )}
                    {isLastRead && (
                      <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {surah.translation} • {surah.totalAyahs} ayahs • Juz {surah.juz}
                  </p>
                </div>
              </div>

              {/* Arabic Name */}
              <div className="text-right">
                <span className="font-arabic text-xl font-bold text-slate-300 group-hover:text-emerald-400 transition">
                  {surah.name}
                </span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">
                  {surah.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Surah Reader Modal with Active Ayah Highlighting, Mushaf View & Hifdh Suite */}
      {selectedSurahNumber !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col">
          {/* Top Reader Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/90 shadow-lg">
            <div className="flex items-center gap-2.5">
              <button
                onClick={closeReader}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Close Reader"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Quick Prev / Next Surah navigation buttons */}
              <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-0.5">
                <button
                  onClick={() => surahDetail && advanceToNextSurah(surahDetail.number - 1, isPlaying)}
                  disabled={!surahDetail || surahDetail.number <= 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-25 text-slate-300 hover:text-white transition"
                  title="Previous Surah"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => surahDetail && advanceToNextSurah(surahDetail.number + 1, isPlaying)}
                  disabled={!surahDetail || surahDetail.number >= 114}
                  className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-25 text-slate-300 hover:text-white transition"
                  title="Next Surah"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h2 className="font-bold text-base text-white flex items-center gap-2">
                  {surahDetail?.transliteration || "Loading..."}
                  <span className="font-arabic text-emerald-400 font-normal">
                    {surahDetail?.name}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Surah {surahDetail?.number} • {surahDetail?.type} • {surahDetail?.totalAyahs} Verses
                </p>
              </div>
            </div>

            {/* Reader Mode, Hifdh Tools, Offline Audio & Playback Controls */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Reading View Toggle: Verse Cards vs Mushaf Flowing Page */}
              <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => handleReadingModeChange("cards")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                    readingMode === "cards"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Verse-by-Verse Study Cards"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  onClick={() => handleReadingModeChange("mushaf")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition ${
                    readingMode === "mushaf"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Continuous Flowing Mushaf Page View"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mushaf</span>
                </button>
              </div>

              {/* Hifdh Self-Test Blur Toggle */}
              <button
                onClick={() => {
                  setIsHifdhBlurMode(!isHifdhBlurMode);
                  setRevealedAyahs({});
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  isHifdhBlurMode
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                }`}
                title="Hifdh Memorization Self-Test: Blur verses and tap any verse to reveal"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">
                  {isHifdhBlurMode ? "Hifdh Test: ON" : "Hifdh Test"}
                </span>
              </button>

              {/* Ayah Range Loop Toggle */}
              <button
                onClick={() => setIsRangeLoopOpen(!isRangeLoopOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  rangeLoopEnabled
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                    : "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
                }`}
                title="Loop a range of verses (From Ayah X to Ayah Y)"
              >
                <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">
                  {rangeLoopEnabled ? `Loop ${rangeStartAyah}-${rangeEndAyah}` : "Range Loop"}
                </span>
              </button>

              {/* Offline Audio Download / Saved Status Button */}
              {isDownloadingAudio ? (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium animate-pulse"
                  title={`Saving audio files: ${downloadProgress.completed} of ${downloadProgress.total}`}
                >
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono">{downloadProgress.percentage}%</span>
                </div>
              ) : isSurahAudioDownloaded ? (
                <div className="flex items-center gap-1">
                  <span
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm"
                    title="Audio is saved locally for offline play on this device"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Offline</span>
                  </span>
                  <button
                    onClick={handleDeleteSurahAudio}
                    className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/30 transition text-xs"
                    title="Delete saved audio to free device storage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDownloadSurahAudio}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 text-xs text-slate-300 hover:text-emerald-300 font-medium border border-slate-700 hover:border-emerald-500/40 transition"
                  title="Download all verses of this Surah to listen offline"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Save Audio</span>
                </button>
              )}

              {/* Quick in-modal typography selector */}
              <button
                onClick={() => setIsTypographyModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-emerald-300 font-medium border border-slate-700 hover:border-emerald-500/50 transition"
                title="Change Arabic Font Style, Script, and Text Size"
              >
                <Type className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Aa</span>
              </button>

              <button
                onClick={togglePlayPause}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isPlaying
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                    : "bg-emerald-600/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/50"
                }`}
                title="Synchronized Audio Recitation"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-rose-300" />
                    <span>Pause ({activeAyahNumber})</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-emerald-300" />
                    <span>Recite ({activeAyahNumber})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ayah-Range Looper Configuration Bar (Expandable) */}
          {isRangeLoopOpen && surahDetail && (
            <div className="bg-slate-900/95 border-b border-amber-500/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Hifdh Range Looper:</span>
                </span>
                <label className="flex items-center gap-1.5 text-slate-300">
                  <span>From Verse</span>
                  <input
                    type="number"
                    min={1}
                    max={surahDetail.totalAyahs}
                    value={rangeStartAyah}
                    onChange={(e) =>
                      setRangeStartAyah(
                        Math.max(1, Math.min(surahDetail.totalAyahs, parseInt(e.target.value, 10) || 1))
                      )
                    }
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-center"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-slate-300">
                  <span>To Verse</span>
                  <input
                    type="number"
                    min={rangeStartAyah}
                    max={surahDetail.totalAyahs}
                    value={rangeEndAyah}
                    onChange={(e) =>
                      setRangeEndAyah(
                        Math.max(
                          rangeStartAyah,
                          Math.min(surahDetail.totalAyahs, parseInt(e.target.value, 10) || rangeStartAyah)
                        )
                      )
                    }
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-center"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextState = !rangeLoopEnabled;
                    setRangeLoopEnabled(nextState);
                    if (nextState) {
                      playSynchronizedAyah(rangeStartAyah, true);
                    }
                  }}
                  className={`px-3 py-1 rounded-xl font-bold transition ${
                    rangeLoopEnabled
                      ? "bg-amber-500 text-slate-950"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {rangeLoopEnabled ? "Stop Range Loop" : "Start Range Loop"}
                </button>
                <button
                  onClick={() => setIsRangeLoopOpen(false)}
                  className="text-slate-400 hover:text-white px-2"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Reader Content Area with Smooth Auto-Scrolling */}
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-6 pb-28">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm">Loading verses ({activeTranslation.language})...</p>
              </div>
            ) : surahDetail ? (
              <>
                {/* Surah Header Card */}
                <div className="rounded-3xl bg-gradient-to-b from-emerald-950/60 to-slate-900 border border-emerald-800/40 p-6 text-center space-y-3 shadow-xl">
                  <h3 className="text-2xl font-bold text-white">
                    {surahDetail.transliteration}
                  </h3>
                  <p className="text-sm text-emerald-300">
                    {surahDetail.translation} • {surahDetail.type} ({surahDetail.totalAyahs} Ayahs)
                  </p>
                  <p className="text-xs text-slate-400">
                    Qari: <strong className="text-slate-200">{activeReciter.name}</strong> • Translation:{" "}
                    <strong className="text-slate-200">
                      {activeTranslation.language} ({activeTranslation.name})
                    </strong>
                  </p>

                  {/* Opening Bismillah Card (Surahs 2–114, except Surah 9 At-Tawbah) */}
                  {surahDetail.number !== 9 && surahDetail.number !== 1 && (
                    <div
                      id="ayah-0"
                      onClick={() => {
                        if (isPlaying && activeAyahNumber !== 0) {
                          playSynchronizedAyah(0, true);
                        } else if (!isPlaying && activeAyahNumber !== 0) {
                          setActiveAyahNumber(0);
                        }
                      }}
                      className={`pt-4 pb-3 px-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        loopingAyahNumber === 0
                          ? "bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-amber-500/70 ring-2 ring-amber-500/50 shadow-2xl shadow-amber-950/80"
                          : activeAyahNumber === 0
                          ? "bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/60 shadow-2xl shadow-emerald-950/90"
                          : "bg-slate-900/50 border-emerald-900/40 hover:border-emerald-700/60 hover:bg-slate-900/70"
                      }`}
                    >
                      {/* Bismillah Header Action Bar */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-900/40">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition ${
                              loopingAyahNumber === 0
                                ? "bg-amber-500 text-slate-950 border-amber-400"
                                : activeAyahNumber === 0
                                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                : "bg-slate-800 text-emerald-300 border-slate-700"
                            }`}
                          >
                            Opening • بداية
                          </span>

                          {loopingAyahNumber === 0 ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[11px] font-semibold animate-pulse">
                              <Repeat1 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                              <span>Repeating until stopped • تكرار</span>
                            </div>
                          ) : activeAyahNumber === 0 && isPlaying ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold animate-pulse">
                              <span className="flex items-end gap-0.5 h-3">
                                <span className="w-0.5 h-2 bg-emerald-400 animate-eq-1" />
                                <span className="w-0.5 h-3 bg-emerald-400 animate-eq-2" />
                                <span className="w-0.5 h-1.5 bg-emerald-400 animate-eq-3" />
                              </span>
                              <span>Reciting Bismillah • يُتلى البسملة</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLoopAyah(0);
                            }}
                            className={`p-1.5 rounded-xl border text-xs transition flex items-center gap-1 ${
                              loopingAyahNumber === 0
                                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-950/60 font-bold"
                                : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-300"
                            }`}
                            title={
                              loopingAyahNumber === 0
                                ? "Stop repeating Bismillah"
                                : "Repeat Bismillah until stopped"
                            }
                          >
                            <Repeat1 className={`w-3.5 h-3.5 ${loopingAyahNumber === 0 ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline text-[10px]">Repeat</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeAyahNumber === 0 && isPlaying) {
                                togglePlayPause();
                              } else {
                                playSynchronizedAyah(0, true);
                              }
                            }}
                            className={`p-1.5 rounded-xl border text-xs transition flex items-center gap-1 ${
                              activeAyahNumber === 0 && isPlaying
                                ? "bg-rose-500 hover:bg-rose-400 text-white border-rose-400 shadow-md shadow-rose-950/50"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950/50"
                            }`}
                            title={activeAyahNumber === 0 && isPlaying ? "Pause Bismillah" : "Listen to Bismillah"}
                          >
                            {activeAyahNumber === 0 && isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-white" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                            )}
                            <span className="hidden sm:inline text-[10px]">
                              {activeAyahNumber === 0 && isPlaying ? "Pause" : "Listen"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <p
                        dir="rtl"
                        className={`${activeFont.fontFamilyClass} ${FONT_SIZE_MAP[arabicFontSize].arabic} text-emerald-300 font-bold text-center leading-relaxed`}
                      >
                        {selectedScriptType === "quran-uthmani"
                          ? "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
                          : "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                      </p>
                      <p className="text-xs text-slate-400 text-center mt-1">
                        In the Name of Allah, the Entirely Merciful, the Especially Merciful
                      </p>
                    </div>
                  )}
                </div>

                {/* READING VIEW 1: CONTINUOUS FLOWING MUSHAF PAGE VIEW */}
                {readingMode === "mushaf" ? (
                  <div className="space-y-4">
                    <div className="rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900/95 border-2 border-emerald-700/40 p-6 sm:p-10 shadow-2xl">
                      <div
                        dir="rtl"
                        className={`${activeFont.fontFamilyClass} ${FONT_SIZE_MAP[arabicFontSize].arabic} text-right leading-[2.7] tracking-normal select-text`}
                      >
                        {surahDetail.ayahs.map((ayah) => {
                          const isEmphasized = activeAyahNumber === ayah.numberInSurah;
                          const isBlurred = isHifdhBlurMode && !revealedAyahs[ayah.numberInSurah];
                          return (
                            <span
                              id={`ayah-${ayah.numberInSurah}`}
                              key={ayah.numberInSurah}
                              onClick={() => {
                                if (isHifdhBlurMode) {
                                  setRevealedAyahs((prev) => ({
                                    ...prev,
                                    [ayah.numberInSurah]: !prev[ayah.numberInSurah],
                                  }));
                                }
                                if (isPlaying && activeAyahNumber !== ayah.numberInSurah) {
                                  playSynchronizedAyah(ayah.numberInSurah, true);
                                } else {
                                  setActiveAyahNumber(ayah.numberInSurah);
                                }
                              }}
                              className={`inline cursor-pointer rounded-xl px-1.5 py-0.5 transition-all duration-200 ${
                                isEmphasized
                                  ? "bg-emerald-500/20 text-emerald-300 font-bold ring-1 ring-emerald-500/40"
                                  : "text-white hover:bg-slate-800/70"
                              } ${isBlurred ? "blur-md select-none" : ""}`}
                            >
                              {ayah.textArabic}{" "}
                              <span className="inline-flex items-center justify-center px-1.5 mx-1 text-emerald-400 font-normal text-[0.75em]">
                                ﴿{toArabicIndicDigits(ayah.numberInSurah)}﴾
                              </span>{" "}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Verse Translation & Study Card Below Mushaf */}
                    {(() => {
                      const activeAyahObj =
                        surahDetail.ayahs.find((a) => a.numberInSurah === activeAyahNumber) ||
                        surahDetail.ayahs[0];
                      if (!activeAyahObj) return null;
                      const bookmarked = isAyahBookmarked(
                        surahDetail.number,
                        activeAyahObj.numberInSurah
                      );
                      return (
                        <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">
                              Selected Verse {surahDetail.number}:{activeAyahObj.numberInSurah} •{" "}
                              {activeTranslation.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  toggleBookmarkAyah(
                                    surahDetail.number,
                                    surahDetail.transliteration,
                                    activeAyahObj.numberInSurah
                                  )
                                }
                                className={`p-1.5 rounded-lg border text-xs ${
                                  bookmarked
                                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                    : "bg-slate-800 border-slate-700 text-slate-400"
                                }`}
                                title="Bookmark Verse"
                              >
                                <Bookmark
                                  className={`w-3.5 h-3.5 ${bookmarked ? "fill-amber-400 text-amber-400" : ""}`}
                                />
                              </button>
                              <button
                                onClick={() => handleToggleTafsir(activeAyahObj.numberInSurah)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-300 font-semibold border border-slate-700"
                              >
                                Tafsir
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed">
                            {activeAyahObj.textEnglish}
                          </p>
                          {openTafsirAyah === activeAyahObj.numberInSurah && (
                            <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                              {tafsirDataMap[`${surahDetail.number}:${activeAyahObj.numberInSurah}`]
                                ?.loading ? (
                                <p className="text-slate-400">Loading Tafsir Al-Muyassar...</p>
                              ) : (
                                <>
                                  <p
                                    dir="rtl"
                                    className="font-arabic text-base text-emerald-200 leading-relaxed text-right"
                                  >
                                    {
                                      tafsirDataMap[
                                        `${surahDetail.number}:${activeAyahObj.numberInSurah}`
                                      ]?.arabicTafsir
                                    }
                                  </p>
                                  <p className="text-slate-300">
                                    {
                                      tafsirDataMap[
                                        `${surahDetail.number}:${activeAyahObj.numberInSurah}`
                                      ]?.englishTafsir
                                    }
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* READING VIEW 2: VERSE-BY-VERSE STUDY CARDS */
                  <div className="space-y-4">
                    {surahDetail.ayahs.map((ayah) => {
                      const isEmphasized = activeAyahNumber === ayah.numberInSurah;
                      const isAudioActive = isEmphasized && isPlaying;
                      const isLoopingThisAyah = loopingAyahNumber === ayah.numberInSurah;
                      const isBookmarked = isAyahBookmarked(surahDetail.number, ayah.numberInSurah);
                      const isBlurred = isHifdhBlurMode && !revealedAyahs[ayah.numberInSurah];
                      const tafsirKey = `${surahDetail.number}:${ayah.numberInSurah}`;
                      const isTafsirOpen = openTafsirAyah === ayah.numberInSurah;

                      return (
                        <div
                          id={`ayah-${ayah.numberInSurah}`}
                          key={ayah.numberInSurah}
                          onClick={() => {
                            if (isHifdhBlurMode) {
                              setRevealedAyahs((prev) => ({
                                ...prev,
                                [ayah.numberInSurah]: !prev[ayah.numberInSurah],
                              }));
                            }
                            if (isPlaying && activeAyahNumber !== ayah.numberInSurah) {
                              playSynchronizedAyah(ayah.numberInSurah, true);
                            } else {
                              setActiveAyahNumber(ayah.numberInSurah);
                            }
                          }}
                          className={`rounded-2xl p-5 border transition-all duration-300 cursor-pointer ${
                            isLoopingThisAyah
                              ? "bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border-amber-500/70 ring-2 ring-amber-500/50 shadow-2xl shadow-amber-950/80 scale-[1.01]"
                              : isEmphasized
                              ? "bg-gradient-to-r from-emerald-950/75 via-slate-900 to-emerald-950/75 border-emerald-400 ring-2 ring-emerald-500/60 shadow-2xl shadow-emerald-950/90 scale-[1.01]"
                              : "bg-slate-900/60 border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/80"
                          }`}
                        >
                          {/* Top Ayah Indicator Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/60 mb-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-8 h-8 rounded-xl text-xs font-mono font-bold flex items-center justify-center border transition ${
                                  isLoopingThisAyah
                                    ? "bg-amber-500 text-slate-950 border-amber-400 ring-4 ring-amber-500/30"
                                    : isEmphasized
                                    ? "bg-emerald-500 text-slate-950 border-emerald-400 ring-4 ring-emerald-500/30"
                                    : "bg-slate-800 text-slate-300 border-slate-700"
                                }`}
                              >
                                {ayah.numberInSurah}
                              </span>

                              {isLoopingThisAyah ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[11px] font-semibold animate-pulse">
                                  <Repeat1 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                                  <span>
                                    Loop {hifzCurrentLoop} of{" "}
                                    {hifzRepeatTarget === 99 ? "∞" : hifzRepeatTarget} • تكرار
                                  </span>
                                </div>
                              ) : isEmphasized ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold animate-pulse">
                                  {isAudioActive ? (
                                    <>
                                      <span className="flex items-end gap-0.5 h-3">
                                        <span className="w-0.5 h-2 bg-emerald-400 animate-eq-1" />
                                        <span className="w-0.5 h-3 bg-emerald-400 animate-eq-2" />
                                        <span className="w-0.5 h-1.5 bg-emerald-400 animate-eq-3" />
                                      </span>
                                      <span>Reciting Now • يُتلى الآن</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3 h-3 text-emerald-400" />
                                      <span>Reading Focus</span>
                                    </>
                                  )}
                                </div>
                              ) : null}
                            </div>

                            {/* Action Buttons: Bookmark, Copy, Tafsir, Repeat Loop, Card Studio & Play/Pause */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Bookmark Verse Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmarkAyah(
                                    surahDetail.number,
                                    surahDetail.transliteration,
                                    ayah.numberInSurah
                                  );
                                }}
                                className={`p-1.5 rounded-xl border text-xs transition ${
                                  isBookmarked
                                    ? "bg-amber-500/20 border-amber-500/60 text-amber-300"
                                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-amber-300"
                                }`}
                                title={isBookmarked ? "Remove Bookmark" : "Bookmark this Verse"}
                              >
                                <Bookmark
                                  className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`}
                                />
                              </button>

                              {/* Copy Verse Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyAyah(
                                    ayah.numberInSurah,
                                    ayah.textArabic,
                                    ayah.textEnglish
                                  );
                                }}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-emerald-300 transition text-xs"
                                title="Copy Verse Arabic & Translation"
                              >
                                {copiedAyahNum === ayah.numberInSurah ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Tafsir Drawer Toggle Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTafsir(ayah.numberInSurah);
                                }}
                                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                  isTafsirOpen
                                    ? "bg-teal-500/20 border-teal-500/60 text-teal-300"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-teal-300 border-slate-700"
                                }`}
                                title="Read Verse Tafsir (Al-Muyassar & Study Commentary)"
                              >
                                <FileText className="w-3.5 h-3.5 text-teal-400" />
                                <span className="text-[11px] hidden sm:inline">Tafsir</span>
                              </button>

                              {/* Single Verse Hifz Repeat Loop Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleLoopAyah(ayah.numberInSurah);
                                }}
                                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                  isLoopingThisAyah
                                    ? "bg-amber-500/25 border-amber-500/70 text-amber-300 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/40"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border-slate-700"
                                }`}
                                title={
                                  isLoopingThisAyah
                                    ? "Click to stop repeating this verse"
                                    : "Repeat this verse for memorization (Hifz Loop)"
                                }
                              >
                                <Repeat1
                                  className={`w-3.5 h-3.5 ${isLoopingThisAyah ? "text-amber-400" : ""}`}
                                />
                                <span className="text-[11px]">
                                  {isLoopingThisAyah ? "Looping" : "Repeat"}
                                </span>
                              </button>

                              {/* Cycle Loop Target (3x, 5x, 10x, Infinite) if looping */}
                              {isLoopingThisAyah && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const targets = [3, 5, 10, 99];
                                    const nextIdx =
                                      (targets.indexOf(hifzRepeatTarget) + 1) % targets.length;
                                    setHifzRepeatTarget(targets[nextIdx]);
                                  }}
                                  className="text-[10px] font-mono font-bold px-1.5 py-1 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-500/50 hover:bg-amber-500/40 transition"
                                  title="Click to change target loops: 3x, 5x, 10x, or Infinite"
                                >
                                  {hifzRepeatTarget === 99 ? "∞" : `${hifzRepeatTarget}x`}
                                </button>
                              )}

                              {/* Create Card Button */}
                              {onOpenCardStudio && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenCardStudio({
                                      arabic: ayah.textArabic,
                                      english: ayah.textEnglish,
                                      reference: `Surah ${surahDetail.transliteration} (${surahDetail.number}:${ayah.numberInSurah})`,
                                    });
                                  }}
                                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 text-slate-400 border border-slate-700 transition"
                                  title="Create shareable card for this Ayah in Studio"
                                >
                                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-[11px] hidden sm:inline">Card</span>
                                </button>
                              )}

                              {/* Play/Pause Button for this single Ayah */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isAudioActive) {
                                    togglePlayPause();
                                  } else {
                                    if (
                                      loopingAyahNumber !== null &&
                                      loopingAyahNumber !== ayah.numberInSurah
                                    ) {
                                      setLoopingAyahNumber(null);
                                      loopingAyahNumberRef.current = null;
                                    }
                                    playSynchronizedAyah(ayah.numberInSurah, true);
                                  }
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                  isAudioActive
                                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border-slate-700"
                                }`}
                                title={isAudioActive ? "Pause Audio" : "Listen in Sync"}
                              >
                                {isAudioActive ? (
                                  <>
                                    <Pause className="w-3.5 h-3.5 fill-rose-300" />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Listen</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Arabic Ayah Text */}
                          <p
                            dir="rtl"
                            className={`${activeFont.fontFamilyClass} text-right transition-all pb-4 ${
                              FONT_SIZE_MAP[arabicFontSize].arabic
                            } ${
                              isEmphasized
                                ? "text-emerald-300 font-bold drop-shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                                : "text-white font-medium"
                            } ${isBlurred ? "blur-md select-none" : ""}`}
                          >
                            {ayah.textArabic}
                          </p>

                          {/* Translation Text */}
                          <p
                            className={`text-sm leading-relaxed pt-2 transition-all ${
                              isEmphasized ? "text-white font-medium" : "text-slate-400"
                            } ${isBlurred ? "blur-sm select-none" : ""}`}
                          >
                            {ayah.textEnglish}
                          </p>

                          {/* Expandable Tafsir Commentary Drawer */}
                          {isTafsirOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-4 space-y-2.5 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                                  Tafsir Al-Muyassar & Commentary ({surahDetail.number}:{ayah.numberInSurah})
                                </span>
                                <button
                                  onClick={() => setOpenTafsirAyah(null)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  Hide
                                </button>
                              </div>
                              {tafsirDataMap[tafsirKey]?.loading ? (
                                <p className="text-slate-400">Loading commentary...</p>
                              ) : (
                                <>
                                  <p
                                    dir="rtl"
                                    className="font-arabic text-base sm:text-lg text-emerald-200 leading-relaxed text-right"
                                  >
                                    {tafsirDataMap[tafsirKey]?.arabicTafsir}
                                  </p>
                                  <p className="text-slate-300 leading-relaxed">
                                    {tafsirDataMap[tafsirKey]?.englishTafsir}
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Docked Synchronized Audio Player Bar */}
          {surahDetail && (
            <div className="sticky bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-emerald-500/30 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] relative">
              {/* Floating notification when advancing to next Surah */}
              {surahTransitionNotice && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 text-emerald-300 border border-emerald-500/60 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Advancing to {surahTransitionNotice}</span>
                </div>
              )}

              {/* Floating notification when new reciter is queued for next verse */}
              {reciterChangeNotice && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 text-emerald-300 border border-emerald-500/60 px-3.5 py-1 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{reciterChangeNotice}</span>
                </div>
              )}

              {/* Micro Audio Progress Bar */}
              <div className="w-full bg-slate-800 h-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                  style={{
                    width: `${
                      audioProgress.duration > 0
                        ? Math.min(100, (audioProgress.currentTime / audioProgress.duration) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                {/* Left: Active Verse Info & Time */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    {isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3.5">
                        <span className="w-0.5 h-2 bg-emerald-400 animate-eq-1" />
                        <span className="w-0.5 h-3.5 bg-emerald-400 animate-eq-2" />
                        <span className="w-0.5 h-1.5 bg-emerald-400 animate-eq-3" />
                      </div>
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                        {surahDetail.transliteration}
                      </h4>
                      {activeAyahNumber === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] sm:text-[11px] font-semibold shrink-0 animate-pulse">
                          Bismillah • Opening
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] sm:text-[11px] font-semibold shrink-0">
                          Verse {activeAyahNumber} of {surahDetail.totalAyahs}
                        </span>
                      )}
                      {loopingAyahNumber !== null && (
                        <button
                          onClick={() => {
                            setLoopingAyahNumber(null);
                            loopingAyahNumberRef.current = null;
                          }}
                          className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2 py-0.5 rounded-md font-semibold transition"
                          title="Click to cancel verse repeat loop"
                        >
                          <Repeat1 className="w-2.5 h-2.5 text-amber-400" />
                          <span>Looping {loopingAyahNumber === 0 ? "Bismillah" : loopingAyahNumber}</span>
                          <X className="w-2.5 h-2.5 ml-0.5" />
                        </button>
                      )}
                      {isSurahAudioDownloaded && (
                        <span
                          className="hidden md:inline-flex items-center gap-1 text-[10px] text-teal-300 bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.5 rounded-md font-medium"
                          title="Playing from local offline storage"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-teal-400" />
                          Offline
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 bg-slate-800/90 hover:bg-slate-800 px-1.5 py-0.5 rounded-lg border border-slate-700/60 transition">
                        <Mic className="w-3 h-3 text-emerald-400 shrink-0" />
                        <select
                          value={selectedReciterId}
                          onChange={(e) => handleReciterChange(e.target.value)}
                          className="bg-transparent text-emerald-300 font-medium focus:outline-none cursor-pointer text-[11px] max-w-[120px] sm:max-w-[160px] truncate"
                          title="Change reciter mid-recitation"
                        >
                          {RECITERS.map((r) => (
                            <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span>•</span>
                      <span className="font-mono">
                        {formatTime(audioProgress.currentTime)} / {formatTime(audioProgress.duration)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Playback Controls (Prev, Play/Pause, Next, Auto-advance) */}
                <div className="flex items-center gap-2 sm:gap-2.5 mx-auto sm:mx-0">
                  <button
                    onClick={playPreviousAyah}
                    disabled={
                      activeAyahNumber <=
                        (surahDetail.number === 9 || surahDetail.number === 1 ? 1 : 0) &&
                      surahDetail.number <= 1
                    }
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition"
                    title="Previous Verse"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition shadow-lg ${
                      isPlaying
                        ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-950/50"
                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60 ring-2 ring-emerald-400/50"
                    }`}
                    title={isPlaying ? "Pause Recitation" : "Start Synchronized Recitation"}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={playNextAyah}
                    disabled={
                      activeAyahNumber >= surahDetail.totalAyahs && surahDetail.number >= 114
                    }
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition"
                    title="Next Verse"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleContinuousPlay}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                      isContinuousPlay
                        ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold ring-1 ring-emerald-500/30 shadow-sm"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                    title="Continuous Play: Automatically move to next verse"
                  >
                    <Repeat className={`w-3.5 h-3.5 ${isContinuousPlay ? "text-emerald-400" : ""}`} />
                    <span className="text-[11px] font-medium">
                      Auto:{" "}
                      <strong className={isContinuousPlay ? "text-emerald-300" : "text-slate-400"}>
                        {isContinuousPlay ? "ON" : "OFF"}
                      </strong>
                    </span>
                  </button>
                </div>

                {/* Right: Auto-Center & Speed Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
                      isAutoScrollEnabled
                        ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                    title={
                      isAutoScrollEnabled
                        ? "Auto-center view on reciting verse: Enabled"
                        : "Auto-center view: Disabled"
                    }
                  >
                    {isAutoScrollEnabled ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline text-[11px]">
                      {isAutoScrollEnabled ? "Auto-Center" : "Manual"}
                    </span>
                  </button>

                  <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-0.5 text-[10px]">
                    {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-1.5 sm:px-2 py-0.5 rounded-lg font-medium transition ${
                          playbackSpeed === speed
                            ? "bg-emerald-600 text-white font-bold"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Arabic Typography & Script Modal */}
      {isTypographyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Arabic Typography & Script</h3>
                  <p className="text-xs text-slate-400">
                    Customize Quran writing style, script, and font size
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTypographyModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Live Interactive Preview Box */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-2 shadow-inner">
                <div className="text-[11px] uppercase tracking-wider text-emerald-400/80 font-semibold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Live Preview • {activeFont.name} ({FONT_SIZE_MAP[arabicFontSize].previewPx})
                  </span>
                </div>
                <div
                  dir="rtl"
                  className={`${activeFont.fontFamilyClass} ${FONT_SIZE_MAP[arabicFontSize].arabic} text-emerald-300 font-bold transition-all duration-200 py-2`}
                >
                  {selectedScriptType === "quran-uthmani"
                    ? "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
                    : "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                </div>
                <p dir="rtl" className="text-xs text-slate-400 font-arabic">
                  {selectedScriptType === "quran-uthmani"
                    ? "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ • الرَّحْمَـٰنِ الرَّحِيمِ • مَـٰلِكِ يَوْمِ الدِّينِ"
                    : "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ • الرَّحْمَٰنِ الرَّحِيمِ • مَالِكِ يَوْمِ الدِّينِ"}
                </p>
              </div>

              {/* Section 1: Font Calligraphy Styles (5 Options) */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  1. Choose Calligraphy / Font Style • اختر نوع الخط
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ARABIC_FONTS.map((font) => {
                    const isSelected = selectedFontId === font.id;
                    return (
                      <button
                        key={font.id}
                        onClick={() => handleFontChange(font.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                            {font.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <div
                          dir="rtl"
                          className={`${font.fontFamilyClass} text-xl text-emerald-300 py-1 text-right w-full`}
                        >
                          {font.arabicName}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {font.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Quranic Script Orthography (2 Options) */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  2. Quranic Script & Spelling • الرسم القرآني
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ARABIC_SCRIPTS.map((script) => {
                    const isSelected = selectedScriptType === script.id;
                    return (
                      <button
                        key={script.id}
                        onClick={() => handleScriptChange(script.id)}
                        className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                          isSelected
                            ? "bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-semibold text-xs text-white">{script.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                        <div
                          dir="rtl"
                          className="font-arabic text-lg text-emerald-300 py-0.5 text-right w-full"
                        >
                          {script.arabicName}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{script.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Font Size Scaling */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    3. Arabic Font Size • حجم الخط
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {FONT_SIZE_MAP[arabicFontSize].label} ({FONT_SIZE_MAP[arabicFontSize].previewPx})
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(["normal", "large", "xl", "2xl"] as ArabicFontSize[]).map((size) => {
                    const isSelected = arabicFontSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => handleFontSizeChange(size)}
                        className={`py-2.5 px-2 rounded-xl border text-xs font-semibold text-center transition ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-900/50"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div>{FONT_SIZE_MAP[size].label}</div>
                        <div className="text-[10px] opacity-75 font-mono">
                          {FONT_SIZE_MAP[size].previewPx}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Settings saved locally
              </span>
              <button
                onClick={() => setIsTypographyModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
              >
                Apply & Read
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
