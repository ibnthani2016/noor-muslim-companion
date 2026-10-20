"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PrayerTimeItem, LocationCoords, SalahStatus, DailySalahRecord } from "@/types";
import { FastingTracker } from "@/components/FastingTracker";
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Compass,
  Play,
  Square,
  RefreshCw,
  Sparkles,
  MapPin,
  Utensils,
  ChevronRight,
  CheckCircle2,
  Flame,
  Users,
  AlertCircle,
  ShieldCheck,
  Plus,
  Minus,
  VolumeX,
} from "lucide-react";

interface PrayerTimesProps {
  prayers: PrayerTimeItem[];
  nextPrayer: PrayerTimeItem | null;
  nextPrayerTargetTime: Date | null;
  timeRemaining: string;
  location: LocationCoords;
  onRefreshLocation: () => void;
  isLocating: boolean;
  sunnahTimes: { midnight: Date | null; lastThird: Date | null; duha?: Date | null };
  onNavigateToQibla: () => void;
  isAudioEnabled?: boolean;
  hijriOffset?: number;
}

const PRAYER_ICONS: Record<string, React.ElementType> = {
  fajr: Moon,
  sunrise: Sunrise,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  isha: Moon,
};

const OBLIGATORY_IDS: (keyof Omit<DailySalahRecord, "excused">)[] = [
  "fajr",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

const STATUS_CONFIG: Record<
  SalahStatus,
  { label: string; shortLabel: string; badgeClass: string; dotClass: string }
> = {
  unlogged: {
    label: "Log Salah",
    shortLabel: "Tap to Log",
    badgeClass: "bg-slate-800/80 text-slate-400 border-white/[0.08] hover:text-white",
    dotClass: "bg-slate-500",
  },
  "on-time": {
    label: "On Time",
    shortLabel: "On Time ✓",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dotClass: "bg-emerald-400",
  },
  jamaah: {
    label: "In Jama'ah",
    shortLabel: "Jama'ah ★",
    badgeClass: "bg-teal-500/25 text-teal-200 border-teal-400/50",
    dotClass: "bg-teal-300",
  },
  late: {
    label: "Prayed Late",
    shortLabel: "Late ●",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    dotClass: "bg-amber-400",
  },
  qaza: {
    label: "Missed (Qaza)",
    shortLabel: "Qaza !",
    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    dotClass: "bg-rose-400",
  },
};

const STATUS_CYCLE: SalahStatus[] = ["unlogged", "on-time", "jamaah", "late", "qaza"];

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const PrayerTimes: React.FC<PrayerTimesProps> = ({
  prayers,
  nextPrayer,
  nextPrayerTargetTime,
  timeRemaining,
  location,
  onRefreshLocation,
  isLocating,
  sunnahTimes,
  onNavigateToQibla,
  isAudioEnabled = true,
  hijriOffset = 0,
}) => {
  const [isPlayingAthan, setIsPlayingAthan] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [heroMode, setHeroMode] = useState<"prayer" | "fasting">("prayer");
  const [liveCountdown, setLiveCountdown] = useState<string>(timeRemaining || "00:00:00");

  // Local 1-second countdown ticker isolated to PrayerTimes
  useEffect(() => {
    if (!nextPrayerTargetTime) {
      setLiveCountdown(timeRemaining || "00:00:00");
      return;
    }
    const updateTick = () => {
      const diffMs = Math.max(0, nextPrayerTargetTime.getTime() - Date.now());
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setLiveCountdown(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };
    updateTick();
    const timer = setInterval(updateTick, 1000);
    return () => clearInterval(timer);
  }, [nextPrayerTargetTime, timeRemaining]);

  // Stop Athan preview if global audio is muted
  useEffect(() => {
    if (!isAudioEnabled && isPlayingAthan && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlayingAthan(false);
    }
  }, [isAudioEnabled, isPlayingAthan, audioElement]);

  // Daily Salah Habit Tracker State
  const todayKey = useMemo(() => getTodayKey(), []);
  const [salahHistory, setSalahHistory] = useState<Record<string, DailySalahRecord>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("noor_salah_tracker");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const [qazaDebt, setQazaDebt] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_qaza_debt");
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
    }
    return 0;
  });

  const todayRecord: DailySalahRecord = salahHistory[todayKey] || {
    fajr: "unlogged",
    dhuhr: "unlogged",
    asr: "unlogged",
    maghrib: "unlogged",
    isha: "unlogged",
    excused: false,
  };

  const saveSalahHistory = (updated: Record<string, DailySalahRecord>) => {
    setSalahHistory(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_salah_tracker", JSON.stringify(updated));
    }
  };

  const updateQazaCount = (delta: number) => {
    const next = Math.max(0, qazaDebt + delta);
    setQazaDebt(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_qaza_debt", String(next));
    }
  };

  const setPrayerStatus = (
    prayerId: keyof Omit<DailySalahRecord, "excused">,
    nextStatus: SalahStatus
  ) => {
    const prevStatus = todayRecord[prayerId];
    const updatedToday: DailySalahRecord = {
      ...todayRecord,
      [prayerId]: nextStatus,
    };
    saveSalahHistory({ ...salahHistory, [todayKey]: updatedToday });

    // Automatically adjust Qaza counter if transitioning into or out of 'qaza'
    if (prevStatus !== "qaza" && nextStatus === "qaza") {
      updateQazaCount(1);
    } else if (prevStatus === "qaza" && nextStatus !== "qaza") {
      updateQazaCount(-1);
    }
  };

  const cyclePrayerStatus = (prayerId: keyof Omit<DailySalahRecord, "excused">) => {
    const current = todayRecord[prayerId] || "unlogged";
    const nextIdx = (STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length;
    setPrayerStatus(prayerId, STATUS_CYCLE[nextIdx]);
  };

  const toggleExcusedToday = () => {
    const updatedToday: DailySalahRecord = {
      ...todayRecord,
      excused: !todayRecord.excused,
    };
    saveSalahHistory({ ...salahHistory, [todayKey]: updatedToday });
  };

  const completedTodayCount = useMemo(() => {
    if (todayRecord.excused) return 5;
    return OBLIGATORY_IDS.filter((id) => {
      const st = todayRecord[id];
      return st === "on-time" || st === "jamaah" || st === "late";
    }).length;
  }, [todayRecord]);

  const jamaahTodayCount = useMemo(() => {
    return OBLIGATORY_IDS.filter((id) => todayRecord[id] === "jamaah").length;
  }, [todayRecord]);

  // Calculate consecutive day streak (including excused days so streaks never break unfairly)
  const salahStreak = useMemo(() => {
    let streak = 0;
    const cursor = new Date();
    for (let i = 0; i < 365; i++) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      const rec = salahHistory[key];

      if (!rec) {
        // If today isn't finished yet, check yesterday before breaking
        if (i === 0) {
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
        break;
      }

      const isComplete =
        rec.excused ||
        OBLIGATORY_IDS.every(
          (id) => rec[id] === "on-time" || rec[id] === "jamaah" || rec[id] === "late"
        );

      if (isComplete) {
        streak++;
      } else if (i > 0) {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [salahHistory]);

  const toggleAthanAudio = () => {
    if (!isAudioEnabled) {
      return;
    }
    if (isPlayingAthan) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setIsPlayingAthan(false);
    } else {
      const audio = new Audio("https://cdn.islamic.network/athan/audio/1.mp3");
      audio.onended = () => setIsPlayingAthan(false);
      audio.onerror = () => {
        setIsPlayingAthan(false);
        alert("Audio stream could not be loaded offline.");
      };
      audio.play().catch((e) => {
        console.warn("Audio play prevented:", e);
        setIsPlayingAthan(false);
      });
      setAudioElement(audio);
      setIsPlayingAthan(true);
    }
  };

  const formatSunnahTime = (date: Date | null | undefined) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const maghribPrayer = prayers.find((p) => p.id === "maghrib");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Mode Switcher Pills */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/[0.08] shadow-inner">
          <button
            onClick={() => setHeroMode("prayer")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
              heroMode === "prayer"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Salah Focus</span>
          </button>
          <button
            onClick={() => setHeroMode("fasting")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
              heroMode === "fasting"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-amber-300" />
            <span>Ramadan & Fasting</span>
          </button>
        </div>

        {heroMode === "prayer" && maghribPrayer && (
          <button
            onClick={() => setHeroMode("fasting")}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition active:scale-95"
          >
            <Utensils className="w-3 h-3 text-emerald-400" />
            <span>Iftar at {maghribPrayer.formattedTime}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        )}
      </div>

      {/* Main Command Hero Card */}
      {heroMode === "fasting" ? (
        <FastingTracker prayers={prayers} location={location} hijriOffset={hijriOffset} />
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900/90 to-emerald-950/70 border border-white/[0.08] p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Next Prayer</span>
              </div>

              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                  {nextPrayer?.name || "Fajr"}
                </h2>
                <span className="text-2xl md:text-3xl font-arabic text-emerald-400/90 font-bold">
                  {nextPrayer?.arabicName || "الفجر"}
                </span>
              </div>

              <p className="text-slate-400 text-sm">
                Scheduled at{" "}
                <strong className="text-white font-semibold" suppressHydrationWarning>
                  {nextPrayer?.formattedTime || "--:--"}
                </strong>
              </p>
            </div>

            {/* Countdown Display & Quick Action Buttons */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/[0.08] px-5 py-3 rounded-2xl shadow-inner">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  Time Remaining
                </div>
                <div
                  className="text-3xl md:text-4xl font-mono font-bold text-emerald-400 tracking-wider"
                  suppressHydrationWarning
                >
                  {liveCountdown}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleAthanAudio}
                  disabled={!isAudioEnabled}
                  title={!isAudioEnabled ? "Unmute audio in the top bar to preview Athan" : "Preview Athan"}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 duration-150 ${
                    !isAudioEnabled
                      ? "bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed"
                      : isPlayingAthan
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30"
                      : "bg-emerald-600/30 border-emerald-500/40 text-emerald-200 hover:bg-emerald-600/50"
                  }`}
                >
                  {!isAudioEnabled ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                      <span>Audio Muted</span>
                    </>
                  ) : isPlayingAthan ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-rose-300" />
                      <span>Stop Athan</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-emerald-300" />
                      <span>Play Athan Preview</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onNavigateToQibla}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/[0.08] transition active:scale-95"
                >
                  <Compass className="w-3.5 h-3.5 text-teal-400" />
                  <span>Qibla</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Time Cards Grid with Interactive Salah Check-In */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {prayers.map((prayer) => {
          const Icon = PRAYER_ICONS[prayer.id] || Clock;
          const isNext = prayer.isNext;
          const isSunrise = prayer.id === "sunrise";
          const isObligatory = OBLIGATORY_IDS.includes(prayer.id as any);
          const currentStatus: SalahStatus = isObligatory
            ? todayRecord[prayer.id as keyof Omit<DailySalahRecord, "excused">] || "unlogged"
            : "unlogged";
          const statusMeta = STATUS_CONFIG[currentStatus];

          return (
            <div
              key={prayer.id}
              className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                isNext
                  ? "bg-gradient-to-b from-emerald-950/90 to-slate-900 border-emerald-500/80 shadow-xl shadow-emerald-950/60 scale-[1.02] ring-1 ring-emerald-500/50"
                  : prayer.isPast
                  ? "bg-slate-950/50 border-white/[0.05]"
                  : "bg-slate-900/60 border-white/[0.07] hover:border-white/[0.15] hover:bg-slate-900/80"
              }`}
            >
              {isNext && (
                <div className="absolute top-2.5 right-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`p-2 rounded-xl ${
                      isNext
                        ? "bg-emerald-500/20 text-emerald-300"
                        : isSunrise
                        ? "bg-amber-500/10 text-amber-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-arabic font-bold text-slate-400">
                    {prayer.arabicName}
                  </span>
                </div>

                <div>
                  <h3
                    className={`text-sm font-semibold ${
                      isNext ? "text-emerald-300" : isSunrise ? "text-amber-200" : "text-white"
                    }`}
                  >
                    {prayer.name}
                  </h3>
                  <p
                    className={`text-lg font-bold mt-1 font-mono tracking-tight ${
                      isNext ? "text-white" : "text-slate-200"
                    }`}
                  >
                    {prayer.formattedTime}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-between gap-1">
                {isObligatory ? (
                  todayRecord.excused ? (
                    <span className="text-[10px] font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-lg w-full text-center">
                      Streak Paused
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        cyclePrayerStatus(prayer.id as keyof Omit<DailySalahRecord, "excused">)
                      }
                      title="Tap to cycle: On Time → Jama'ah → Late → Missed (Qaza)"
                      className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition active:scale-95 ${statusMeta.badgeClass}`}
                    >
                      <span className="truncate">{statusMeta.shortLabel}</span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusMeta.dotClass}`} />
                    </button>
                  )
                ) : (
                  <span className="text-[10px] text-amber-300/80 font-medium">Shuruq (Sunrise)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pillars-Style Daily Salah Habit & Streak Tracker */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/[0.08] p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            {/* 5-Prayer Progress Ring Badge */}
            <div className="relative w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex flex-col items-center justify-center shrink-0">
              <span className="text-lg font-extrabold text-emerald-400 font-mono leading-none">
                {completedTodayCount}/5
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                Today
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm md:text-base font-bold text-white">
                  Daily Salah Habit & Accountability
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{salahStreak} Day Streak</span>
                </span>
                {jamaahTodayCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    <Users className="w-3 h-3" />
                    <span>{jamaahTodayCount} in Jama&apos;ah</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tap any prayer card above or select below to log <strong className="text-slate-200">On Time</strong>,{" "}
                <strong className="text-teal-300">Jama&apos;ah</strong>, <strong className="text-amber-300">Late</strong>, or{" "}
                <strong className="text-rose-300">Qaza</strong>.
              </p>
            </div>
          </div>

          {/* Right Controls: Qaza Debt & Excused / Pause Streak Mode */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Qaza Makeup Counter */}
            <div className="flex items-center gap-2 bg-slate-950/70 border border-white/[0.06] px-3 py-1.5 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs text-slate-300 font-medium">Qaza Makeup:</span>
              <button
                onClick={() => updateQazaCount(-1)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                aria-label="Decrease Qaza count"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono font-bold text-xs text-white min-w-[20px] text-center">
                {qazaDebt}
              </span>
              <button
                onClick={() => updateQazaCount(1)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                aria-label="Increase Qaza count"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Pause Streak / Excused Mode Toggle */}
            <button
              onClick={toggleExcusedToday}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                todayRecord.excused
                  ? "bg-teal-950/60 border-teal-500 text-teal-300"
                  : "bg-slate-950/60 border-white/[0.08] text-slate-400 hover:text-white"
              }`}
              title="Protect your Salah streak during menstruation, postpartum, or illness"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>{todayRecord.excused ? "Streak Paused (Excused)" : "Pause Streak (Excused)"}</span>
            </button>
          </div>
        </div>

        {/* Quick 5-Prayer Pill Selector Row */}
        {!todayRecord.excused && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 pt-4 border-t border-white/[0.06]">
            {OBLIGATORY_IDS.map((id) => {
              const st = todayRecord[id] || "unlogged";
              return (
                <div
                  key={id}
                  className="bg-slate-950/60 border border-white/[0.05] rounded-xl p-2.5 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold capitalize text-white">{id}</span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {STATUS_CONFIG[st].label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {(["on-time", "jamaah", "late", "qaza"] as SalahStatus[]).map((option) => {
                      const active = st === option;
                      const labelMap: Record<SalahStatus, string> = {
                        unlogged: "-",
                        "on-time": "OnTime",
                        jamaah: "Jamaah",
                        late: "Late",
                        qaza: "Qaza",
                      };
                      return (
                        <button
                          key={option}
                          onClick={() => setPrayerStatus(id, active ? "unlogged" : option)}
                          className={`py-1 rounded text-[9px] font-bold transition ${
                            active
                              ? STATUS_CONFIG[option].badgeClass
                              : "bg-slate-900 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {labelMap[option]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sunnah & Calculation Location Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sunnah & Night Prayers */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.07] p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sunnah & Night Prayers
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-sm">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-white/[0.05]">
              <span className="text-[11px] text-slate-400 block">Duha (الضحى)</span>
              <span className="font-mono font-bold text-amber-300 text-sm sm:text-base">
                {formatSunnahTime(sunnahTimes.duha)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">20m post-Sunrise</span>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-white/[0.05]">
              <span className="text-[11px] text-slate-400 block">Midnight (نصف الليل)</span>
              <span className="font-mono font-bold text-slate-200 text-sm sm:text-base">
                {formatSunnahTime(sunnahTimes.midnight)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">End of Isha</span>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-white/[0.05]">
              <span className="text-[11px] text-slate-400 block">Tahajjud (الثلث الأخير)</span>
              <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                {formatSunnahTime(sunnahTimes.lastThird)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Last 3rd of night</span>
            </div>
          </div>
        </div>

        {/* Location Status & Geolocation Refresh */}
        <div className="rounded-2xl bg-slate-900/60 border border-white/[0.07] p-4 backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Calculation Location
              </h4>
            </div>
            <button
              onClick={onRefreshLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLocating ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isLocating ? "Detecting GPS..." : "Detect GPS"}</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between bg-slate-950/60 rounded-xl p-3 border border-white/[0.05]">
            <div>
              <p className="font-semibold text-white text-sm">
                {location.city}, {location.country}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Lat: {location.latitude.toFixed(4)}°, Long: {location.longitude.toFixed(4)}°
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20">
                Offline Calculated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
