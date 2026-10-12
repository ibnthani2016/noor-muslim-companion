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
  cityName: string
) {
  if (!settings.enabled) return;

  const now = new Date();

  if (Capacitor.isNativePlatform()) {
    try {
      // Cancel previous scheduled notifications to avoid duplicates
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      const notificationsToSchedule = [];

      // Map prayer items
      for (const prayer of prayers) {
        if (prayer.id === "sunrise") continue; // Sunrise is not a prayer
        const isEnabled = settings[prayer.id as keyof NotificationSettings];
        if (!isEnabled) continue;

        const prayerTime = new Date(prayer.time);
        if (prayerTime.getTime() > now.getTime()) {
          const id = Math.floor(prayerTime.getTime() / 1000) % 100000;
          notificationsToSchedule.push({
            id,
            title: `Time for ${prayer.name} Prayer • حان الآن موعد أذان ${prayer.arabicName}`,
            body: `It is now time for ${prayer.name} (${prayer.formattedTime}) in ${cityName}.`,
            schedule: { at: prayerTime },
            sound: "athan.wav",
            smallIcon: "ic_stat_name",
            channelId: "prayer_athan_channel",
          });
        }
      }

      if (notificationsToSchedule.length > 0) {
        await LocalNotifications.schedule({
          notifications: notificationsToSchedule,
        });
      }
    } catch (e) {
      console.warn("Failed to schedule native notifications:", e);
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
