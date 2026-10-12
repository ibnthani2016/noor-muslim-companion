"use client";

import React from "react";
import { Clock, Compass, BookOpen, Sparkles, Calculator, Calendar } from "lucide-react";

export type NavTab = "prayer" | "qibla" | "quran" | "adhkar" | "zakat" | "calendar";

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

const NAV_ITEMS: { id: NavTab; label: string; arabicLabel: string; icon: React.ElementType }[] = [
  { id: "prayer", label: "Prayer", arabicLabel: "الصلاة", icon: Clock },
  { id: "qibla", label: "Qibla", arabicLabel: "القبلة", icon: Compass },
  { id: "quran", label: "Quran", arabicLabel: "القرآن", icon: BookOpen },
  { id: "adhkar", label: "Adhkar", arabicLabel: "الأذكار", icon: Sparkles },
  { id: "zakat", label: "Zakat", arabicLabel: "الزكاة", icon: Calculator },
  { id: "calendar", label: "Calendar", arabicLabel: "التقويم", icon: Calendar },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-emerald-950/40 px-2 py-1 md:hidden safe-area-pb">
        <div className="grid grid-cols-6 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 transition-all ${
                  isActive
                    ? "text-emerald-400 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? "bg-emerald-500/15 scale-110 shadow-sm shadow-emerald-500/20" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop / Tablet Sub-Navbar */}
      <div className="hidden md:flex justify-center border-b border-slate-800/80 bg-slate-900/40 px-4 py-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-inner">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                <span className="text-xs opacity-60 font-arabic">{item.arabicLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
