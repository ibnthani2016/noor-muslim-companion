"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PrayerTimeItem, LocationCoords, RamadanDua } from "@/types";
import { RAMADAN_DUAS, RAMADAN_ASHRA_INFO } from "@/data/ramadanData";
import { getHijriDateDetails } from "@/utils/hijri";
import {
  Moon,
  Sun,
  Utensils,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Volume2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface FastingTrackerProps {
  prayers: PrayerTimeItem[];
  location: LocationCoords;
  hijriOffset?: number;
}

export const FastingTracker: React.FC<FastingTrackerProps> = ({ prayers, location, hijriOffset = 0 }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedDuaIndex, setSelectedDuaIndex] = useState(0);
  const [hasCopiedDua, setHasCopiedDua] = useState(false);
  const [fastingLogs, setFastingLogs] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_fasting_logs");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Live tick every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayKey = useMemo(() => {
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, "0");
    const d = String(currentTime.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [currentTime]);

  const isFastingToday = !!fastingLogs[todayKey];

  const toggleFastingToday = () => {
    const updated = { ...fastingLogs, [todayKey]: !isFastingToday };
    setFastingLogs(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_fasting_logs", JSON.stringify(updated));
    }
  };

  const totalFastedDays = useMemo(() => {
    return Object.values(fastingLogs).filter(Boolean).length;
  }, [fastingLogs]);

  // Hijri details
  const hijri = useMemo(() => getHijriDateDetails(currentTime, hijriOffset), [currentTime, hijriOffset]);
  const isRamadanMonth = hijri.month === 9;

  // Ashra info
  const currentAshra = useMemo(() => {
    if (hijri.day <= 10) return RAMADAN_ASHRA_INFO.first;
    if (hijri.day <= 20) return RAMADAN_ASHRA_INFO.second;
    return RAMADAN_ASHRA_INFO.third;
  }, [hijri.day]);

  // Resolve Fajr & Maghrib times from prayer items
  const fajrPrayer = prayers.find((p) => p.id === "fajr");
  const maghribPrayer = prayers.find((p) => p.id === "maghrib");

  // Imsak cutoff is 10 minutes before Fajr
  const imsakFormattedTime = useMemo(() => {
    if (!fajrPrayer) return "--:--";
    const imsakDate = new Date(fajrPrayer.time.getTime() - 10 * 60 * 1000);
    return imsakDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  }, [fajrPrayer]);

  const fastingTiming = useMemo(() => {
    if (!fajrPrayer || !maghribPrayer) {
      return {
        status: "idle",
        countdownText: "--:--:--",
        targetLabel: "Prayer calculation...",
        percentage: 0,
      };
    }

    const nowMs = currentTime.getTime();
    const fajrMs = fajrPrayer.time.getTime();
    const maghribMs = maghribPrayer.time.getTime();

    // Currently daytime between Fajr and Maghrib: Fasting active!
    if (nowMs >= fajrMs && nowMs < maghribMs) {
      const remainingMs = Math.max(0, maghribMs - nowMs);
      const totalDayMs = maghribMs - fajrMs;
      const elapsedMs = nowMs - fajrMs;
      const percentage = Math.min(100, Math.round((elapsedMs / totalDayMs) * 100));

      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
      const countdown = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      return {
        status: "fasting",
        countdownText: countdown,
        targetLabel: "Time until Iftar (Maghrib)",
        targetTime: maghribPrayer.formattedTime,
        percentage,
      };
    }

    // Between Maghrib and next Fajr (Eating / Suhoor window)
    let nextFajrMs = fajrMs;
    if (nowMs >= maghribMs) {
      // Fajr is tomorrow
      nextFajrMs = fajrMs + 24 * 60 * 60 * 1000;
    }
    const remainingMs = Math.max(0, nextFajrMs - nowMs);
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
    const countdown = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    return {
      status: "suhoor",
      countdownText: countdown,
      targetLabel: "Suhoor & Fajr Cutoff In",
      targetTime: fajrPrayer.formattedTime,
      percentage: 100,
    };
  }, [currentTime, fajrPrayer, maghribPrayer]);

  const activeDua: RamadanDua = RAMADAN_DUAS[selectedDuaIndex] || RAMADAN_DUAS[0];

  const copyDuaToClipboard = () => {
    if (typeof window === "undefined") return;
    const text = `${activeDua.title}\n\n${activeDua.arabic}\n\n${activeDua.transliteration}\n\n"${activeDua.translation}"\n— ${activeDua.reference}`;
    navigator.clipboard.writeText(text);
    setHasCopiedDua(true);
    setTimeout(() => setHasCopiedDua(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Fasting & Ramadan Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/80 to-slate-950 border border-emerald-700/40 p-5 md:p-7 shadow-2xl">
        {/* Background Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Header Row: Fasting Status & Ramadan Milestone */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                {fastingTiming.status === "fasting" ? (
                  <Sun className="w-5 h-5 text-amber-400 animate-pulse" />
                ) : (
                  <Moon className="w-5 h-5 text-emerald-300" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                    {fastingTiming.status === "fasting" ? "Fasting in Progress" : "Suhoor & Eating Window"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {isRamadanMonth ? `Ramadan Day ${hijri.day}` : "Daily Fasting"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isRamadanMonth
                    ? `${currentAshra.title} • ${currentAshra.days}`
                    : `Hijri ${hijri.day} ${hijri.monthName} ${hijri.year} AH`}
                </p>
              </div>
            </div>

            {/* Daily Fast Tracker Checkbox */}
            <button
              onClick={toggleFastingToday}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isFastingToday
                  ? "bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-500/20"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isFastingToday ? "text-emerald-400" : "text-slate-500"}`} />
              <span>{isFastingToday ? "Fasting Logged Today" : "Log Fast Today"}</span>
            </button>
          </div>

          {/* Main Countdown Centerpiece */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-900/60 p-4 rounded-2xl border border-emerald-900/40 backdrop-blur-sm">
            {/* Countdown timer */}
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{fastingTiming.targetLabel}</span>
                {fastingTiming.targetTime && (
                  <span className="text-slate-400">({fastingTiming.targetTime})</span>
                )}
              </div>
              <div className="text-3xl md:text-5xl font-mono font-extrabold tracking-tight text-white drop-shadow">
                {fastingTiming.countdownText}
              </div>

              {/* Day Progress bar when fasting */}
              {fastingTiming.status === "fasting" && (
                <div className="space-y-1 pt-1.5">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${fastingTiming.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Fajr {fajrPrayer?.formattedTime}</span>
                    <span className="font-semibold text-emerald-400">{fastingTiming.percentage}% completed</span>
                    <span>Maghrib (Iftar) {maghribPrayer?.formattedTime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suhoor & Iftar Quick Reference Badges */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Utensils className="w-3.5 h-3.5 text-teal-400" />
                  <span>Imsak (-10m):</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">
                  {imsakFormattedTime}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Iftar (Break):</span>
                </div>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {maghribPrayer ? maghribPrayer.formattedTime : "--:--"}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Rotating Duas Carousel */}
          <div className="space-y-2 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 p-4 rounded-2xl border border-emerald-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeDua.title}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setSelectedDuaIndex((prev) => (prev === 0 ? RAMADAN_DUAS.length - 1 : prev - 1))
                  }
                  className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors"
                  aria-label="Previous Dua"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-slate-400">
                  {selectedDuaIndex + 1} / {RAMADAN_DUAS.length}
                </span>
                <button
                  onClick={() =>
                    setSelectedDuaIndex((prev) => (prev === RAMADAN_DUAS.length - 1 ? 0 : prev + 1))
                  }
                  className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-colors"
                  aria-label="Next Dua"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={copyDuaToClipboard}
                  className="p-1 ml-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors"
                  title="Copy Dua"
                >
                  {hasCopiedDua ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Arabic Text */}
            <p className="font-arabic text-xl md:text-2xl text-right text-emerald-200 leading-loose py-1 selection:bg-emerald-500 selection:text-white">
              {activeDua.arabic}
            </p>

            {/* Transliteration */}
            <p className="text-xs text-emerald-300/80 italic font-sans">{activeDua.transliteration}</p>

            {/* Translation */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
              "{activeDua.translation}"
            </p>

            <div className="text-[10px] text-slate-500 pt-1 flex justify-between items-center">
              <span>{activeDua.reference}</span>
              <span className="text-emerald-500/80 font-medium">Total Fasted Days: {totalFastedDays}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
