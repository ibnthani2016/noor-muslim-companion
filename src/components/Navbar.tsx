"use client";

import React from "react";
import { LocationCoords } from "@/types";
import { MapPin, Settings, Moon, Volume2, VolumeX, Sparkles } from "lucide-react";

interface NavbarProps {
  location: LocationCoords;
  onOpenSettings: () => void;
  hijriString: string;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  location,
  onOpenSettings,
  hijriString,
  isAudioEnabled,
  onToggleAudio,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-emerald-900/30 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl">
            <span className="font-serif">ن</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg text-white tracking-tight">Noor</h1>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                نُور
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium" suppressHydrationWarning>
              {hijriString}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Location badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-700/60 transition shadow-sm"
            title="Change City"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[120px] font-medium">{location.city}</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-xl border transition ${
              isAudioEnabled
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200"
            }`}
            title={isAudioEnabled ? "Athan Audio On" : "Athan Audio Muted"}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
