"use client";

import React, { useState } from "react";
import { PrayerTimeItem, LocationCoords } from "@/types";
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Compass,
  Volume2,
  VolumeX,
  Play,
  Square,
  RefreshCw,
  Sparkles,
  MapPin,
} from "lucide-react";

interface PrayerTimesProps {
  prayers: PrayerTimeItem[];
  nextPrayer: PrayerTimeItem | null;
  timeRemaining: string;
  location: LocationCoords;
  onRefreshLocation: () => void;
  isLocating: boolean;
  sunnahTimes: { midnight: Date | null; lastThird: Date | null };
  onNavigateToQibla: () => void;
}

const PRAYER_ICONS: Record<string, React.ElementType> = {
  fajr: Moon,
  sunrise: Sunrise,
  dhuhr: Sun,
  asr: Sun,
  maghrib: Sunset,
  isha: Moon,
};

export const PrayerTimes: React.FC<PrayerTimesProps> = ({
  prayers,
  nextPrayer,
  timeRemaining,
  location,
  onRefreshLocation,
  isLocating,
  sunnahTimes,
  onNavigateToQibla,
}) => {
  const [isPlayingAthan, setIsPlayingAthan] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const toggleAthanAudio = () => {
    if (isPlayingAthan) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setIsPlayingAthan(false);
    } else {
      // Makkah Athan audio stream
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

  const formatSunnahTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner: Next Prayer Countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 p-6 md:p-8 shadow-2xl">
        {/* Background glow decoration */}
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

            <p className="text-emerald-200/70 text-sm">
              Scheduled at{" "}
              <strong className="text-white font-semibold">
                {nextPrayer?.formattedTime || "--:--"}
              </strong>
            </p>
          </div>

          {/* Countdown Display */}
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 px-5 py-3 rounded-2xl shadow-inner">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Time Remaining
              </div>
              <div className="text-3xl md:text-4xl font-mono font-bold text-emerald-400 tracking-wider">
                {timeRemaining || "00:00:00"}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleAthanAudio}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  isPlayingAthan
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30"
                    : "bg-emerald-600/30 border-emerald-500/40 text-emerald-200 hover:bg-emerald-600/50"
                }`}
              >
                {isPlayingAthan ? (
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
              >
                <Compass className="w-3.5 h-3.5 text-teal-400" />
                <span>Qibla</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Time Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {prayers.map((prayer) => {
          const Icon = PRAYER_ICONS[prayer.id] || Clock;
          const isNext = prayer.isNext;
          const isSunrise = prayer.id === "sunrise";

          return (
            <div
              key={prayer.id}
              className={`relative overflow-hidden rounded-2xl p-4 transition-all border ${
                isNext
                  ? "bg-gradient-to-b from-emerald-900/60 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/50 scale-[1.02] ring-1 ring-emerald-500/50"
                  : prayer.isPast
                  ? "bg-slate-900/40 border-slate-800/50 opacity-75"
                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              {isNext && (
                <div className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </div>
              )}

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

              <div className="mt-2 text-[10px]">
                {isNext ? (
                  <span className="text-emerald-400 font-semibold uppercase">Up Next</span>
                ) : prayer.isPast ? (
                  <span className="text-slate-500">Completed</span>
                ) : (
                  <span className="text-slate-400">Upcoming</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Location and Sunnah Times Footnote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sunnah & Night Prayers */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sunnah & Night Prayers
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/70">
              <span className="text-xs text-slate-400 block">Midnight (نصف الليل)</span>
              <span className="font-mono font-bold text-slate-200 text-base">
                {formatSunnahTime(sunnahTimes.midnight)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">End of Isha time</span>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/70">
              <span className="text-xs text-slate-400 block">Tahajjud (الثلث الأخير)</span>
              <span className="font-mono font-bold text-emerald-400 text-base">
                {formatSunnahTime(sunnahTimes.lastThird)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Last 3rd of the night</span>
            </div>
          </div>
        </div>

        {/* Location Status & Geolocation Refresh */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col justify-between">
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLocating ? "animate-spin text-emerald-400" : ""}`} />
              <span>{isLocating ? "Detecting GPS..." : "Detect GPS"}</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800/70">
            <div>
              <p className="font-semibold text-white text-sm">
                {location.city}, {location.country}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Lat: {location.latitude.toFixed(4)}°, Long: {location.longitude.toFixed(4)}°
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-medium">
                Offline Calculated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
