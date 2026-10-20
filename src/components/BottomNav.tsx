"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Compass,
  BookOpen,
  Sparkles,
  Calculator,
  Calendar,
  Tv,
  Palette,
  Grid,
  X,
} from "lucide-react";

export type NavTab = "prayer" | "quran" | "adhkar" | "qibla" | "media" | "cards" | "zakat" | "calendar";

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

// Primary high-frequency daily worship utilities in the mobile thumb zone
const PRIMARY_MOBILE_ITEMS: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: "prayer", label: "Prayer", icon: Clock },
  { id: "quran", label: "Quran", icon: BookOpen },
  { id: "adhkar", label: "Adhkar", icon: Sparkles },
  { id: "qibla", label: "Qibla", icon: Compass },
];

// Secondary discovery & planning tools in the More drawer
const SECONDARY_ITEMS: { id: NavTab; label: string; arabicLabel: string; desc: string; icon: React.ElementType }[] = [
  { id: "calendar", label: "Hijri Calendar", arabicLabel: "التقويم الهجري", desc: "Monthly grid & Sunnah fasts", icon: Calendar },
  { id: "zakat", label: "Zakat & Fitrana", arabicLabel: "حاسبة الزكاة", desc: "Nisab, wealth & Fitrana", icon: Calculator },
  { id: "cards", label: "Card Studio", arabicLabel: "بطاقات الدعوة", desc: "Design & share Ayah posters", icon: Palette },
  { id: "media", label: "Media Hub", arabicLabel: "المحتوى المرئي", desc: "Lectures, Tafseer & Nasheeds", icon: Tv },
];

const ALL_DESKTOP_ITEMS: { id: NavTab; label: string; arabicLabel: string; icon: React.ElementType }[] = [
  { id: "prayer", label: "Prayer", arabicLabel: "الصلاة", icon: Clock },
  { id: "quran", label: "Quran", arabicLabel: "القرآن", icon: BookOpen },
  { id: "adhkar", label: "Adhkar", arabicLabel: "الأذكار", icon: Sparkles },
  { id: "qibla", label: "Qibla", arabicLabel: "القبلة", icon: Compass },
  { id: "calendar", label: "Calendar", arabicLabel: "التقويم", icon: Calendar },
  { id: "zakat", label: "Zakat", arabicLabel: "الزكاة", icon: Calculator },
  { id: "cards", label: "Studio", arabicLabel: "البطاقات", icon: Palette },
  { id: "media", label: "Media", arabicLabel: "المحتوى", icon: Tv },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const isMoreActive = ["media", "cards", "zakat", "calendar"].includes(activeTab);

  useEffect(() => {
    if (!isMoreSheetOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMoreSheetOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMoreSheetOpen]);

  return (
    <>
      {/* Mobile Ergonomic Bottom Bar (4 Core Daily Worship Tabs + More Drawer) */}
      <nav
        aria-label="Primary Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-1.5 md:hidden safe-area-pb shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
      >
        <div className="grid grid-cols-5 items-center">
          {PRIMARY_MOBILE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  onChangeTab(item.id);
                }}
                className={`flex flex-col items-center justify-center py-1 min-h-[44px] transition-all active:scale-95 duration-150 ${
                  isActive ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-emerald-500/20 shadow-sm shadow-emerald-500/30 scale-105" : ""
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* 5th Mobile Anchor: More Button */}
          <button
            onClick={() => setIsMoreSheetOpen(!isMoreSheetOpen)}
            aria-expanded={isMoreSheetOpen}
            className={`flex flex-col items-center justify-center py-1 min-h-[44px] transition-all active:scale-95 duration-150 ${
              isMoreActive || isMoreSheetOpen
                ? "text-emerald-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-200 ${
                isMoreActive || isMoreSheetOpen
                  ? "bg-emerald-500/20 shadow-sm shadow-emerald-500/30 scale-105"
                  : ""
              }`}
            >
              <Grid className="w-4 h-4" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Up "More" Sheet */}
      {isMoreSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="More Islamic Tools and Utilities"
          onClick={() => setIsMoreSheetOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border-t border-white/[0.1] rounded-t-3xl p-5 space-y-4 shadow-2xl safe-area-pb animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">More Tools & Media</h4>
              </div>
              <button
                onClick={() => setIsMoreSheetOpen(false)}
                aria-label="Close More Menu"
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SECONDARY_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChangeTab(item.id);
                      setIsMoreSheetOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all active:scale-[0.97] flex flex-col justify-between h-28 ${
                      isActive
                        ? "bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-950/80 border-white/[0.06] hover:border-white/[0.15]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl ${isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-emerald-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-arabic text-xs text-emerald-300/80">{item.arabicLabel}</span>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-white tracking-tight truncate">{item.label}</h5>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop / Tablet Sub-Navbar */}
      <div className="hidden md:flex justify-center border-b border-white/[0.06] bg-slate-950/40 backdrop-blur-md px-4 py-2.5">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-white/[0.08] shadow-inner flex-wrap justify-center">
          {ALL_DESKTOP_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                <span className="text-[11px] opacity-60 font-arabic">{item.arabicLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
