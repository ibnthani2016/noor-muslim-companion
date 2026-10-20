"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Navbar } from "@/components/Navbar";
import { BottomNav, NavTab } from "@/components/BottomNav";
import { PrayerTimes } from "@/components/PrayerTimes";
import { SettingsModal } from "@/components/SettingsModal";
import { AppTheme } from "@/types";
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  schedulePrayerNotifications,
} from "@/utils/notifications";

const TabLoadingSkeleton = () => (
  <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-medium text-slate-300">Loading module...</span>
  </div>
);

const QuranReader = dynamic(
  () => import("@/components/QuranReader").then((m) => m.QuranReader),
  { loading: () => <TabLoadingSkeleton /> }
);
const AdhkarTasbih = dynamic(
  () => import("@/components/AdhkarTasbih").then((m) => m.AdhkarTasbih),
  { loading: () => <TabLoadingSkeleton /> }
);
const QiblaCompass = dynamic(
  () => import("@/components/QiblaCompass").then((m) => m.QiblaCompass),
  { loading: () => <TabLoadingSkeleton /> }
);
const ZakatCalculator = dynamic(
  () => import("@/components/ZakatCalculator").then((m) => m.ZakatCalculator),
  { loading: () => <TabLoadingSkeleton /> }
);
const HijriCalendar = dynamic(
  () => import("@/components/HijriCalendar").then((m) => m.HijriCalendar),
  { loading: () => <TabLoadingSkeleton /> }
);
const MediaHub = dynamic(
  () => import("@/components/MediaHub").then((m) => m.MediaHub),
  { loading: () => <TabLoadingSkeleton /> }
);
const CardStudio = dynamic(
  () => import("@/components/CardStudio").then((m) => m.CardStudio),
  { loading: () => <TabLoadingSkeleton /> }
);

const THEME_CYCLE: AppTheme[] = ["emerald-dark", "oled-black", "sepia"];

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("prayer");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<AppTheme>("emerald-dark");
  const [cardStudioAyah, setCardStudioAyah] = useState<
    | {
        arabic: string;
        english: string;
        reference: string;
      }
    | undefined
  >(undefined);

  const handleOpenCardStudioForAyah = (ayahData: {
    arabic: string;
    english: string;
    reference: string;
  }) => {
    setCardStudioAyah(ayahData);
    setActiveTab("cards");
  };

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedAudio = localStorage.getItem("noor_audio_enabled");
      if (savedAudio !== null) {
        setIsAudioEnabled(savedAudio === "true");
      }
      const savedTheme = localStorage.getItem("noor_app_theme") as AppTheme | null;
      if (savedTheme && THEME_CYCLE.includes(savedTheme)) {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      }
    }
  }, []);

  const handleChangeTheme = (nextTheme: AppTheme) => {
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_app_theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    }
  };

  const handleCycleTheme = () => {
    const nextIdx = (THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length;
    handleChangeTheme(THEME_CYCLE[nextIdx]);
  };

  const handleToggleAudio = () => {
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_audio_enabled", String(next));
    }
  };

  // Notification preferences
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_notification_settings");
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_SETTINGS;
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  const {
    location,
    setLocation,
    method,
    setMethod,
    madhab,
    setMadhab,
    prayerOffsets,
    setPrayerOffsets,
    highLatRule,
    setHighLatRule,
    hijriOffset,
    setHijriOffset,
    prayers,
    nextPrayer,
    nextPrayerTargetTime,
    timeRemaining,
    sunnahTimes,
    hijriDateString,
    refreshLocation,
    isLocating,
  } = usePrayerTimes();

  // Schedule notifications when prayers or settings update
  useEffect(() => {
    if (prayers.length > 0) {
      schedulePrayerNotifications(prayers, notificationSettings, location.city, isAudioEnabled);
    }
  }, [prayers, notificationSettings, location.city, isAudioEnabled]);

  const handleUpdateNotifications = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_notification_settings", JSON.stringify(settings));
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-white">
        <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-emerald-900/30 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-xl font-serif">
                ن
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-lg text-white tracking-tight">Noor</h1>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">
                    نُور
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Daily Islamic Companion</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-300">Loading Noor Companion...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Top App Header */}
      <Navbar
        location={location}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hijriString={hijriDateString}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={handleToggleAudio}
        theme={theme}
        onCycleTheme={handleCycleTheme}
      />

      {/* Responsive Navigation Tabs (Desktop pills & mobile bottom bar) */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-24 md:pb-12">
        {activeTab === "prayer" && (
          <PrayerTimes
            prayers={prayers}
            nextPrayer={nextPrayer}
            nextPrayerTargetTime={nextPrayerTargetTime}
            timeRemaining={timeRemaining}
            location={location}
            onRefreshLocation={refreshLocation}
            isLocating={isLocating}
            sunnahTimes={sunnahTimes}
            onNavigateToQibla={() => setActiveTab("qibla")}
            isAudioEnabled={isAudioEnabled}
            hijriOffset={hijriOffset}
          />
        )}

        {activeTab === "quran" && <QuranReader onOpenCardStudio={handleOpenCardStudioForAyah} />}

        {activeTab === "media" && <MediaHub />}

        {activeTab === "cards" && <CardStudio initialAyah={cardStudioAyah} />}

        {activeTab === "adhkar" && <AdhkarTasbih />}

        {activeTab === "qibla" && <QiblaCompass location={location} />}

        {activeTab === "zakat" && <ZakatCalculator />}

        {activeTab === "calendar" && (
          <HijriCalendar hijriOffset={hijriOffset} onChangeHijriOffset={setHijriOffset} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        method={method}
        onChangeMethod={setMethod}
        madhab={madhab}
        onChangeMadhab={setMadhab}
        location={location}
        onSelectCity={setLocation}
        notificationSettings={notificationSettings}
        onUpdateNotifications={handleUpdateNotifications}
        prayerOffsets={prayerOffsets}
        onChangePrayerOffsets={setPrayerOffsets}
        highLatRule={highLatRule}
        onChangeHighLatRule={setHighLatRule}
        hijriOffset={hijriOffset}
        onChangeHijriOffset={setHijriOffset}
        theme={theme}
        onChangeTheme={handleChangeTheme}
      />
    </div>
  );
}
