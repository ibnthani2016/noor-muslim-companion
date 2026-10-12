"use client";

import React, { useState, useEffect } from "react";
import { MORNING_ADHKAR, EVENING_ADHKAR, AFTER_SALAH_ADHKAR } from "@/data/adhkarData";
import { DhikrItem } from "@/types";
import { Sparkles, RotateCcw, Volume2, VolumeX, CheckCircle2, ChevronRight, Award } from "lucide-react";

type AdhkarTab = "morning" | "evening" | "after_salah" | "tasbih";

const TASBIH_PRESETS = [
  { label: "Subhanallah", arabic: "سُبْحَانَ اللَّهِ", target: 33 },
  { label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", target: 33 },
  { label: "Allahu Akbar", arabic: "اللَّهُ أَكْبَرُ", target: 33 },
  { label: "Astaghfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
  { label: "La ilaha illallah", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", target: 100 },
  { label: "Salawat on Prophet", arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", target: 100 },
];

export const AdhkarTasbih: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdhkarTab>("morning");

  // Adhkar completion states (stored per id)
  const [adhkarCounts, setAdhkarCounts] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_adhkar_counts");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Digital Tasbih state
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [tasbihCount, setTasbihCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_tasbih_count");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [soundFeedback, setSoundFeedback] = useState(true);

  // Sync adhkar counts to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_adhkar_counts", JSON.stringify(adhkarCounts));
    }
  }, [adhkarCounts]);

  // Sync tasbih count to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_tasbih_count", String(tasbihCount));
    }
  }, [tasbihCount]);

  // Play tactile click using Web Audio API synthesis (100% offline)
  const playClickSound = () => {
    if (!soundFeedback || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    } catch (e) {
      // AudioContext may require user gesture on first interaction
    }
  };

  // Increment single Dhikr
  const incrementDhikr = (dhikr: DhikrItem) => {
    const current = adhkarCounts[dhikr.id] || 0;
    if (current < dhikr.targetCount) {
      const next = current + 1;
      setAdhkarCounts((prev) => ({ ...prev, [dhikr.id]: next }));
      playClickSound();

      if (typeof window !== "undefined" && "vibrate" in navigator) {
        if (next === dhikr.targetCount) {
          navigator.vibrate?.([50, 40, 50]); // Completion haptic
        } else {
          navigator.vibrate?.(30);
        }
      }
    }
  };

  // Reset single Dhikr
  const resetDhikr = (id: string) => {
    setAdhkarCounts((prev) => ({ ...prev, [id]: 0 }));
  };

  // Digital Tasbih Tap
  const handleTasbihTap = () => {
    const currentPreset = TASBIH_PRESETS[selectedPresetIndex];
    const newCount = tasbihCount + 1;
    setTasbihCount(newCount);
    playClickSound();

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      if (newCount % currentPreset.target === 0) {
        navigator.vibrate?.([80, 50, 80]); // Target reached
      } else {
        navigator.vibrate?.(35);
      }
    }
  };

  const resetTasbih = () => {
    setTasbihCount(0);
  };

  const getActiveAdhkarList = () => {
    switch (activeTab) {
      case "morning":
        return MORNING_ADHKAR;
      case "evening":
        return EVENING_ADHKAR;
      case "after_salah":
        return AFTER_SALAH_ADHKAR;
      default:
        return [];
    }
  };

  const currentPreset = TASBIH_PRESETS[selectedPresetIndex];
  const isGoalReached = tasbihCount > 0 && tasbihCount % currentPreset.target === 0;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
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
          onClick={() => setActiveTab("tasbih")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
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
          {/* Preset Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TASBIH_PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                onClick={() => {
                  setSelectedPresetIndex(idx);
                  setTasbihCount(0);
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium border transition ${
                  selectedPresetIndex === idx
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {preset.label} ({preset.target})
              </button>
            ))}
          </div>

          {/* Large Tasbih Bead Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-4">
              <span className="font-arabic text-3xl font-bold text-emerald-400 block mb-1">
                {currentPreset.arabic}
              </span>
              <span className="text-xs text-slate-400">
                Target: <strong>{currentPreset.target}</strong> repetitions
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
                <span>Reset Count</span>
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
          {getActiveAdhkarList().map((dhikr) => {
            const currentCount = adhkarCounts[dhikr.id] || 0;
            const isCompleted = currentCount >= dhikr.targetCount;
            const progressPercent = Math.min(100, (currentCount / dhikr.targetCount) * 100);

            return (
              <div
                key={dhikr.id}
                className={`rounded-2xl p-5 border transition-all ${
                  isCompleted
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
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
                <p className="font-arabic text-2xl sm:text-3xl text-emerald-300 font-bold leading-loose py-2">
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
                      <>
                        <span>Tap to Count ({currentCount} / {dhikr.targetCount})</span>
                      </>
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
