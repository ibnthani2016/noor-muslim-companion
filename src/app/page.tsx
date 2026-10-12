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
  const [activeTab, setActiveTab] = useState<NavTab>("prayer");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

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
