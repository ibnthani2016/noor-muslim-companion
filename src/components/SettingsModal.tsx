"use client";

import React, { useState } from "react";
import {
  CalculationMethodKey,
  MadhabKey,
  LocationCoords,
  PrayerOffsets,
  HighLatitudeRuleKey,
  AppTheme,
} from "@/types";
import { WORLD_CITIES } from "@/data/cities";
import { NotificationSettings, requestNotificationPermissions } from "@/utils/notifications";
import {
  X,
  Check,
  MapPin,
  Sliders,
  Bell,
  Clock,
  Palette,
  Moon,
  Sun,
  Sparkles,
  RotateCcw,
  Plus,
  Minus,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: CalculationMethodKey;
  onChangeMethod: (method: CalculationMethodKey) => void;
  madhab: MadhabKey;
  onChangeMadhab: (madhab: MadhabKey) => void;
  location: LocationCoords;
  onSelectCity: (loc: LocationCoords) => void;
  notificationSettings: NotificationSettings;
  onUpdateNotifications: (settings: NotificationSettings) => void;
  prayerOffsets: PrayerOffsets;
  onChangePrayerOffsets: (offsets: PrayerOffsets) => void;
  highLatRule: HighLatitudeRuleKey;
  onChangeHighLatRule: (rule: HighLatitudeRuleKey) => void;
  hijriOffset: number;
  onChangeHijriOffset: (offset: number) => void;
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
}

const METHODS: { key: CalculationMethodKey; name: string; region: string }[] = [
  { key: "MuslimWorldLeague", name: "Muslim World League (MWL)", region: "Europe, Far East, Global" },
  { key: "ISNA", name: "Islamic Society of North America (ISNA)", region: "USA, Canada" },
  { key: "UmmAlQura", name: "Umm Al-Qura University, Makkah", region: "Saudi Arabia, Arabian Peninsula" },
  { key: "Egyptian", name: "Egyptian General Authority of Survey", region: "Egypt, Africa, Middle East" },
  { key: "Karachi", name: "Univ. of Islamic Sciences, Karachi", region: "Pakistan, India, Bangladesh, Afghanistan" },
  { key: "Dubai", name: "Dubai / UAE Islamic Affairs", region: "United Arab Emirates" },
  { key: "Qatar", name: "Ministry of Awqaf, Qatar", region: "Qatar" },
  { key: "Kuwait", name: "Kuwait Ministry of Awqaf", region: "Kuwait" },
  { key: "Singapore", name: "MUIS, Singapore", region: "Singapore, Malaysia" },
];

