"use client";

import React, { useState, useEffect, useRef } from "react";
import { SurahMeta, SurahDetail, AyahItem } from "@/types";
import {
  SURAH_LIST,
  fetchSurahDetail,
  OFFLINE_SURAHS,
  getSurahAudioUrl,
  getAyahAudioUrl,
  RECITERS,
  TRANSLATION_EDITIONS,
} from "@/data/quranData";
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
} from "lucide-react";

export const QuranReader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "Meccan" | "Medinan">("all");

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

  // Audio player state
  const [isPlayingFullSurah, setIsPlayingFullSurah] = useState(false);
  const [activeAyahNumber, setActiveAyahNumber] = useState<number | null>(null);
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(true);
  const [isPlayingAyahAudio, setIsPlayingAyahAudio] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Auto-scroll to emphasized active Ayah
  useEffect(() => {
    if (activeAyahNumber !== null && typeof document !== "undefined") {
      const el = document.getElementById(`ayah-${activeAyahNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeAyahNumber]);

  // Reciter switch handler
  const handleReciterChange = (id: string) => {
    setSelectedReciterId(id);
    localStorage.setItem("noor_reciter", id);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingFullSurah(false);
      setIsPlayingAyahAudio(false);
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

  // Load surah when selected or when translation/reciter changes
  useEffect(() => {
    if (selectedSurahNumber === null) {
      setSurahDetail(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingFullSurah(false);
      setIsPlayingAyahAudio(false);
    }

    fetchSurahDetail(selectedSurahNumber, selectedTranslationId, selectedReciterId).then((data) => {
      if (isMounted) {
        setSurahDetail(data);
        setIsLoading(false);
        localStorage.setItem("noor_last_surah", String(selectedSurahNumber));
        setBookmarkedSurah(selectedSurahNumber);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber, selectedTranslationId, selectedReciterId]);

  // Handle Full Surah Audio Recitation
  const togglePlayFullSurah = () => {
    if (!selectedSurahNumber) return;

    if (isPlayingAyahAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAyahAudio(false);
    }

    if (!audioRef.current || isPlayingAyahAudio) {
      const url = getSurahAudioUrl(selectedSurahNumber, selectedReciterId);
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingFullSurah(false);
      audio.onerror = () => {
        setIsPlayingFullSurah(false);
        alert("Audio recitation stream could not be loaded offline.");
      };
      audioRef.current = audio;
    }

    if (isPlayingFullSurah) {
      audioRef.current.pause();
      setIsPlayingFullSurah(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingFullSurah(true);
      }).catch((e) => {
        console.warn("Play blocked:", e);
        setIsPlayingFullSurah(false);
      });
    }
  };

  // Play individual Ayah with Auto-Advance & Visual Emphasis
  const playAyah = (ayah: AyahItem, surahNum: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingFullSurah(false);
    }

    // Toggle pause if same ayah currently playing
    if (activeAyahNumber === ayah.numberInSurah && isPlayingAyahAudio) {
      setIsPlayingAyahAudio(false);
      return;
    }

    const audioUrl = getAyahAudioUrl(surahNum, ayah.numberInSurah, selectedReciterId);
    const audio = new Audio(audioUrl);
    setActiveAyahNumber(ayah.numberInSurah);
    setIsPlayingAyahAudio(true);

    audio.onended = () => {
      if (isContinuousPlay && surahDetail) {
        const nextAyah = surahDetail.ayahs.find((a) => a.numberInSurah === ayah.numberInSurah + 1);
        if (nextAyah) {
          playAyah(nextAyah, surahNum);
          return;
        }
      }
      setIsPlayingAyahAudio(false);
    };

    audio.onerror = () => {
      setIsPlayingAyahAudio(false);
      alert("Verse audio unavailable offline for this reciter.");
    };

    audioRef.current = audio;
    audio.play().catch(() => setIsPlayingAyahAudio(false));
  };

  // Close reader modal
  const closeReader = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingFullSurah(false);
      setIsPlayingAyahAudio(false);
    }
    setSelectedSurahNumber(null);
    setActiveAyahNumber(null);
  };

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

        {/* Global Reciter and Translation Quick Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-xs">
          {/* Reciter selector (Includes Ali Jaber and Abdur-Rahman Al-Hudhaify) */}
          <div className="flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-medium">Qari / Reciter:</span>
            <select
              value={selectedReciterId}
              onChange={(e) => handleReciterChange(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 text-emerald-300 font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.arabicName})
                </option>
              ))}
            </select>
          </div>

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
                        Offline
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
            <div className="flex items-center gap-3">
              <button
                onClick={closeReader}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Close Reader"
              >
                <X className="w-5 h-5" />
              </button>
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
              <button
                onClick={() => setIsContinuousPlay(!isContinuousPlay)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                  isContinuousPlay
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-medium"
                    : "bg-slate-800/80 border-slate-700 text-slate-500"
                }`}
                title="Continuous Autoplay to Next Verse"
              >
                <Repeat className="w-4 h-4" />
                <span className="hidden sm:inline">Auto-advance</span>
              </button>

              <button
                onClick={togglePlayFullSurah}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isPlayingFullSurah
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-emerald-600/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/50"
                }`}
              >
                {isPlayingFullSurah ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-rose-300" />
                    <span>Pause Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-emerald-300" />
                    <span>Play Surah ({activeReciter.name.split(" ")[0]})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reader Content Area with Smooth Auto-Scrolling */}
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-6">
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

                  {/* Bismillah (except Surah 9 At-Tawbah) */}
                  {surahDetail.number !== 9 && (
                    <div className="pt-4 border-t border-emerald-900/40">
                      <p className="font-arabic text-2xl text-emerald-300 font-bold leading-relaxed">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                    </div>
                  )}
                </div>

                {/* Verses List with Emphasized Active Ayah */}
                <div className="space-y-4">
                  {surahDetail.ayahs.map((ayah) => {
                    const isEmphasized = activeAyahNumber === ayah.numberInSurah;
                    const isAudioActive = isEmphasized && isPlayingAyahAudio;

                    return (
                      <div
                        id={`ayah-${ayah.numberInSurah}`}
                        key={ayah.numberInSurah}
                        onClick={() => setActiveAyahNumber(ayah.numberInSurah)}
                        className={`rounded-2xl p-5 border transition-all duration-300 cursor-pointer ${
                          isEmphasized
                            ? "bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-emerald-400 ring-2 ring-emerald-500/60 shadow-2xl shadow-emerald-950/90 scale-[1.01]"
                            : "bg-slate-900/60 border-slate-800/70 hover:border-slate-700 hover:bg-slate-900/80"
                        }`}
                      >
                        {/* Top Ayah Indicator Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-8 h-8 rounded-xl text-xs font-mono font-bold flex items-center justify-center border transition ${
                                isEmphasized
                                  ? "bg-emerald-500 text-slate-950 border-emerald-400 ring-4 ring-emerald-500/30"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              {ayah.numberInSurah}
                            </span>

                            {isEmphasized && (
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
                            )}
                          </div>

                          {/* Play/Pause Button for this single Ayah */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playAyah(ayah, surahDetail.number);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                              isAudioActive
                                ? "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border-slate-700"
                            }`}
                            title="Play This Ayah"
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

                        {/* Arabic Ayah Text (Emphasized with larger font and glowing contrast) */}
                        <p
                          className={`font-quran transition-all pb-4 ${
                            isEmphasized
                              ? "text-2xl sm:text-3xl text-emerald-300 font-bold drop-shadow-sm leading-loose"
                              : "text-2xl sm:text-3xl text-slate-100 font-medium leading-loose"
                          }`}
                        >
                          {ayah.textArabic}
                        </p>

                        {/* Translation Text (Emphasized contrast when active) */}
                        <p
                          className={`text-sm leading-relaxed pt-2 transition-colors ${
                            isEmphasized ? "text-slate-200 font-medium" : "text-slate-400"
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
        </div>
      )}
    </div>
  );
};
