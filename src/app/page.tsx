"use client";

import React, { useState, useEffect } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Navbar } from "@/components/Navbar";
import { BottomNav, NavTab } from "@/components/BottomNav";
import { PrayerTimes } from "@/components/PrayerTimes";
import { QiblaCompass } from "@/components/QiblaCompass";
import { QuranReader } from "@/components/QuranReader";
import { AdhkarTasbih } from "@/components/AdhkarTasbih";
import { ZakatCalculator } from "@/components/ZakatCalculator";
import { HijriCalendar } from "@/components/HijriCalendar";
import { SettingsModal } from "@/components/SettingsModal";
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  schedulePrayerNotifications,
} from "@/utils/notifications";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("prayer");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    prayers,
    nextPrayer,
    timeRemaining,
    sunnahTimes,
    hijriDateString,
    refreshLocation,
    isLocating,
  } = usePrayerTimes();

  // Schedule notifications when prayers or settings update
  useEffect(() => {
    if (prayers.length > 0) {
      schedulePrayerNotifications(prayers, notificationSettings, location.city);
    }
  }, [prayers, notificationSettings, location.city]);

  const handleUpdateNotifications = (settings: NotificationSettings) => {
    setNotificationSettings(settings);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_notification_settings", JSON.stringify(settings));
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top App Header */}
      <Navbar
        location={location}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hijriString={hijriDateString}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled(!isAudioEnabled)}
      />

      {/* Responsive Navigation Tabs (Desktop pills & mobile bottom bar) */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-24 md:pb-12">
        {activeTab === "prayer" && (
          <PrayerTimes
            prayers={prayers}
            nextPrayer={nextPrayer}
            timeRemaining={timeRemaining}
            location={location}
            onRefreshLocation={refreshLocation}
            isLocating={isLocating}
            sunnahTimes={sunnahTimes}
            onNavigateToQibla={() => setActiveTab("qibla")}
          />
        )}

        {activeTab === "qibla" && <QiblaCompass location={location} />}

        {activeTab === "quran" && <QuranReader />}

        {activeTab === "adhkar" && <AdhkarTasbih />}

        {activeTab === "zakat" && <ZakatCalculator />}

        {activeTab === "calendar" && <HijriCalendar />}
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
      />
    </div>
  );
}
