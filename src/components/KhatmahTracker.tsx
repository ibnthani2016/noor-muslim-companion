"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SURAH_LIST } from "@/data/quranData";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  Trophy,
  RotateCcw,
  Calendar,
  ChevronRight,
  Flame,
  Award,
  X,
} from "lucide-react";

interface KhatmahTrackerProps {
  onSelectSurah: (surahNumber: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const KhatmahTracker: React.FC<KhatmahTrackerProps> = ({
  onSelectSurah,
  isOpen,
  onClose,
}) => {
  const [completedJuz, setCompletedJuz] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_khatmah_juz");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [targetDays, setTargetDays] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_khatmah_days");
      return saved ? parseInt(saved, 10) || 30 : 30;
    }
    return 30;
  });

  const handleSelectTargetDays = (days: number) => {
    setTargetDays(days);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_khatmah_days", String(days));
    }
  };

  // Sync to localStorage
  const toggleJuz = (juzNum: number) => {
    let updated: number[];
    if (completedJuz.includes(juzNum)) {
      updated = completedJuz.filter((j) => j !== juzNum);
    } else {
      updated = [...completedJuz, juzNum].sort((a, b) => a - b);
    }
    setCompletedJuz(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_khatmah_juz", JSON.stringify(updated));
    }
  };

  const resetKhatmah = () => {
    if (confirm("Reset your Khatmah progress to start fresh?")) {
      setCompletedJuz([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("noor_khatmah_juz");
      }
    }
  };

  // Find starting surah for each juz
  const juzDetails = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const juzNum = i + 1;
      const firstSurah = SURAH_LIST.find((s) => s.juz === juzNum) || SURAH_LIST[0];
      return {
        juz: juzNum,
        firstSurah,
      };
    });
  }, []);

  const nextJuzToRead = useMemo(() => {
    for (let i = 1; i <= 30; i++) {
      if (!completedJuz.includes(i)) return i;
    }
    return 1;
  }, [completedJuz]);

  const percentage = Math.round((completedJuz.length / 30) * 100);
  const isFinished = completedJuz.length === 30;
  const pagesPerDay = Math.ceil(604 / targetDays);
  const pagesPerPrayer = Math.ceil(pagesPerDay / 5);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/70 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{targetDays}-Day Khatmah Planner</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Quran Reading Goal
            </h3>
            <p className="text-xs text-slate-400">
              Complete the Quran in {targetDays} days: ~{pagesPerDay} pages/day (approx {pagesPerPrayer} pages after each of the 5 daily prayers).
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400">Target Pace:</span>
              {[10, 15, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => handleSelectTargetDays(d)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                    targetDays === d
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Progress Banner */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-emerald-400">
              <Trophy className="w-4 h-4" />
              <span>
                {completedJuz.length} of 30 Juz Read ({percentage}%)
              </span>
            </div>
            <div className="text-slate-400">
              {30 - completedJuz.length} Juz remaining
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Next Recommended Session */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-slate-300">
              {isFinished ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Mabrook! You have completed the entire Holy Quran! May Allah accept it!
                </span>
              ) : (
                <span>
                  Next to read: <strong className="text-emerald-300">Juz {nextJuzToRead}</strong> (Starts with Surah{" "}
                  {juzDetails[nextJuzToRead - 1]?.firstSurah.transliteration})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isFinished && (
                <button
                  onClick={() => {
                    const nextSurah = juzDetails[nextJuzToRead - 1]?.firstSurah.number;
                    if (nextSurah) {
                      onSelectSurah(nextSurah);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
                >
                  Continue Reading Juz {nextJuzToRead} →
                </button>
              )}

              {completedJuz.length > 0 && (
                <button
                  onClick={resetKhatmah}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Reset Khatmah"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 30 Juz Interactive Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Select or Check off Juz
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {juzDetails.map(({ juz, firstSurah }) => {
              const isDone = completedJuz.includes(juz);
              const isNext = juz === nextJuzToRead;

              return (
                <div
                  key={juz}
                  onClick={() => toggleJuz(juz)}
                  className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 active:scale-95 flex flex-col justify-between ${
                    isDone
                      ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-200 shadow-sm shadow-emerald-950/40"
                      : isNext
                      ? "bg-slate-800/90 border-emerald-500/60 text-slate-200 ring-2 ring-emerald-500/30"
                      : "bg-slate-950/80 border-white/[0.07] text-slate-400 hover:border-white/[0.18] hover:text-slate-200"
                  }`}
                >
                  {/* Milestone ribbon badge for Juz 10, 20, 30 */}
                  {juz === 10 && (
                    <span className="text-[9px] font-semibold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-md mb-1 inline-block truncate border border-emerald-500/30">
                      🌿 1st Ashra
                    </span>
                  )}
                  {juz === 20 && (
                    <span className="text-[9px] font-semibold text-teal-300 bg-teal-500/20 px-1.5 py-0.5 rounded-md mb-1 inline-block truncate border border-teal-500/30">
                      🕊️ 2nd Ashra
                    </span>
                  )}
                  {juz === 30 && (
                    <span className="text-[9px] font-semibold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-md mb-1 inline-block truncate border border-amber-500/30">
                      🏆 Khatmah
                    </span>
                  )}

                  <div className="flex items-center justify-between pb-1">
                    <span className="font-bold text-xs text-white">Juz {juz}</span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <span className="text-[11px] text-slate-300 truncate font-medium">
                    {firstSurah.transliteration}
                  </span>

                  <span className="font-arabic text-xs text-emerald-400/80 text-right truncate">
                    {firstSurah.name}
                  </span>

                  <div className="pt-2 border-t border-white/[0.06] mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {isDone ? "Completed" : "Not yet"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSurah(firstSurah.number);
                        onClose();
                      }}
                      className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Read
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