const HIGH_LAT_RULES: { key: HighLatitudeRuleKey; name: string; desc: string }[] = [
  {
    key: "MiddleOfTheNight",
    name: "Middle of the Night",
    desc: "Fajr/Isha never exceed half the night (Standard)",
  },
  {
    key: "SeventhOfTheNight",
    name: "One-Seventh of the Night",
    desc: "Recommended for Northern Europe & UK",
  },
  {
    key: "TwilightAngle",
    name: "Angle-Based (Twilight)",
    desc: "Proportional to solar depression angle",
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  method,
  onChangeMethod,
  madhab,
  onChangeMadhab,
  location,
  onSelectCity,
  notificationSettings,
  onUpdateNotifications,
  prayerOffsets,
  onChangePrayerOffsets,
  highLatRule,
  onChangeHighLatRule,
  hijriOffset,
  onChangeHijriOffset,
  theme,
  onChangeTheme,
}) => {
  const [citySearch, setCitySearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "location" | "calculation" | "adjustments" | "notifications"
  >("location");

  if (!isOpen) return null;

  const filteredCities = WORLD_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const toggleNotificationItem = (key: keyof NotificationSettings) => {
    const updated = { ...notificationSettings, [key]: !notificationSettings[key] };
    onUpdateNotifications(updated);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermissions();
    if (granted) {
      alert("Notification permissions granted!");
    } else {
      alert("Notifications are disabled in browser or device system settings.");
    }
  };

  const adjustPrayerMinute = (key: keyof PrayerOffsets, delta: number) => {
    const nextVal = Math.max(-30, Math.min(30, (prayerOffsets[key] || 0) + delta));
    onChangePrayerOffsets({
      ...prayerOffsets,
      [key]: nextVal,
    });
  };

  const resetPrayerOffsets = () => {
    onChangePrayerOffsets({
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg text-white">App Settings & Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Tabs */}
        <div className="grid grid-cols-4 p-2 bg-slate-950/60 border-b border-slate-800 text-[11px] sm:text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab("location")}
            className={`py-2 rounded-xl transition ${
              activeTab === "location"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Location
          </button>
          <button
            onClick={() => setActiveTab("calculation")}
            className={`py-2 rounded-xl transition ${
              activeTab === "calculation"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Calculation
          </button>
          <button
            onClick={() => setActiveTab("adjustments")}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === "adjustments"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Offsets & Theme</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              activeTab === "notifications"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alarms</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "location" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Worldwide City
                </label>
                <input
                  type="text"
                  placeholder="Search city or country (e.g., Cairo, Makkah, London)..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {filteredCities.map((c) => {
                  const isSelected =
                    c.city === location.city && c.country === location.country;
                  return (
                    <button
                      key={`${c.city}-${c.country}`}
                      onClick={() => {
                        onSelectCity(c);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left text-xs ${
                        isSelected
                          ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold"
                          : "bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-white">{c.city}</span>,{" "}
                          <span className="text-slate-400">{c.country}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "calculation" && (
            <div className="space-y-5">
              {/* Madhab Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Asr Calculation (Madhab)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => onChangeMadhab("shafi")}
                    className={`p-3 rounded-xl border text-left transition ${
                      madhab === "shafi"
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold text-white mb-0.5">Shafi / Standard</div>
                    <div className="text-[10px] text-slate-400">
                      Shafi, Maliki, Hanbali (Shadow = 1x)
                    </div>
                  </button>

                  <button
                    onClick={() => onChangeMadhab("hanafi")}
                    className={`p-3 rounded-xl border text-left transition ${
                      madhab === "hanafi"
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold text-white mb-0.5">Hanafi</div>
                    <div className="text-[10px] text-slate-400">
                      Hanafi jurisprudence (Shadow = 2x)
                    </div>
                  </button>
                </div>
              </div>

              {/* High Latitude Rule */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  High-Latitude Rule (Above 48°N/S)
                </label>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {HIGH_LAT_RULES.map((r) => {
                    const isSelected = highLatRule === r.key;
                    return (
                      <button
                        key={r.key}
                        onClick={() => onChangeHighLatRule(r.key)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition text-left ${
                          isSelected
                            ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold"
                            : "bg-slate-950/40 border-slate-800 hover:bg-slate-800/60 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">{r.name}</div>
                          <div className="text-[10px] text-slate-400">{r.desc}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calculation Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Calculation Authority
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {METHODS.map((m) => {
                    const isSelected = method === m.key;
                    return (
                      <button
                        key={m.key}
                        onClick={() => onChangeMethod(m.key)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left text-xs ${
                          isSelected
                            ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold"
                            : "bg-slate-950/40 border-slate-800 hover:bg-slate-800/60 text-slate-300"
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-white">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.region}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "adjustments" && (
            <div className="space-y-5">
              {/* Visual Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Display Theme</span>
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    {
                      id: "emerald-dark" as AppTheme,
                      title: "Emerald Dark",
                      subtitle: "Signature Night",
                      icon: Sparkles,
                    },
                    {
                      id: "oled-black" as AppTheme,
                      title: "OLED Pitch",
                      subtitle: "Zero Glare Tahajjud",
                      icon: Moon,
                    },
                    {
                      id: "sepia" as AppTheme,
                      title: "Warm Sepia",
                      subtitle: "Paper Mushaf Feel",
                      icon: Sun,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = theme === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onChangeTheme(item.id)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          active
                            ? "bg-emerald-950/50 border-emerald-500 text-emerald-300"
                            : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1.5 text-emerald-400" />
                        <div className="font-bold text-white">{item.title}</div>
                        <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Per-Prayer Minute Offsets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Local Mosque Minute Adjustments (±30m)
                  </label>
                  <button
                    onClick={resetPrayerOffsets}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {(
                    [
                      { key: "fajr", label: "Fajr" },
                      { key: "sunrise", label: "Sunrise" },
                      { key: "dhuhr", label: "Dhuhr" },
                      { key: "asr", label: "Asr" },
                      { key: "maghrib", label: "Maghrib" },
                      { key: "isha", label: "Isha" },
                    ] as { key: keyof PrayerOffsets; label: string }[]
                  ).map((p) => {
                    const val = prayerOffsets[p.key] || 0;
                    return (
                      <div
                        key={p.key}
                        className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between"
                      >
                        <span className="font-semibold text-white">{p.label}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => adjustPrayerMinute(p.key, -1)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            aria-label={`Subtract 1 minute from ${p.label}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span
                            className={`font-mono font-bold min-w-[32px] text-center ${
                              val !== 0 ? "text-emerald-400" : "text-slate-400"
                            }`}
                          >
                            {val > 0 ? `+${val}m` : `${val}m`}
                          </span>
                          <button
                            onClick={() => adjustPrayerMinute(p.key, 1)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            aria-label={`Add 1 minute to ${p.label}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hijri Moon-Sighting Offset */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hijri Moon-Sighting Adjustment
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs">
                  <div>
                    <div className="font-semibold text-white">Moon-Sighting Day Offset</div>
                    <div className="text-[10px] text-slate-400">
                      Align Islamic dates with your local moon-sighting committee (-2 to +2 days)
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[-2, -1, 0, 1, 2].map((off) => (
                      <button
                        key={off}
                        onClick={() => onChangeHijriOffset(off)}
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${
                          hijriOffset === off
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {off > 0 ? `+${off}` : off}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-5">
              {/* Permission Banner */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Prayer & Adhkar Reminders</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Receive background alerts when it is time to pray.
                  </p>
                </div>
                <button
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
                >
                  Enable Permissions
                </button>
              </div>

              {/* Master toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">Enable All Reminders</h5>
                    <p className="text-[11px] text-slate-400">
                      Background sound & push notification alerts
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={notificationSettings.enabled}
                  onChange={() => toggleNotificationItem("enabled")}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Prayer Toggles */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Individual Prayer Alarms
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: "fajr", name: "Fajr (الفجر)" },
                    { key: "dhuhr", name: "Dhuhr (الظهر)" },
                    { key: "asr", name: "Asr (العصر)" },
                    { key: "maghrib", name: "Maghrib (المغرب)" },
                    { key: "isha", name: "Isha (العشاء)" },
                  ].map((p) => {
                    const isChecked = notificationSettings[
                      p.key as keyof NotificationSettings
                    ] as boolean;
                    return (
                      <div
                        key={p.key}
                        onClick={() =>
                          toggleNotificationItem(p.key as keyof NotificationSettings)
                        }
                        className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                          isChecked && notificationSettings.enabled
                            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                            : "bg-slate-950/40 border-slate-800/80 text-slate-400"
                        }`}
                      >
                        <span className="font-semibold text-white">{p.name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked && notificationSettings.enabled}
                          onChange={() => {}}
                          className="accent-emerald-500 pointer-events-none"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Adhkar Reminders */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daily Supplications Reminders
                </label>
                <div className="space-y-2 text-xs">
                  <div
                    onClick={() => toggleNotificationItem("adhkarMorning")}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                      notificationSettings.adhkarMorning && notificationSettings.enabled
                        ? "bg-teal-950/40 border-teal-500/60 text-teal-300"
                        : "bg-slate-950/40 border-slate-800/80 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">Morning Adhkar (أذكار الصباح)</div>
                      <div className="text-[10px] text-slate-400">
                        Reminder 30 mins after sunrise for daily protection
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.adhkarMorning && notificationSettings.enabled}
                      onChange={() => {}}
                      className="accent-teal-500 pointer-events-none"
                    />
                  </div>

                  <div
                    onClick={() => toggleNotificationItem("adhkarEvening")}
                    className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                      notificationSettings.adhkarEvening && notificationSettings.enabled
                        ? "bg-teal-950/40 border-teal-500/60 text-teal-300"
                        : "bg-slate-950/40 border-slate-800/80 text-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">Evening Adhkar (أذكار المساء)</div>
                      <div className="text-[10px] text-slate-400">
                        Reminder 30 mins after Asr for evening fortress
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.adhkarEvening && notificationSettings.enabled}
                      onChange={() => {}}
                      className="accent-teal-500 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
