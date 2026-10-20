"use client";

import React, { useState, useMemo } from "react";
import { ISLAMIC_EVENTS, getHijriDateDetails } from "@/utils/hijri";
import {
  Calendar,
  Moon,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from "lucide-react";

interface HijriCalendarProps {
  hijriOffset?: number;
  onChangeHijriOffset?: (offset: number) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const HijriCalendar: React.FC<HijriCalendarProps> = ({
  hijriOffset = 0,
  onChangeHijriOffset,
}) => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(() => today);

  const hijriToday = useMemo(
    () => getHijriDateDetails(today, hijriOffset),
    [today, hijriOffset]
  );

  const selectedHijri = useMemo(
    () => getHijriDateDetails(selectedDate, hijriOffset),
    [selectedDate, hijriOffset]
  );

  // Build 7-column monthly grid cells for the currently viewed Gregorian month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: {
      date: Date | null;
      gregorianDay: number;
      hijri: ReturnType<typeof getHijriDateDetails> | null;
      isToday: boolean;
      isSelected: boolean;
      isWhiteDay: boolean;
      isSunnahMondayThursday: boolean;
      holidayName: string | null;
    }[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({
        date: null,
        gregorianDay: 0,
        hijri: null,
        isToday: false,
        isSelected: false,
        isWhiteDay: false,
        isSunnahMondayThursday: false,
        holidayName: null,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      const hInfo = getHijriDateDetails(cellDate, hijriOffset);
      const isToday =
        cellDate.getDate() === today.getDate() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getFullYear() === today.getFullYear();
      const isSelected =
        cellDate.getDate() === selectedDate.getDate() &&
        cellDate.getMonth() === selectedDate.getMonth() &&
        cellDate.getFullYear() === selectedDate.getFullYear();
      const isWhiteDay = hInfo.day >= 13 && hInfo.day <= 15;
      const dow = cellDate.getDay();
      const isSunnahMondayThursday = dow === 1 || dow === 4;
      const matchedEvent = ISLAMIC_EVENTS.find(
        (ev) => ev.hijriMonth === hInfo.month && ev.hijriDay === hInfo.day
      );

      cells.push({
        date: cellDate,
        gregorianDay: d,
        hijri: hInfo,
        isToday,
        isSelected,
        isWhiteDay,
        isSunnahMondayThursday,
        holidayName: matchedEvent ? matchedEvent.title : null,
      });
    }

    return cells;
  }, [viewDate, today, selectedDate, hijriOffset]);

  // Check if selected date is a Sunnah fasting day
  const selectedDayOfWeek = selectedDate.getDay();
  const isMondayOrThursday = selectedDayOfWeek === 1 || selectedDayOfWeek === 4;
  const isWhiteDay = selectedHijri.day >= 13 && selectedHijri.day <= 15;

  const navigateMonth = (delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Current Hijri Date Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Umm al-Qura Hijri Calendar</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {selectedHijri.day} {selectedHijri.monthName} {selectedHijri.year} AH
            </h2>

            <p className="font-arabic text-2xl text-emerald-300 font-bold">
              {selectedHijri.day} {selectedHijri.monthArabic} {selectedHijri.year} هـ
            </p>

            <p className="text-xs text-slate-400">
              Selected Gregorian Date:{" "}
              <strong className="text-slate-200" suppressHydrationWarning>
                {selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </p>
          </div>

          {/* Right Column: Moon-Sighting Offset & Fasting Badges */}
          <div className="flex flex-col gap-2.5">
            {onChangeHijriOffset && (
              <div className="bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Moon-Sighting Offset:</span>
                </div>
                <div className="flex items-center gap-1">
                  {[-2, -1, 0, 1, 2].map((off) => (
                    <button
                      key={off}
                      onClick={() => onChangeHijriOffset(off)}
                      className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold transition ${
                        hijriOffset === off
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {off > 0 ? `+${off}d` : `${off}d`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isMondayOrThursday && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sunnah Fasting Day (Monday / Thursday)</span>
              </div>
            )}

            {isWhiteDay && (
              <div className="bg-teal-500/20 border border-teal-500/40 text-teal-200 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
                <Star className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Ayyam al-Beed (White Days Fasting: {selectedHijri.day}th)</span>
              </div>
            )}

            <div className="bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-xs space-y-0.5">
              <span className="text-slate-400 block font-medium">Sacred Months (الأشهر الحرم):</span>
              <span className="text-emerald-400 font-medium">
                Dhul-Qi&apos;dah, Dhul-Hijjah, Muharram, and Rajab
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 7-Column Monthly Hijri + Gregorian Calendar Grid */}
      <div className="rounded-3xl bg-slate-900/75 border border-slate-800 p-5 shadow-xl space-y-4">
        {/* Month Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h3>
            <p className="text-xs text-emerald-400 font-medium">
              Tap any day to inspect Hijri date & Sunnah fasts
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Legend Pills */}
            <div className="hidden md:flex items-center gap-3 mr-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                White Days (13–15)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Mon/Thu Sunnah
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Islamic Event
              </span>
            </div>

            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-slate-700 transition"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Weekday Column Headers */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {WEEKDAYS.map((day) => (
            <div key={day} className={day === "Fri" ? "text-emerald-400" : ""}>
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell, idx) => {
            if (!cell.date || !cell.hijri) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="h-16 sm:h-20 rounded-2xl bg-slate-950/20 border border-transparent"
                />
              );
            }

            return (
              <button
                key={cell.date.toISOString()}
                onClick={() => cell.date && setSelectedDate(cell.date)}
                className={`h-16 sm:h-20 rounded-2xl p-2 border text-left flex flex-col justify-between transition relative overflow-hidden ${
                  cell.isSelected
                    ? "bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-500/40"
                    : cell.isToday
                    ? "bg-slate-800/90 border-emerald-500/60"
                    : cell.holidayName
                    ? "bg-amber-950/30 border-amber-500/40 hover:border-amber-400"
                    : cell.isWhiteDay
                    ? "bg-teal-950/30 border-teal-500/30 hover:border-teal-400/60"
                    : "bg-slate-950/50 border-white/[0.05] hover:border-white/[0.15] hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs sm:text-sm font-bold font-mono ${
                      cell.isToday || cell.isSelected ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {cell.gregorianDay}
                  </span>

                  {/* Status Dots */}
                  <div className="flex items-center gap-0.5">
                    {cell.holidayName && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    {cell.isWhiteDay && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                    {cell.isSunnahMondayThursday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 truncate">
                    {cell.hijri.day}{" "}
                    <span className="hidden sm:inline font-sans font-normal text-[10px] text-slate-400">
                      {cell.hijri.monthName.slice(0, 6)}
                    </span>
                  </div>
                  {cell.holidayName && (
                    <div className="text-[9px] text-amber-300 font-semibold truncate">
                      {cell.holidayName}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Islamic Holidays & Sacred Occasions List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-white">
            Islamic Holidays & Sacred Milestones
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ISLAMIC_EVENTS.map((event, index) => {
            const isCurrentMonth = event.hijriMonth === hijriToday.month;
            const isApproaching =
              event.hijriMonth === hijriToday.month && event.hijriDay >= hijriToday.day;

            return (
              <div
                key={index}
                className={`rounded-2xl p-4 border transition-all ${
                  isApproaching
                    ? "bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500/30"
                    : isCurrentMonth
                    ? "bg-slate-900/90 border-slate-700"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      {event.title}
                      {isApproaching && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                          This Month
                        </span>
                      )}
                    </h4>
                    <span className="font-arabic text-emerald-400 text-sm font-semibold block mt-0.5">
                      {event.arabicTitle}
                    </span>
                  </div>

                  <div className="text-right bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60">
                    <span className="text-xs font-mono font-bold text-white block">
                      {event.hijriDay} {event.hijriMonthName}
                    </span>
                    <span className="text-[10px] text-slate-400">Month {event.hijriMonth}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  {event.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
