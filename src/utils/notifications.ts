import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { PrayerTimeItem } from "@/types";

export interface NotificationSettings {
  enabled: boolean;
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  adhkarMorning: boolean;
  adhkarEvening: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  fajr: true,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  adhkarMorning: true,
  adhkarEvening: true,
};

let activeWebTimers: ReturnType<typeof setTimeout>[] = [];

function clearWebTimers() {
  activeWebTimers.forEach((t) => clearTimeout(t));
  activeWebTimers = [];
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === "granted";
    } catch (e) {
      console.warn("Native notification permission error:", e);
      return false;
    }
  } else if (typeof window !== "undefined" && "Notification" in window) {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (e) {
      console.warn("Web notification permission error:", e);
      return false;
    }
  }
  return false;
}

export async function schedulePrayerNotifications(
  prayers: PrayerTimeItem[],
  settings: NotificationSettings,
  cityName: string,
  isAudioEnabled: boolean = true
) {
  clearWebTimers();
  if (!settings.enabled) return;

  const now = new Date();
  const sunriseItem = prayers.find((p) => p.id === "sunrise");
  const maghribItem = prayers.find((p) => p.id === "maghrib");

  // Build unified list of scheduled events (5 prayers + Morning/Evening Adhkar)
  const eventsToSchedule: { id: number; title: string; body: string; at: Date; playSound: boolean }[] = [];

  for (const prayer of prayers) {
    if (prayer.id === "sunrise") continue;
    const isEnabled = settings[prayer.id as keyof NotificationSettings];
    if (!isEnabled) continue;

    const prayerTime = new Date(prayer.time);
    if (prayerTime.getTime() > now.getTime()) {
      const id = Math.floor(prayerTime.getTime() / 1000) % 100000;
      eventsToSchedule.push({
        id,
        title: `Time for ${prayer.name} Prayer • حان الآن موعد أذان ${prayer.arabicName}`,
        body: `It is now time for ${prayer.name} (${prayer.formattedTime}) in ${cityName}.`,
        at: prayerTime,
        playSound: isAudioEnabled,
      });
    }
  }

  // Morning Adhkar: 25 minutes after Sunrise
  if (settings.adhkarMorning && sunriseItem) {
    const morningTime = new Date(sunriseItem.time.getTime() + 25 * 60 * 1000);
    if (morningTime.getTime() > now.getTime()) {
      eventsToSchedule.push({
        id: 80001,
        title: "Morning Adhkar • أذكار الصباح",
        body: "Begin your morning with the remembrance of Allah and His daily fortress.",
        at: morningTime,
        playSound: false,
      });
    }
  }

  // Evening Adhkar: 40 minutes before Maghrib
  if (settings.adhkarEvening && maghribItem) {
    const eveningTime = new Date(maghribItem.time.getTime() - 40 * 60 * 1000);
    if (eveningTime.getTime() > now.getTime()) {
      eventsToSchedule.push({
        id: 80002,
        title: "Evening Adhkar • أذكار المساء",
        body: "Time for your evening supplications before Maghrib.",
        at: eveningTime,
        playSound: false,
      });
    }
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      if (eventsToSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: eventsToSchedule.map((ev) => ({
            id: ev.id,
            title: ev.title,
            body: ev.body,
            schedule: { at: ev.at },
            sound: ev.playSound ? "athan.wav" : undefined,
            smallIcon: "ic_stat_name",
            channelId: "prayer_athan_channel",
          })),
        });
      }
    } catch (e) {
      console.warn("Failed to schedule native notifications:", e);
    }
  } else if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    // Schedule in-session Web Notifications for open browser/PWA tabs
    for (const ev of eventsToSchedule) {
      const delayMs = ev.at.getTime() - now.getTime();
      if (delayMs > 0 && delayMs <= 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          showWebNotification(ev.title, ev.body);
        }, delayMs);
        activeWebTimers.push(timer);
      }
    }
  }
}

export function showWebNotification(title: string, body: string) {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    } catch (e) {
      console.warn("Web notification error:", e);
    }
  }
}
