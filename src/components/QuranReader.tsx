"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  SurahMeta,
  SurahDetail,
  AyahItem,
  ArabicFontId,
  ArabicScriptType,
  ArabicFontSize,
} from "@/types";
import {
  SURAH_LIST,
  fetchSurahDetail,
  OFFLINE_SURAHS,
  getSurahAudioUrl,
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
  VolumeX,
  X,
  Languages,
  Mic,
  Sparkles,
  Repeat,
  Radio,
  CheckCircle2,
  Type,
  Check,
  SkipBack,
  SkipForward,
  Eye,
  EyeOff,
  Download,
  Trash2,
  HardDrive,
  Repeat1,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const QuranReader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "Meccan" | "Medinan">("all");

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

  // Persistent audio elements and ref mirrors to prevent stale closure and browser autoplay blocks
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioPreloadRef = useRef<HTMLAudioElement | null>(null);

  const isContinuousPlayRef = useRef<boolean>(isContinuousPlay);
  const surahDetailRef = useRef<SurahDetail | null>(surahDetail);
  const selectedReciterIdRef = useRef<string>(selectedReciterId);
  const activeAyahNumberRef = useRef<number>(activeAyahNumber);
  const playbackSpeedRef = useRef<number>(playbackSpeed);
  const isPlayingRef = useRef<boolean>(isPlaying);

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
  }, [activeAyahNumber]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Bookmark stored locally
  const [bookmarkedSurah, setBookmarkedSurah] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_last_surah");
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });

  const activeReciter = RECITERS.find((r) => r.id === selectedReciterId) || RECITERS[0];
  const activeTranslation =
    TRANSLATION_EDITIONS.find((t) => t.id === selectedTranslationId) || TRANSLATION_EDITIONS[0];
  const activeFont = ARABIC_FONTS.find((f) => f.id === selectedFontId) || ARABIC_FONTS[0];
  const activeScript = ARABIC_SCRIPTS.find((s) => s.id === selectedScriptType) || ARABIC_SCRIPTS[0];

  const FONT_SIZE_MAP: Record<ArabicFontSize, { arabic: string; label: string; previewPx: string }> = {
    normal: { arabic: "text-xl sm:text-2xl leading-[2.3]", label: "Normal", previewPx: "24px" },
    large: { arabic: "text-2xl sm:text-3xl leading-[2.5]", label: "Large", previewPx: "30px" },
    xl: { arabic: "text-3xl sm:text-4xl leading-[2.7]", label: "Extra Large", previewPx: "36px" },
    "2xl": { arabic: "text-4xl sm:text-5xl leading-[2.9]", label: "Huge", previewPx: "44px" },
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
  }, [activeAyahNumber, isAutoScrollEnabled]);

  // Stop & clear all audio elements
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
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

  // Toggle single-verse repeat loop (Repeat until stopped)
  const handleToggleLoopAyah = (ayahNum: number) => {
    if (loopingAyahNumber === ayahNum) {
      setLoopingAyahNumber(null);
      loopingAyahNumberRef.current = null;
    } else {
      setLoopingAyahNumber(ayahNum);
      loopingAyahNumberRef.current = ayahNum;
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

    // Check offline cache first; if not present, stream and auto-cache in background
    let audioSrcToPlay = currentUrl;
    try {
      const offlineBlobUrl = await getOfflineAudioUrl(currentUrl);
      if (offlineBlobUrl) {
        audioSrcToPlay = offlineBlobUrl;
      } else {
        // Smart auto-cache in background
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

    // Auto-advance to next verse, repeat loop, or advance to next Surah
    audio.onended = () => {
      const curDetail = surahDetailRef.current;
      const curAyah = activeAyahNumberRef.current;
      const autoAdvance = isContinuousPlayRef.current;
      const loopAyah = loopingAyahNumberRef.current;

      console.log(`[Quran Audio] Verse ${curAyah} ended. LoopAyah: ${loopAyah}, AutoAdvance: ${autoAdvance}`);

      // 1. Single-Verse Infinite Repeat Mode (Repeat Until Stopped)
      if (loopAyah !== null && loopAyah === curAyah) {
        setTimeout(() => {
          playSynchronizedAyah(curAyah, true);
        }, 120);
        return;
      }

      // 2. Opening Bismillah (Ayah 0) seamlessly transitions to Ayah 1; or Normal Auto-Advance within Current Surah
      if (curAyah === 0 || (autoAdvance && curDetail && curAyah < curDetail.totalAyahs)) {
        if (curDetail && curAyah < curDetail.totalAyahs) {
          const nextAyah = curAyah + 1;
          playSynchronizedAyah(nextAyah, true);
          return;
        }
      }

      // 3. Current Surah Completed -> Cross-Surah Auto-Advance to Next Surah
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

    // Preload next verse (checking local cache or EveryAyah)
    if (clampedAyah < detail.totalAyahs) {
      const nextUrl = getAyahAudioUrl(detail.number, clampedAyah + 1, selectedReciterIdRef.current);
      getOfflineAudioUrl(nextUrl).then((cachedNext) => {
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
        // Prebuffer the NEXT verse with the newly chosen reciter so transition is instant
        const nextUrl = getAyahAudioUrl(detail.number, currentAyah + 1, id);
        if (!nextAudioPreloadRef.current) {
          nextAudioPreloadRef.current = new Audio();
        }
        nextAudioPreloadRef.current.src = nextUrl;
        nextAudioPreloadRef.current.preload = "auto";

        // Display notice that the new reciter will take effect on next verse
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
      // If paused or stopped, clear any notice
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

  // Filtered surah list
  const filteredSurahs = SURAH_LIST.filter((s) => {
    const matchesSearch =
      s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.includes(searchQuery) ||
      s.number.toString() === searchQuery.trim();
    const matchesType = filterType === "all" || s.type === filterType;
    return matchesSearch && matchesType;
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
        const startAyah = data.number === 9 || data.number === 1 ? 1 : 0;
        setActiveAyahNumber(startAyah);
        activeAyahNumberRef.current = startAyah;
        localStorage.setItem("noor_last_surah", String(selectedSurahNumber));
        setBookmarkedSurah(selectedSurahNumber);

        // If cross-surah auto-advance is active, immediately begin reciting the new Surah (starting from Bismillah if applicable)
        if (isAutoAdvancingNextSurahRef.current) {
          isAutoAdvancingNextSurahRef.current = false;
          setTimeout(() => {
            playSynchronizedAyah(startAyah, true);
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
        artwork: [
          { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

      navigator.mediaSession.setActionHandler("play", () => {
        togglePlayPause();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        togglePlayPause();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        playPreviousAyah();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        playNextAyah();
      });
    } catch (err) {
      console.warn("[MediaSession] Error setting metadata/handlers:", err);
    }
  }, [isPlaying, activeAyahNumber, selectedSurahNumber, selectedReciterId, surahDetail, loopingAyahNumber]);

  return (
    <div className="space-y-6">
      {/* Top Controls: Search + Reciter & Language Selectors */}
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
              <span>Arabic Style: <strong className="text-white">{activeFont.name}</strong></span>
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
          const isOfflineCached = Boolean(OFFLINE_SURAHS[surah.number]);
          const isLastRead = bookmarkedSurah === surah.number;

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
                  <div className="flex items-center gap-2">
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
                    {surah.translation} • {surah.totalAyahs} ayahs
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

      {/* Full Surah Reader Modal with Active Ayah Highlighting & Auto-scroll */}
      {selectedSurahNumber !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col">
          {/* Top Reader Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 shadow-lg">
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

            {/* Playback Controls & Continuous Toggle */}
            <div className="flex items-center gap-2">
              {/* Offline Audio Download / Saved Status Button */}
              {isDownloadingAudio ? (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium animate-pulse"
                  title={`Saving audio files: ${downloadProgress.completed} of ${downloadProgress.total}`}
                >
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Saving</span>
                  <span className="font-mono">{downloadProgress.percentage}%</span>
                </div>
              ) : isSurahAudioDownloaded ? (
                <div className="flex items-center gap-1">
                  <span
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm"
                    title="Audio is saved locally for offline play on this device"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Offline Ready</span>
                    <span className="sm:hidden">Saved</span>
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
                  <span className="hidden sm:inline">Save Offline</span>
                  <span className="sm:hidden">Save</span>
                </button>
              )}

              {/* Quick in-modal reciter selector */}
              <div className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs">
                <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <select
                  value={selectedReciterId}
                  onChange={(e) => handleReciterChange(e.target.value)}
                  className="bg-transparent text-emerald-300 font-medium focus:outline-none cursor-pointer text-xs pr-1 max-w-[120px] sm:max-w-[180px] truncate"
                  title="Switch reciter mid-recitation"
                >
                  {RECITERS.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick in-modal typography selector */}
              <button
                onClick={() => setIsTypographyModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-emerald-300 font-medium border border-slate-700 hover:border-emerald-500/50 transition"
                title="Change Arabic Font Style, Script, and Text Size"
              >
                <Type className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Aa Style</span>
              </button>

              {/* Auto-Center Toggle */}
              <button
                onClick={() => setIsAutoScrollEnabled(!isAutoScrollEnabled)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                  isAutoScrollEnabled
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-medium"
                    : "bg-slate-800/80 border-slate-700 text-slate-500"
                }`}
                title={isAutoScrollEnabled ? "Auto-center view on active verse: Enabled" : "Auto-center view: Disabled"}
              >
                {isAutoScrollEnabled ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">Auto-Center</span>
              </button>

              <button
                onClick={toggleContinuousPlay}
                className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                  isContinuousPlay
                    ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold ring-1 ring-emerald-500/30 shadow-sm"
                    : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
                title="Continuous Play: Automatically move to next verse"
              >
                <Repeat className={`w-3.5 h-3.5 ${isContinuousPlay ? "text-emerald-400" : ""}`} />
                <span>Auto-Advance: <strong className={isContinuousPlay ? "text-emerald-300" : "text-slate-400"}>{isContinuousPlay ? "ON" : "OFF"}</strong></span>
              </button>

              <button
                onClick={togglePlayPause}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isPlaying
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                    : "bg-emerald-600/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/50"
                }`}
                title="Synchronized Audio Recitation"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-rose-300" />
                    <span>Pause (Ayah {activeAyahNumber})</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-emerald-300" />
                    <span>Recite (Ayah {activeAyahNumber})</span>
                  </>
                )}
              </button>
            </div>
          </div>

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
                    Qari: <strong className="text-slate-200">{activeReciter.name}</strong> • Translation: <strong className="text-slate-200">{activeTranslation.language} ({activeTranslation.name})</strong>
                  </p>

                  {/* Offline Recitation Banner & Download Progress */}
                  <div className="pt-2 pb-1 flex flex-col items-center justify-center">
                    {isDownloadingAudio ? (
                      <div className="w-full max-w-sm bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
                          <span className="flex items-center gap-1.5">
                            <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                            Downloading {activeReciter.name}&apos;s recitation...
                          </span>
                          <span className="font-mono">{downloadProgress.completed}/{downloadProgress.total} ({downloadProgress.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/60">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
                            style={{ width: `${downloadProgress.percentage}%` }}
                          />
                        </div>
                      </div>
                    ) : isSurahAudioDownloaded ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>All {surahDetail.totalAyahs} verses saved for offline listening ({activeReciter.name})</span>
                        <button
                          onClick={handleDeleteSurahAudio}
                          className="ml-1 text-[11px] text-slate-400 hover:text-rose-300 underline transition"
                          title="Free up device storage"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleDownloadSurahAudio}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition shadow-sm"
                        title="Download all verses of this Surah for offline listening"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Save Audio Offline ({surahDetail.totalAyahs} Ayahs)</span>
                      </button>
                    )}
                  </div>

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
                                <span className="w-0.5 h-2 bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-0.5 h-3 bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-0.5 h-1.5 bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                              </span>
                              <span>Reciting Bismillah • يُتلى البسملة</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Repeat Bismillah Button */}
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
                            title={loopingAyahNumber === 0 ? "Stop repeating Bismillah" : "Repeat Bismillah until stopped"}
                          >
                            <Repeat1 className={`w-3.5 h-3.5 ${loopingAyahNumber === 0 ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline text-[10px]">Repeat</span>
                          </button>

                          {/* Play/Pause Bismillah Button */}
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

                {/* Verses List with Emphasized Active Ayah */}
                <div className="space-y-4">
                  {surahDetail.ayahs.map((ayah) => {
                    const isEmphasized = activeAyahNumber === ayah.numberInSurah;
                    const isAudioActive = isEmphasized && isPlaying;
                    const isLoopingThisAyah = loopingAyahNumber === ayah.numberInSurah;

                    return (
                      <div
                        id={`ayah-${ayah.numberInSurah}`}
                        key={ayah.numberInSurah}
                        onClick={() => {
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
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
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
                                <span>Repeating until stopped • تكرار</span>
                              </div>
                            ) : isEmphasized ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold animate-pulse">
                                {isAudioActive ? (
                                  <>
                                    <span className="flex items-end gap-0.5 h-3">
                                      <span className="w-0.5 h-2 bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                      <span className="w-0.5 h-3 bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                      <span className="w-0.5 h-1.5 bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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

                          {/* Action Buttons: Repeat Loop & Play/Pause */}
                          <div className="flex items-center gap-2">
                            {/* Single Verse Infinite Repeat Loop Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLoopAyah(ayah.numberInSurah);
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                isLoopingThisAyah
                                  ? "bg-amber-500/25 border-amber-500/70 text-amber-300 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/40"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border-slate-700"
                              }`}
                              title={
                                isLoopingThisAyah
                                  ? "Click to stop repeating this verse"
                                  : "Repeat this verse continuously until stopped (Memorization Loop)"
                              }
                            >
                              <Repeat1 className={`w-3.5 h-3.5 ${isLoopingThisAyah ? "text-amber-400" : ""}`} />
                              <span className="text-[11px]">{isLoopingThisAyah ? "Looping" : "Repeat"}</span>
                            </button>

                            {/* Play/Pause Button for this single Ayah */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isAudioActive) {
                                  togglePlayPause();
                                } else {
                                  if (loopingAyahNumber !== null && loopingAyahNumber !== ayah.numberInSurah) {
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

                        {/* Arabic Ayah Text (Emphasized with larger font and glowing contrast) */}
                        <p
                          className={`${activeFont.fontFamilyClass} transition-all pb-4 ${
                            FONT_SIZE_MAP[arabicFontSize].arabic
                          } ${
                            isEmphasized
                              ? "text-emerald-300 font-bold drop-shadow-[0_2px_8px_rgba(16,185,129,0.25)]"
                              : "text-slate-100 font-medium"
                          }`}
                        >
                          {ayah.textArabic}
                        </p>

                        {/* Translation Text (Emphasized contrast when active) */}
                        <p
                          className={`text-sm leading-relaxed pt-2 transition-colors ${
                            isEmphasized ? "text-slate-100 font-medium" : "text-slate-400"
                          }`}
                        >
                          {ayah.textEnglish}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>

          {/* Docked Synchronized Audio Player Bar */}
          {surahDetail && (
            <div className="sticky bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-emerald-500/30 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] relative">
              {/* Floating notification when advancing to next Surah */}
              {surahTransitionNotice && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 text-emerald-300 border border-emerald-500/60 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-1.5 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Advancing to {surahTransitionNotice}</span>
                </div>
              )}

              {/* Floating notification when new reciter is queued for next verse */}
              {reciterChangeNotice && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 text-emerald-300 border border-emerald-500/60 px-3.5 py-1 rounded-full text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-1.5 animate-bounce">
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
                        <span className="w-0.5 h-2 bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-0.5 h-3.5 bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-0.5 h-1.5 bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                        <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-teal-300 bg-teal-500/15 border border-teal-500/30 px-1.5 py-0.5 rounded-md font-medium" title="Playing from local offline storage">
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
                      activeAyahNumber <= (surahDetail.number === 9 || surahDetail.number === 1 ? 1 : 0) &&
                      surahDetail.number <= 1
                    }
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition"
                    title={
                      activeAyahNumber <= (surahDetail.number === 9 || surahDetail.number === 1 ? 1 : 0) && surahDetail.number > 1
                        ? "Previous Surah"
                        : "Previous Verse"
                    }
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
                    disabled={activeAyahNumber >= surahDetail.totalAyahs && surahDetail.number >= 114}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 transition"
                    title={activeAyahNumber >= surahDetail.totalAyahs && surahDetail.number < 114 ? "Next Surah" : "Next Verse"}
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
                    <span className="text-[11px] font-medium">Auto-Advance: <strong className={isContinuousPlay ? "text-emerald-300" : "text-slate-400"}>{isContinuousPlay ? "ON" : "OFF"}</strong></span>
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
                    title={isAutoScrollEnabled ? "Auto-center view on reciting verse: Enabled" : "Auto-center view: Disabled"}
                  >
                    {isAutoScrollEnabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline text-[11px]">{isAutoScrollEnabled ? "Auto-Center" : "Manual"}</span>
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
                  <p className="text-xs text-slate-400">Customize Quran writing style, script, and font size</p>
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
                  <span>Live Preview • {activeFont.name} ({FONT_SIZE_MAP[arabicFontSize].previewPx})</span>
                </div>
                <div
                  className={`${activeFont.fontFamilyClass} ${FONT_SIZE_MAP[arabicFontSize].arabic} text-emerald-300 font-bold transition-all duration-200 py-2`}
                >
                  {selectedScriptType === "quran-uthmani"
                    ? "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
                    : "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"}
                </div>
                <p className="text-xs text-slate-400 font-arabic">
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
                        {/* Native font sample text */}
                        <div className={`${font.fontFamilyClass} text-xl text-emerald-300 py-1 text-right w-full`}>
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
                        <div className="font-arabic text-lg text-emerald-300 py-0.5 text-right w-full">
                          {script.arabicName}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {script.description}
                        </p>
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
                        <div className="text-[10px] opacity-75 font-mono">{FONT_SIZE_MAP[size].previewPx}</div>
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
