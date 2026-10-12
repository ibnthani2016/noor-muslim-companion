"use client";

import React from "react";
import { ISLAMIC_EVENTS, getHijriDateDetails, formatHijriDate } from "@/utils/hijri";
import { Calendar, Moon, Sparkles, Clock, Star, Bell } from "lucide-react";

export const HijriCalendar: React.FC = () => {
  const today = new Date();
  const hijri = getHijriDateDetails(today);
  const formattedHijri = formatHijriDate(today);

  // Check if today is a Sunnah fasting day
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, 4 is Thursday
  const isMondayOrThursday = dayOfWeek === 1 || dayOfWeek === 4;
  const isWhiteDay = hijri.day >= 13 && hijri.day <= 15;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Current Hijri Date Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Umm al-Qura Hijri Calendar</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {hijri.day} {hijri.monthName} {hijri.year} AH
            </h2>

            <p className="font-arabic text-2xl text-emerald-300 font-bold">
              {hijri.day} {hijri.monthArabic} {hijri.year} هـ
            </p>

            <p className="text-xs text-slate-400">
              Gregorian Date:{" "}
              <strong className="text-slate-200">
                {today.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </p>
          </div>

          {/* Fasting Badges */}
          <div className="flex flex-col gap-2.5">
            {isMondayOrThursday && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sunnah Fasting Today (Monday / Thursday)</span>
              </div>
            )}

            {isWhiteDay && (
              <div className="bg-teal-500/20 border border-teal-500/40 text-teal-200 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
                <Star className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Ayyam al-Beed (White Days Fasting: {hijri.day}th)</span>
              </div>
            )}

            <div className="bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-2xl text-xs space-y-1">
              <span className="text-slate-400 block font-medium">Sacred Months (الأشهر الحرم):</span>
              <span className="text-emerald-400 font-medium">
                Dhul-Qi&apos;dah, Dhul-Hijjah, Muharram, and Rajab
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Islamic Holidays & Sacred Occasions List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-white">
            Upcoming Islamic Holidays & Milestones
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ISLAMIC_EVENTS.map((event, index) => {
            const isCurrentMonth = event.hijriMonth === hijri.month;
            const isApproaching =
              event.hijriMonth === hijri.month && event.hijriDay >= hijri.day;

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
