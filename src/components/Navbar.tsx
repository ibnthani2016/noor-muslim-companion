"use client";

import React from "react";
import { LocationCoords, AppTheme } from "@/types";
import { MapPin, Settings, Moon, Sun, BookOpen, Volume2, VolumeX } from "lucide-react";

interface NavbarProps {
  location: LocationCoords;
  onOpenSettings: () => void;
  hijriString: string;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  theme: AppTheme;
  onCycleTheme: () => void;
}

const THEME_META: Record<AppTheme, { label: string; shortLabel: string; icon: React.ElementType }> = {
  "emerald-dark": { label: "Emerald Night Theme (Default)", shortLabel: "Emerald", icon: Moon },
  "oled-black": { label: "True OLED Pitch-Black Theme", shortLabel: "OLED", icon: Moon },
  sepia: { label: "Warm Mushaf Sepia Theme", shortLabel: "Sepia", icon: BookOpen },
};

export const Navbar: React.FC<NavbarProps> = ({
  location,
  onOpenSettings,
  hijriString,
  isAudioEnabled,
  onToggleAudio,
  theme,
  onCycleTheme,
}) => {
  const currentTheme = THEME_META[theme] || THEME_META["emerald-dark"];
  const ThemeIcon = currentTheme.icon;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-md border-b border-emerald-900/30 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl shrink-0">
            <span className="font-serif">ن</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg text-white tracking-tight">Noor</h1>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                نُور
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate" suppressHydrationWarning>
              {hijriString}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Location badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 hover:text-white border border-slate-700/60 transition shadow-sm"
            title="Change City & Calculation Authority"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[90px] sm:max-w-[140px] font-medium">{location.city}</span>
          </button>

          {/* Theme Switcher Pill */}
          <button
            onClick={onCycleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition ${
              theme === "oled-black"
                ? "bg-black border-emerald-500/50 text-emerald-300"
                : theme === "sepia"
                ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
                : "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:text-white"
            }`}
            title={`Current: ${currentTheme.label} — Click to switch theme`}
            aria-label={`Switch visual theme (current: ${currentTheme.shortLabel})`}
          >
            <ThemeIcon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline text-[11px]">{currentTheme.shortLabel}</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={onToggleAudio}
            aria-label={isAudioEnabled ? "Mute Athan Audio" : "Enable Athan Audio"}
            className={`p-2 rounded-xl border transition ${
              isAudioEnabled
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200"
            }`}
            title={isAudioEnabled ? "Athan Audio On (Click to Mute)" : "Athan Audio Muted (Click to Enable)"}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition"
            title="Settings & Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
