"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MORNING_ADHKAR,
  EVENING_ADHKAR,
  AFTER_SALAH_ADHKAR,
  SLEEP_ADHKAR,
} from "@/data/adhkarData";
import { DhikrItem } from "@/types";
import {
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Award,
  Flame,
  Sparkles,
} from "lucide-react";

type AdhkarTab = "morning" | "evening" | "after_salah" | "sleep" | "tasbih";

const TASBIH_PRESETS = [
  { id: "subhanallah", label: "Subhanallah", arabic: "سُبْحَانَ اللَّهِ", target: 33 },
  { id: "alhamdulillah", label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", target: 33 },
  { id: "allahuakbar", label: "Allahu Akbar", arabic: "اللَّهُ أَكْبَرُ", target: 33 },
  { id: "astaghfirullah", label: "Astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
  { id: "tahlil", label: "La ilaha illallah", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", target: 100 },
  { id: "salawat", label: "Salawat on Prophet", arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", target: 100 },
];

function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const AdhkarTasbih: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdhkarTab>("morning");
  const todayKey = useMemo(() => getTodayDateKey(), []);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Date-keyed Adhkar completion history: { "YYYY-MM-DD": { "m-1": 1, ... } }
  const [dailyAdhkarHistory, setDailyAdhkarHistory] = useState<
    Record<string, Record<string, number>>
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_adhkar_daily_v2");
        if (saved) return JSON.parse(saved);
        // Migrate legacy flat counts into today's record if present
        const legacy = localStorage.getItem("noor_adhkar_counts");
        if (legacy) {
          return { [getTodayDateKey()]: JSON.parse(legacy) };
        }
      } catch {
        return {};
      }
    }
    return {};
  });

  const adhkarCounts = dailyAdhkarHistory[todayKey] || {};

  // Digital Tasbih per-preset & lifetime state
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [presetCounts, setPresetCounts] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_tasbih_presets");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const [lifetimeTasbih, setLifetimeTasbih] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_tasbih_lifetime");
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });

  const [soundFeedback, setSoundFeedback] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_adhkar_daily_v2", JSON.stringify(dailyAdhkarHistory));
    }
  }, [dailyAdhkarHistory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_tasbih_presets", JSON.stringify(presetCounts));
    }
  }, [presetCounts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_tasbih_lifetime", String(lifetimeTasbih));
    }
  }, [lifetimeTasbih]);

  // Calculate consecutive days where at least 1 Adhkar category or 3+ dhikr items were completed
  const adhkarStreak = useMemo(() => {
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      const dayMap = dailyAdhkarHistory[key];
      const completedItems = dayMap
        ? Object.values(dayMap).filter((c) => c > 0).length
        : 0;

      if (completedItems > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [dailyAdhkarHistory]);

  // Play tactile click using a single reusable Web Audio API context (100% offline)
  const playClickSound = () => {
    if (!soundFeedback || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore if blocked before user gesture
    }
  };

  const getActiveAdhkarList = (): DhikrItem[] => {
    switch (activeTab) {
      case "morning":
        return MORNING_ADHKAR;
      case "evening":
        return EVENING_ADHKAR;
      case "after_salah":
        return AFTER_SALAH_ADHKAR;
      case "sleep":
        return SLEEP_ADHKAR;
      default:
        return [];
    }
  };

  const activeList = getActiveAdhkarList();

  // Increment single Dhikr and auto-scroll to next incomplete Dhikr when finished
  const incrementDhikr = (dhikr: DhikrItem) => {
    const current = adhkarCounts[dhikr.id] || 0;
    if (current < dhikr.targetCount) {
      const next = current + 1;
      const updatedToday = { ...adhkarCounts, [dhikr.id]: next };
      setDailyAdhkarHistory((prev) => ({
        ...prev,
        [todayKey]: updatedToday,
      }));
      playClickSound();

      if (typeof window !== "undefined" && "vibrate" in navigator) {
        if (next === dhikr.targetCount) {
          navigator.vibrate?.([50, 40, 50]);
        } else {
          navigator.vibrate?.(30);
        }
      }

      // Auto-advance to the next incomplete Dhikr card upon completion
      if (next === dhikr.targetCount) {
        const currentIndex = activeList.findIndex((item) => item.id === dhikr.id);
        const nextIncomplete = activeList
          .slice(currentIndex + 1)
          .find((item) => (updatedToday[item.id] || 0) < item.targetCount);
        if (nextIncomplete && cardRefs.current[nextIncomplete.id]) {
          setTimeout(() => {
            cardRefs.current[nextIncomplete.id]?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 260);
        }
      }
    }
  };

  // Reset single Dhikr
  const resetDhikr = (id: string) => {
    setDailyAdhkarHistory((prev) => ({
      ...prev,
      [todayKey]: { ...(prev[todayKey] || {}), [id]: 0 },
    }));
  };

  // Reset entire active category for today
  const resetCategory = () => {
    const updatedToday = { ...adhkarCounts };
    activeList.forEach((item) => {
      updatedToday[item.id] = 0;
    });
    setDailyAdhkarHistory((prev) => ({
      ...prev,
      [todayKey]: updatedToday,
    }));
  };

  const currentPreset = TASBIH_PRESETS[selectedPresetIndex];
  const tasbihCount = presetCounts[currentPreset.id] || 0;
  const isGoalReached = tasbihCount > 0 && tasbihCount % currentPreset.target === 0;

  // Digital Tasbih Tap
  const handleTasbihTap = () => {
    const newCount = tasbihCount + 1;
    setPresetCounts((prev) => ({ ...prev, [currentPreset.id]: newCount }));
    setLifetimeTasbih((prev) => prev + 1);
    playClickSound();

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      if (newCount % currentPreset.target === 0) {
        navigator.vibrate?.([80, 50, 80]);
      } else {
        navigator.vibrate?.(35);
      }
    }
  };

  const resetTasbih = () => {
    setPresetCounts((prev) => ({ ...prev, [currentPreset.id]: 0 }));
  };

  // Category completion stats
  const completedCategoryCount = activeList.filter(
    (item) => (adhkarCounts[item.id] || 0) >= item.targetCount
  ).length;
  const categoryPercent =
    activeList.length > 0
      ? Math.round((completedCategoryCount / activeList.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Tab Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab("morning")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === "morning"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Morning (الصباح)
        </button>
        <button
          onClick={() => setActiveTab("evening")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === "evening"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Evening (المساء)
        </button>
        <button
          onClick={() => setActiveTab("after_salah")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === "after_salah"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          After Salah (الصلاة)
        </button>
        <button
          onClick={() => setActiveTab("sleep")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === "sleep"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Before Sleep (النوم)
        </button>
        <button
          onClick={() => setActiveTab("tasbih")}
          className={`col-span-2 sm:col-span-1 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === "tasbih"
              ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-700/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Digital Tasbih (المسبحة)
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "tasbih" ? (
        /* Digital Tasbih Mode */
        <div className="max-w-md mx-auto space-y-6 py-2">
          {/* Lifetime & Daily Streak Summary Pill */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Lifetime Dhikr: {lifetimeTasbih.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{adhkarStreak}d Streak</span>
            </div>
          </div>

          {/* Preset Selector (Preserves each preset's count independently) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TASBIH_PRESETS.map((preset, idx) => {
              const savedCount = presetCounts[preset.id] || 0;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetIndex(idx)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                    selectedPresetIndex === idx
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {preset.label} ({savedCount}/{preset.target})
                </button>
              );
            })}
          </div>

          {/* Large Tasbih Bead Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-4">
              <span className="font-arabic text-3xl font-bold text-emerald-400 block mb-1">
                {currentPreset.arabic}
              </span>
              <span className="text-xs text-slate-400">
                Target: <strong>{currentPreset.target}</strong> repetitions • Loop{" "}
                <strong>#{Math.floor(tasbihCount / currentPreset.target) + 1}</strong>
              </span>
            </div>

            {/* Giant Tactile Button */}
            <button
              onClick={handleTasbihTap}
              className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center transition-all duration-150 transform active:scale-95 shadow-2xl border-4 ${
                isGoalReached
                  ? "bg-gradient-to-b from-emerald-800 to-teal-900 border-emerald-400 ring-8 ring-emerald-500/30"
                  : "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-emerald-500/40 hover:border-emerald-400"
              }`}
            >
              <div className="text-6xl sm:text-7xl font-mono font-extrabold text-white tracking-wider">
                {tasbihCount}
              </div>

              <div className="mt-2 text-xs font-medium uppercase tracking-widest text-emerald-400">
                Tap anywhere
              </div>

              {isGoalReached && (
                <div className="absolute -top-3 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Award className="w-3.5 h-3.5" />
                  <span>Target Completed!</span>
                </div>
              )}
            </button>

            {/* Reset & Sound Action Bar */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={resetTasbih}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Reset Preset</span>
              </button>

              <button
                onClick={() => setSoundFeedback(!soundFeedback)}
                className={`p-2 rounded-xl border transition ${
                  soundFeedback
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
                title="Toggle Click Sound"
              >
                {soundFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Adhkar Card List Mode */
        <div className="space-y-4">
          {/* Category Progress & Daily Streak Banner */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Today&apos;s Fortress Progress: {completedCategoryCount} of {activeList.length} Completed ({categoryPercent}%)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{adhkarStreak} Day Streak</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${categoryPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={resetCategory}
              className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>

          {activeList.map((dhikr) => {
            const currentCount = adhkarCounts[dhikr.id] || 0;
            const isCompleted = currentCount >= dhikr.targetCount;
            const progressPercent = Math.min(100, (currentCount / dhikr.targetCount) * 100);

            return (
              <div
                key={dhikr.id}
                ref={(el) => {
                  cardRefs.current[dhikr.id] = el;
                }}
                className={`rounded-2xl p-5 border transition-all ${
                  isCompleted
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{dhikr.title}</h3>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      {dhikr.reference}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentCount > 0 && (
                      <button
                        onClick={() => resetDhikr(dhikr.id)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition"
                        title="Reset"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Arabic Text */}
                <p
                  dir="rtl"
                  className="font-arabic text-2xl sm:text-3xl text-emerald-300 font-bold leading-loose py-2 text-right"
                >
                  {dhikr.arabic}
                </p>

                {/* Transliteration & Translation */}
                <p className="text-xs text-slate-400 italic mb-2">
                  {dhikr.transliteration}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {dhikr.translation}
                </p>

                {/* Benefit note */}
                {dhikr.benefit && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-emerald-400/90 mb-4">
                    ✨ {dhikr.benefit}
                  </div>
                )}

                {/* Progress & Counter Tap Button */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <button
                    onClick={() => incrementDhikr(dhikr)}
                    disabled={isCompleted}
                    className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20 active:scale-98"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Completed ({dhikr.targetCount}/{dhikr.targetCount})</span>
                      </>
                    ) : (
                      <span>
                        Tap to Count ({currentCount} / {dhikr.targetCount})
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
