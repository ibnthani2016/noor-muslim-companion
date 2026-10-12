"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  PrayerTimes,
  Madhab,
  SunnahTimes,
  Prayer,
} from "adhan";
import { LocationCoords, CalculationMethodKey, MadhabKey, PrayerTimeItem } from "@/types";
import { DEFAULT_CITIES } from "@/data/cities";
import { formatHijriDate } from "@/utils/hijri";

export function usePrayerTimes() {
  const [location, setLocation] = useState<LocationCoords>(DEFAULT_CITIES[0]); // Default Makkah
  const [methodKey, setMethodKey] = useState<CalculationMethodKey>("UmmAlQura");
  const [madhabKey, setMadhabKey] = useState<MadhabKey>("shafi");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem("noor_location");
      if (savedLoc) setLocation(JSON.parse(savedLoc));

      const savedMethod = localStorage.getItem("noor_method") as CalculationMethodKey;
      if (savedMethod) setMethodKey(savedMethod);

      const savedMadhab = localStorage.getItem("noor_madhab") as MadhabKey;
      if (savedMadhab) setMadhabKey(savedMadhab);
    } catch (e) {
      console.warn("Error reading localStorage:", e);
    }
  }, []);

  // Live timer tick every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Resolve calculation method parameters
  const calculationParameters = useMemo<CalculationParameters>(() => {
    let params: CalculationParameters;
    switch (methodKey) {
      case "MuslimWorldLeague":
        params = CalculationMethod.MuslimWorldLeague();
        break;
      case "Egyptian":
        params = CalculationMethod.Egyptian();
        break;
      case "Karachi":
        params = CalculationMethod.Karachi();
        break;
      case "UmmAlQura":
        params = CalculationMethod.UmmAlQura();
        break;
      case "Dubai":
        params = CalculationMethod.Dubai();
        break;
      case "Qatar":
        params = CalculationMethod.Qatar();
        break;
      case "Kuwait":
        params = CalculationMethod.Kuwait();
        break;
      case "Singapore":
        params = CalculationMethod.Singapore();
        break;
      case "NorthAmerica":
      case "ISNA":
      default:
        params = CalculationMethod.NorthAmerica();
        break;
    }

    // Set Madhab for Asr
    params.madhab = madhabKey === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
    return params;
  }, [methodKey, madhabKey]);

  // Compute offline astronomical prayer times
  const prayerTimes = useMemo(() => {
    const coords = new Coordinates(location.latitude, location.longitude);
    return new PrayerTimes(coords, currentTime, calculationParameters);
  }, [location, currentTime, calculationParameters]);

  // Compute sunnah times (Midnight & Last Third / Tahajjud)
  const sunnahTimes = useMemo(() => {
    return new SunnahTimes(prayerTimes);
  }, [prayerTimes]);

  // Determine next and current prayer
  const nextPrayerKey = useMemo(() => {
    return prayerTimes.nextPrayer();
  }, [prayerTimes]);

  const currentPrayerKey = useMemo(() => {
    return prayerTimes.currentPrayer();
  }, [prayerTimes]);

  // Format single date to HH:MM AM/PM
  const formatTime = useCallback((date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Construct structured prayer items
  const prayersList = useMemo<PrayerTimeItem[]>(() => {
    const now = currentTime.getTime();
    const isNext = (p: any) => nextPrayerKey === p;
    const isPast = (date: Date) => date.getTime() < now;

    return [
      {
        id: "fajr",
        name: "Fajr",
        arabicName: "الفَجْر",
        time: prayerTimes.fajr,
        formattedTime: formatTime(prayerTimes.fajr),
        isNext: isNext(Prayer.Fajr),
        isPast: isPast(prayerTimes.fajr),
      },
      {
        id: "sunrise",
        name: "Sunrise",
        arabicName: "الشُّرُوق",
        time: prayerTimes.sunrise,
        formattedTime: formatTime(prayerTimes.sunrise),
        isNext: isNext(Prayer.Sunrise),
        isPast: isPast(prayerTimes.sunrise),
      },
      {
        id: "dhuhr",
        name: "Dhuhr",
        arabicName: "الظُّهْر",
        time: prayerTimes.dhuhr,
        formattedTime: formatTime(prayerTimes.dhuhr),
        isNext: isNext(Prayer.Dhuhr),
        isPast: isPast(prayerTimes.dhuhr),
      },
      {
        id: "asr",
        name: "Asr",
        arabicName: "العَصْر",
        time: prayerTimes.asr,
        formattedTime: formatTime(prayerTimes.asr),
        isNext: isNext(Prayer.Asr),
        isPast: isPast(prayerTimes.asr),
      },
      {
        id: "maghrib",
        name: "Maghrib",
        arabicName: "المَغْرِب",
        time: prayerTimes.maghrib,
        formattedTime: formatTime(prayerTimes.maghrib),
        isNext: isNext(Prayer.Maghrib),
        isPast: isPast(prayerTimes.maghrib),
      },
      {
        id: "isha",
        name: "Isha",
        arabicName: "العِشَاء",
        time: prayerTimes.isha,
        formattedTime: formatTime(prayerTimes.isha),
        isNext: isNext(Prayer.Isha),
        isPast: isPast(prayerTimes.isha),
      },
    ];
  }, [prayerTimes, nextPrayerKey, currentTime, formatTime]);

  // Compute countdown to next prayer
  const countdown = useMemo(() => {
    const nextTime = prayerTimes.timeForPrayer(nextPrayerKey);
    if (!nextTime) {
      // If after Isha, next prayer is Fajr tomorrow
      const tomorrow = new Date(currentTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const coords = new Coordinates(location.latitude, location.longitude);
      const tomorrowPT = new PrayerTimes(coords, tomorrow, calculationParameters);
      const diff = tomorrowPT.fajr.getTime() - currentTime.getTime();
      return Math.max(0, Math.floor(diff / 1000));
    }
    const diff = nextTime.getTime() - currentTime.getTime();
    return Math.max(0, Math.floor(diff / 1000));
  }, [prayerTimes, nextPrayerKey, currentTime, location, calculationParameters]);

  const formattedCountdown = useMemo(() => {
    const hrs = Math.floor(countdown / 3600);
    const mins = Math.floor((countdown % 3600) / 60);
    const secs = countdown % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }, [countdown]);

  // Detect user GPS location
  const detectLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your device.");
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc: LocationCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          city: "Current Location",
          country: "GPS",
        };
        setLocation(newLoc);
        localStorage.setItem("noor_location", JSON.stringify(newLoc));
        setIsDetectingLocation(false);
      },
      (err) => {
        setIsDetectingLocation(false);
        setLocationError(err.message || "Unable to acquire GPS coordinates.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const updateLocation = useCallback((newLoc: LocationCoords) => {
    setLocation(newLoc);
    localStorage.setItem("noor_location", JSON.stringify(newLoc));
  }, []);

  const updateMethod = useCallback((newMethod: CalculationMethodKey) => {
    setMethodKey(newMethod);
    localStorage.setItem("noor_method", newMethod);
  }, []);

  const updateMadhab = useCallback((newMadhab: MadhabKey) => {
    setMadhabKey(newMadhab);
    localStorage.setItem("noor_madhab", newMadhab);
  }, []);

  const nextPrayerItem = prayersList.find((p) => p.isNext) || prayersList[0];

  return {
    location,
    setLocation: updateLocation,
    updateLocation,
    method: methodKey,
    methodKey,
    setMethod: updateMethod,
    updateMethod,
    madhab: madhabKey,
    madhabKey,
    setMadhab: updateMadhab,
    updateMadhab,
    currentTime,
    prayers: prayersList,
    prayersList,
    nextPrayer: nextPrayerItem,
    nextPrayerItem,
    timeRemaining: formattedCountdown,
    formattedCountdown,
    countdownSeconds: countdown,
    currentPrayerKey,
    sunnahTimes: {
      midnight: sunnahTimes.middleOfTheNight,
      lastThird: sunnahTimes.lastThirdOfTheNight,
      middleOfTheNight: formatTime(sunnahTimes.middleOfTheNight),
      lastThirdOfTheNight: formatTime(sunnahTimes.lastThirdOfTheNight),
    },
    hijriDateString: formatHijriDate(currentTime),
    refreshLocation: detectLocation,
    detectLocation,
    isLocating: isDetectingLocation,
    isDetectingLocation,
    locationError,
  };
}
