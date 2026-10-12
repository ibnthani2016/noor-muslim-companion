"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LocationCoords } from "@/types";
import { calculateQiblaBearing, calculateDistanceToKaaba, getDirectionName } from "@/utils/qibla";
import { Compass, RotateCw, CheckCircle2, AlertTriangle, Sliders, Smartphone } from "lucide-react";

interface QiblaCompassProps {
  location: LocationCoords;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ location }) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt");
  const [manualOffset, setManualOffset] = useState<number>(0);
  const [useManualMode, setUseManualMode] = useState<boolean>(false);

  // Exact target angle to Kaaba
  const qiblaAngle = calculateQiblaBearing(location.latitude, location.longitude);
  const distanceKm = calculateDistanceToKaaba(location.latitude, location.longitude);
  const directionName = getDirectionName(qiblaAngle);

  // Effective device heading (sensor or manual simulator)
  const currentHeading = useManualMode ? manualOffset : deviceHeading;

  // The needle rotation relative to user phone's top
  // If user phone is facing currentHeading, Kaaba is at (qiblaAngle - currentHeading)
  const relativeAngle = ((qiblaAngle - currentHeading + 360) % 360);

  // Is phone aligned within ±3 degrees of Kaaba
  const isAligned = relativeAngle <= 3 || relativeAngle >= 357;

  // Haptic feedback when aligned
  useEffect(() => {
    if (isAligned && typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch (e) {
        // Ignored on non-supporting devices
      }
    }
  }, [isAligned]);

  // Handle device orientation
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading = 0;

    // iOS WebKit compass heading
    if ("webkitCompassHeading" in event && typeof (event as any).webkitCompassHeading === "number") {
      heading = (event as any).webkitCompassHeading;
      setHasSensor(true);
    }
    // Android Chrome absolute orientation
    else if (event.alpha !== null && event.alpha !== undefined) {
      heading = (360 - event.alpha) % 360;
      setHasSensor(true);
    }

    setDeviceHeading(Math.round(heading));
  }, []);

  const requestOrientationPermission = async () => {
    if (
      typeof window !== "undefined" &&
      typeof (DeviceOrientationEvent as any)?.requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === "granted") {
          setPermissionState("granted");
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          setPermissionState("denied");
        }
      } catch (err) {
        console.error("Error requesting orientation permission:", err);
        setPermissionState("denied");
      }
    } else {
      // Standard Android / Desktop listener
      window.addEventListener("deviceorientation", handleOrientation, true);
      setPermissionState("granted");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Auto attach if permission not strictly required (Android / Chrome)
      if (typeof (DeviceOrientationEvent as any)?.requestPermission !== "function") {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation, true);
      }
    };
  }, [handleOrientation]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Alignment Status Banner */}
      <div
        className={`rounded-2xl p-4 transition-all duration-300 border flex items-center justify-between ${
          isAligned
            ? "bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20"
            : "bg-slate-900/80 border-slate-800 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isAligned ? "bg-emerald-500/20 text-emerald-300 animate-pulse" : "bg-slate-800 text-slate-400"
            }`}
          >
            {isAligned ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Compass className="w-5 h-5 text-teal-400" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              {isAligned ? "Aligned with Kaaba! مواجه للكعبة" : `Rotate Phone toward ${qiblaAngle.toFixed(0)}° ${directionName}`}
            </h3>
            <p className="text-xs text-slate-400">
              Qibla Bearing: <strong className="text-emerald-400">{qiblaAngle.toFixed(1)}°</strong> from True North
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold text-white">
            {distanceKm.toLocaleString()} km
          </div>
          <div className="text-[10px] text-slate-400">To Makkah</div>
        </div>
      </div>

      {/* Compass Interactive Dial */}
      <div className="relative flex flex-col items-center justify-center py-6">
        {/* Alignment Glow Ring */}
        <div
          className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full flex items-center justify-center transition-all duration-500 ${
            isAligned
              ? "ring-8 ring-emerald-500/40 shadow-2xl shadow-emerald-500/30 scale-105"
              : "ring-2 ring-slate-800 shadow-xl"
          } bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900`}
        >
          {/* Compass Face Dial (Rotates opposite to device heading) */}
          <div
            className="absolute inset-4 rounded-full border border-slate-800/80 flex items-center justify-center transition-transform duration-200 ease-out"
            style={{ transform: `rotate(${-currentHeading}deg)` }}
          >
            {/* Cardinal Direction Markers */}
            <span className="absolute top-2 text-xs font-bold font-mono text-rose-400">N</span>
            <span className="absolute right-2 text-xs font-bold font-mono text-slate-400">E</span>
            <span className="absolute bottom-2 text-xs font-bold font-mono text-slate-400">S</span>
            <span className="absolute left-2 text-xs font-bold font-mono text-slate-400">W</span>

            {/* Dial Ticks (Every 30 degrees) */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-full pointer-events-none flex justify-center"
                style={{ transform: `rotate(${i * 30}deg)` }}
              >
                <div
                  className={`w-0.5 ${
                    i % 3 === 0 ? "h-3 bg-slate-500" : "h-1.5 bg-slate-700"
                  }`}
                />
              </div>
            ))}

            {/* Kaaba Direction Indicator on Dial */}
            <div
              className="absolute w-full h-full flex flex-col items-center pointer-events-none"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              {/* Kaaba Marker */}
              <div className="mt-1 flex flex-col items-center">
                <div className="w-7 h-7 bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center justify-center shadow-lg shadow-amber-400/40 text-xs border border-amber-200 animate-bounce">
                  🕋
                </div>
                <span className="text-[9px] font-bold text-amber-300 bg-slate-950/80 px-1 rounded mt-0.5">
                  Qibla
                </span>
              </div>
            </div>
          </div>

          {/* Center Phone Bearing Crosshair & Target Needle */}
          <div className="relative z-10 w-24 h-24 rounded-full bg-slate-900/90 border border-emerald-500/30 flex flex-col items-center justify-center shadow-inner">
            <span className="text-xl font-mono font-extrabold text-emerald-400">
              {relativeAngle.toFixed(0)}°
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {isAligned ? "Aligned" : "Offset"}
            </span>
          </div>

          {/* North Needle Indicator (Top of device) */}
          <div className="absolute top-0 w-3 h-3 bg-emerald-500 transform rotate-45 -translate-y-1 shadow-sm" />
        </div>
      </div>

      {/* Sensor / Simulator Controls */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Orientation Sensor
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseManualMode(!useManualMode)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>{useManualMode ? "Switch to Sensor" : "Simulate / Manual"}</span>
            </button>

            {typeof window !== "undefined" &&
              typeof (DeviceOrientationEvent as any)?.requestPermission === "function" &&
              permissionState !== "granted" && (
                <button
                  onClick={requestOrientationPermission}
                  className="px-2.5 py-1 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Enable Sensor
                </button>
              )}
          </div>
        </div>

        {useManualMode ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Simulate Phone Compass Heading:</span>
              <span className="font-mono font-bold text-white">{manualOffset}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="359"
              value={manualOffset}
              onChange={(e) => setManualOffset(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0° (North)</span>
              <span>90° (East)</span>
              <span>180° (South)</span>
              <span>270° (West)</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Status:{" "}
              <strong className={hasSensor ? "text-emerald-400" : "text-amber-400"}>
                {hasSensor ? "Active Sensor Feed" : "No device sensor detected (use manual mode)"}
              </strong>
            </span>
            <span className="font-mono">Current Heading: {currentHeading}°</span>
          </div>
        )}
      </div>

      {/* How to use Guide */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">How to get accurate Qibla:</p>
        <ul className="list-disc list-inside space-y-0.5 text-slate-400">
          <li>Hold phone flat like a real compass.</li>
          <li>Keep away from magnetic objects, laptops, or metal cases.</li>
          <li>Rotate in a figure-8 motion if calibration is required.</li>
        </ul>
      </div>
    </div>
  );
};
