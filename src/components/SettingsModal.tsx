"use client";

import React, { useState } from "react";
import { CalculationMethodKey, MadhabKey, LocationCoords } from "@/types";
import { WORLD_CITIES } from "@/data/cities";
import { NotificationSettings, requestNotificationPermissions } from "@/utils/notifications";
import { X, Check, MapPin, Globe, Compass, Sliders, Shield, Bell, Volume2, Sparkles } from "lucide-react";

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
}) => {
  const [citySearch, setCitySearch] = useState("");
  const [activeTab, setActiveTab] = useState<"location" | "calculation" | "notifications">("location");
  const [permissionGranted, setPermissionGranted] = useState<boolean>(true);

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
    setPermissionGranted(granted);
    if (granted) {
      alert("Notification permissions granted!");
    } else {
      alert("Notifications are disabled in browser or device system settings.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg text-white">App Settings & Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Tabs */}
        <div className="grid grid-cols-3 p-2 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold">
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
            Authorities & Madhab
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
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

              {/* Calculation Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Calculation Authority
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                    <p className="text-[11px] text-slate-400">Background sound & push notification alerts</p>
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
                    const isChecked = notificationSettings[p.key as keyof NotificationSettings] as boolean;
                    return (
                      <div
                        key={p.key}
                        onClick={() => toggleNotificationItem(p.key as keyof NotificationSettings)}
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
                      <div className="text-[10px] text-slate-400">Reminder after sunrise for daily protection</div>
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
                      <div className="text-[10px] text-slate-400">Reminder before Maghrib for evening fortress</div>
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
