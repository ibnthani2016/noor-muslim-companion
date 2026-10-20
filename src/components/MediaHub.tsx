"use client";

import React, { useState, useMemo } from "react";
import { MediaItem, MediaCategory } from "@/types";
import { CURATED_MEDIA } from "@/data/mediaData";
import {
  Play,
  Search,
  Bookmark,
  BookmarkCheck,
  Video,
  Clock,
  Sparkles,
  X,
  Share2,
  Tv,
  Heart,
  Volume2,
  Filter,
  Headphones,
} from "lucide-react";

const CATEGORIES: { id: MediaCategory; label: string; arabicLabel: string }[] = [
  { id: "all", label: "All Media", arabicLabel: "الكل" },
  { id: "ramadan", label: "Ramadan Series", arabicLabel: "رمضان" },
  { id: "tafseer", label: "Tafseer & Quran", arabicLabel: "تفسير" },
  { id: "lectures", label: "Scholars & Lectures", arabicLabel: "محاضرات" },
  { id: "nasheeds", label: "Nasheeds & Vocals", arabicLabel: "أناشيد" },
  { id: "family", label: "Family & Youth", arabicLabel: "الأسرة" },
];

export const MediaHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<MediaCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState(false);

  // Bookmarking favorites in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("noor_media_favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favoriteIds.includes(id)) {
      updated = favoriteIds.filter((item) => item !== id);
    } else {
      updated = [...favoriteIds, id];
    }
    setFavoriteIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("noor_media_favorites", JSON.stringify(updated));
    }
  };

  const filteredMedia = useMemo(() => {
    return CURATED_MEDIA.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.speakerOrArtist.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const featuredItem = useMemo(() => {
    return CURATED_MEDIA.find((item) => item.isFeatured) || CURATED_MEDIA[0];
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Media Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-white/[0.08] shadow-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span>Islamic Media & Reflection Hub</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Curated Lectures, Tafseer & Nasheeds
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Distraction-free spiritual content from reputable scholars and reciters. Watch Ramadan series, Quranic reflections, and heart-softening reminders.
          </p>
        </div>

        {/* Search Input in Header */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholars, topics..."
            className="w-full bg-slate-950/80 border border-white/[0.08] rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 border ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500 text-white shadow-md shadow-emerald-600/25"
                  : "bg-slate-900/80 border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]"
              }`}
            >
              <span>{cat.label}</span>
              <span className="font-arabic opacity-70 text-[11px]">{cat.arabicLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Hero Media Card */}
      {activeCategory === "all" && !searchQuery && featuredItem && (
        <div
          onClick={() => setSelectedMedia(featuredItem)}
          className="group relative cursor-pointer overflow-hidden rounded-3xl bg-slate-900/90 border border-white/[0.08] hover:border-emerald-500/60 transition-all duration-300 shadow-2xl active:scale-[0.99]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            {/* Thumbnail with Overlay */}
            <div className="md:col-span-7 relative h-56 md:h-80 overflow-hidden bg-slate-950">
              <img
                src={featuredItem.thumbnailUrl}
                alt={featuredItem.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/90 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
              </div>

              <span className="absolute bottom-4 left-4 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-[11px] font-mono text-emerald-300 font-semibold flex items-center gap-1.5 border border-white/10">
                <Clock className="w-3 h-3" />
                <span>{featuredItem.duration}</span>
              </span>
            </div>

            {/* Info details */}
            <div className="md:col-span-5 p-6 md:p-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Featured Ramadan Pick</span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
                {featuredItem.title}
              </h3>

              <p className="text-xs font-semibold text-emerald-400">{featuredItem.speakerOrArtist}</p>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {featuredItem.description}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Watch Lecture →
                </span>

                <button
                  onClick={(e) => toggleFavorite(featuredItem.id, e)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors active:scale-90"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favoriteIds.includes(featuredItem.id) ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMedia.map((item) => {
          const isFav = favoriteIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="group cursor-pointer flex flex-col justify-between overflow-hidden rounded-3xl bg-slate-900/90 border border-white/[0.07] hover:border-emerald-500/50 transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-emerald-950/20"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-xs">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono text-slate-200 font-semibold border border-white/10">
                    {item.duration}
                  </span>

                  {/* Category tag */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-medium capitalize backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                {/* Content info */}
                <div className="p-4 space-y-1.5">
                  <p className="text-[11px] font-semibold text-emerald-400 truncate">{item.speakerOrArtist}</p>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Play className="w-3 h-3 fill-emerald-400" />
                  <span>Stream</span>
                </span>

                <button
                  onClick={(e) => toggleFavorite(item.id, e)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors active:scale-90"
                  title="Save to favorites"
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedia.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <Tv className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-semibold text-slate-300">No media found</h4>
          <p className="text-xs text-slate-500">Try adjusting your search terms or selecting another category.</p>
        </div>
      )}

      {/* Embedded Video/Audio Player Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-white/[0.06] bg-slate-950/70">
              <div className="space-y-0.5 pr-4">
                <h3 className="text-sm md:text-base font-bold text-white truncate">{selectedMedia.title}</h3>
                <p className="text-xs text-emerald-400 font-medium">{selectedMedia.speakerOrArtist}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Audio-only toggle */}
                <button
                  onClick={() => setIsAudioOnlyMode(!isAudioOnlyMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 ${
                    isAudioOnlyMode
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-800 border-white/[0.06] text-slate-400 hover:text-white"
                  }`}
                  title="Save mobile data by listening in background mode"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAudioOnlyMode ? "Audio Only" : "Video"}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedMedia(null);
                    setIsAudioOnlyMode(false);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player Embed or Audio-Only Display */}
            <div className="px-4 md:px-6">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-white/[0.08]">
                {isAudioOnlyMode ? (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-slate-950 via-emerald-950/40 to-slate-950 text-slate-300 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-pulse">
                      <Headphones className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-semibold text-white">Audio-Only Reflection Mode</p>
                    <p className="text-xs text-slate-400 max-w-sm">Saving mobile bandwidth. Audio streams directly in the background.</p>
                    {selectedMedia.youtubeId && (
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedMedia.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                        title={selectedMedia.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="w-1 h-1 opacity-0 absolute pointer-events-none"
                      />
                    )}
                  </div>
                ) : selectedMedia.youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedMedia.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={selectedMedia.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-slate-950 text-slate-400">
                    <Volume2 className="w-12 h-12 text-emerald-400 animate-pulse" />
                    <p className="text-sm">Audio stream ready</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Info Details */}
            <div className="p-4 px-6 pb-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="capitalize px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                  {selectedMedia.category}
                </span>
                <span className="font-mono">{selectedMedia.duration}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedMedia.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
