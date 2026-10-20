"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { CardTemplate, CardPalette } from "@/types";
import { DEFAULT_CARD_TEMPLATES } from "@/data/cardTemplates";
import {
  Palette,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Square,
  Type,
  RotateCcw,
  MessageCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface CardStudioProps {
  initialAyah?: {
    arabic: string;
    english: string;
    reference: string;
  };
}

const PALETTES: Record<CardPalette, { name: string; bgGradient: [string, string, string]; textColor: string; accentColor: string; border: string }> = {
  emerald: {
    name: "Emerald Oasis",
    bgGradient: ["#022c22", "#064e3b", "#021c15"],
    textColor: "#ecfdf5",
    accentColor: "#34d399",
    border: "rgba(52, 211, 153, 0.4)",
  },
  gold: {
    name: "Royal Makkah Gold",
    bgGradient: ["#1c1917", "#292524", "#0c0a09"],
    textColor: "#fef08a",
    accentColor: "#facc15",
    border: "rgba(250, 204, 21, 0.4)",
  },
  indigo: {
    name: "Midnight Laylatul Qadr",
    bgGradient: ["#090d16", "#1e1b4b", "#030712"],
    textColor: "#e0e7ff",
    accentColor: "#818cf8",
    border: "rgba(129, 140, 248, 0.4)",
  },
  crimson: {
    name: "Sunset Twilight",
    bgGradient: ["#2d060e", "#4c0519", "#1a0409"],
    textColor: "#ffe4e6",
    accentColor: "#fb7185",
    border: "rgba(251, 113, 133, 0.4)",
  },
  sand: {
    name: "Desert Medina Sand",
    bgGradient: ["#18181b", "#27272a", "#09090b"],
    textColor: "#f4f4f5",
    accentColor: "#d4d4d8",
    border: "rgba(212, 212, 216, 0.3)",
  },
};

export const CardStudio: React.FC<CardStudioProps> = ({ initialAyah }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(DEFAULT_CARD_TEMPLATES[0]);
  const [arabicText, setArabicText] = useState(initialAyah?.arabic || DEFAULT_CARD_TEMPLATES[0].arabicText);
  const [englishText, setEnglishText] = useState(initialAyah?.english || DEFAULT_CARD_TEMPLATES[0].englishText);
  const [attribution, setAttribution] = useState(initialAyah?.reference || DEFAULT_CARD_TEMPLATES[0].attribution);
  const [palette, setPalette] = useState<CardPalette>(DEFAULT_CARD_TEMPLATES[0].palette);
  const [aspectRatio, setAspectRatio] = useState<"square" | "story">("square");
  const [arabicCanvasFont, setArabicCanvasFont] = useState<string>("'Amiri'");
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If initialAyah is provided, load it
  useEffect(() => {
    if (initialAyah) {
      setArabicText(initialAyah.arabic);
      setEnglishText(initialAyah.english);
      setAttribution(initialAyah.reference);
      setPalette("gold");
    }
  }, [initialAyah]);

  const handleSelectTemplate = (template: CardTemplate) => {
    setSelectedTemplate(template);
    setArabicText(template.arabicText);
    setEnglishText(template.englishText);
    setAttribution(template.attribution);
    setPalette(template.palette);
  };

  // Render high-res card to HTML5 canvas
  const renderCardToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions: 1080x1080 (Square) or 1080x1920 (Story 9:16)
    const width = 1080;
    const height = aspectRatio === "square" ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    const currentPal = PALETTES[palette];

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, currentPal.bgGradient[0]);
    gradient.addColorStop(0.5, currentPal.bgGradient[1]);
    gradient.addColorStop(1, currentPal.bgGradient[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Islamic Border Frame
    const padding = 60;
    ctx.lineWidth = 4;
    ctx.strokeStyle = currentPal.border;
    ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

    // Inner subtle border
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.strokeRect(
      padding + 16,
      padding + 16,
      width - (padding + 16) * 2,
      height - (padding + 16) * 2
    );

    // Corner decorative flourishes
    const cornerSize = 40;
    ctx.lineWidth = 3;
    ctx.strokeStyle = currentPal.accentColor;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(padding, padding + cornerSize);
    ctx.lineTo(padding, padding);
    ctx.lineTo(padding + cornerSize, padding);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - padding - cornerSize, padding);
    ctx.lineTo(width - padding, padding);
    ctx.lineTo(width - padding, padding + cornerSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(padding, height - padding - cornerSize);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(padding + cornerSize, height - padding);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - padding - cornerSize, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(width - padding, height - padding - cornerSize);
    ctx.stroke();

    // Header Crescent Moon / Symbol
    ctx.fillStyle = currentPal.accentColor;
    ctx.font = "bold 56px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🌙", width / 2, padding + 90);

    // Bismillah
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.font = `400 32px ${arabicCanvasFont}, 'Amiri', serif`;
    ctx.textAlign = "center";
    ctx.fillText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", width / 2, padding + 155);

    // Center Content Layout calculation with auto-fit scaling against contentMaxHeight
    const contentStartY = padding + 230;
    const contentMaxHeight = height - padding * 2 - 340;
    const maxTextWidth = width - padding * 2 - 120;

    // Helper: Wrap text
    const wrapText = (text: string, font: string, maxWidth: number): string[] => {
      ctx.font = font;
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = words[0] || "";

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + " " + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width < maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    // Dynamically scale down font sizes until total block fits inside contentMaxHeight
    let arabicFontSize = arabicText.length > 140 ? 38 : arabicText.length > 70 ? 46 : 56;
    let englishFontSize = englishText.length > 200 ? 24 : englishText.length > 100 ? 28 : 32;
    let arabicLines: string[] = [];
    let englishLines: string[] = [];

    for (let attempt = 0; attempt < 6; attempt++) {
      const aFont = `bold ${arabicFontSize}px ${arabicCanvasFont}, 'Amiri', 'Scheherazade New', serif`;
      const eFont = `400 ${englishFontSize}px 'Outfit', system-ui, sans-serif`;
      arabicLines = wrapText(arabicText, aFont, maxTextWidth);
      englishLines = wrapText(`"${englishText}"`, eFont, maxTextWidth);

      const totalBlockHeight =
        arabicLines.length * (arabicFontSize * 1.55) +
        80 +
        englishLines.length * (englishFontSize * 1.45) +
        60;

      if (totalBlockHeight <= contentMaxHeight || arabicFontSize <= 24) {
        break;
      }
      arabicFontSize = Math.max(24, arabicFontSize - 4);
      englishFontSize = Math.max(18, englishFontSize - 2);
    }

    const arabicFont = `bold ${arabicFontSize}px ${arabicCanvasFont}, 'Amiri', 'Scheherazade New', serif`;
    ctx.fillStyle = currentPal.textColor;
    ctx.font = arabicFont;
    ctx.textAlign = "center";
    let currentY = contentStartY;

    for (const line of arabicLines) {
      ctx.fillText(line, width / 2, currentY);
      currentY += arabicFontSize * 1.55;
    }

    // Divider Line
    currentY += 25;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, currentY);
    ctx.lineTo(width / 2 + 100, currentY);
    ctx.strokeStyle = currentPal.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // English Translation Text
    currentY += 45;
    const englishFont = `400 ${englishFontSize}px 'Outfit', system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = englishFont;
    ctx.textAlign = "center";

    for (const line of englishLines) {
      ctx.fillText(line, width / 2, currentY);
      currentY += englishFontSize * 1.45;
    }

    // Attribution Reference
    currentY += 36;
    ctx.fillStyle = currentPal.accentColor;
    ctx.font = "600 24px 'Outfit', system-ui, sans-serif";
    ctx.fillText(`— ${attribution}`, width / 2, currentY);

    // Footer Watermark
    if (includeWatermark) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "500 20px 'Outfit', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Designed with Noor Companion (نُور)", width / 2, height - padding - 30);
    }
  }, [arabicText, englishText, attribution, palette, aspectRatio, arabicCanvasFont, includeWatermark]);

  useEffect(() => {
    renderCardToCanvas();
  }, [renderCardToCanvas]);

  // Download Image
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `noor-card-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Share to WhatsApp / Web Share API
  const handleShareCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "noor-ramadan-card.png", { type: "image/png" });

        // Native Web Share with file
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: attribution || "Noor Companion Card",
            text: `${arabicText}\n\n"${englishText}"\n— ${attribution}`,
            files: [file],
          });
        } else {
          // Fallback to WhatsApp URL
          const shareText = encodeURIComponent(`${arabicText}\n\n"${englishText}"\n— ${attribution}\n\nCreated with Noor Companion`);
          window.open(`https://api.whatsapp.com/send?text=${shareText}`, "_blank");
        }
      });
    } catch (e) {
      console.warn("Share failed, opened fallback:", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Copy card text to clipboard
  const handleCopyText = () => {
    const text = `${arabicText}\n\n"${englishText}"\n— ${attribution}`;
    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const filteredTemplates = selectedCategory === "all"
    ? DEFAULT_CARD_TEMPLATES
    : DEFAULT_CARD_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Islamic Card & Greeting Studio</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Design & Share Ramadan Cards
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Create beautiful, high-resolution greeting posters, Quranic Ayah cards, and halal reflections formatted for WhatsApp and Instagram.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handleShareCard}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Share to WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Controls & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customization Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Preset Category Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Choose a Template</label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {["all", "ramadan", "ayah", "dhikr", "jummah", "meme"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-emerald-500 text-white font-semibold"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All Designs" : cat}
                </button>
              ))}
            </div>

            {/* Template Thumbnails Carousel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {filteredTemplates.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTemplate(item)}
                  className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between h-24 ${
                    selectedTemplate.id === item.id
                      ? "bg-emerald-950/60 border-emerald-500 shadow-sm shadow-emerald-500/20"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-semibold text-white truncate block">{item.title}</span>
                  <span className="font-arabic text-sm text-emerald-300 truncate block text-right">
                    {item.arabicText.slice(0, 18)}...
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">{item.palette} palette</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Editor Form */}
          <div className="space-y-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800">
            {/* Arabic Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Arabic Text / Ayah</span>
                <span className="text-[10px] text-slate-400 font-arabic">النص العربي</span>
              </label>
              <textarea
                value={arabicText}
                onChange={(e) => setArabicText(e.target.value)}
                rows={3}
                dir="rtl"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-emerald-200 font-arabic text-lg focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="أدخل النص العربي..."
              />
            </div>

            {/* English Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">English Translation / Caption</label>
              <textarea
                value={englishText}
                onChange={(e) => setEnglishText(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Enter English caption or translation..."
              />
            </div>

            {/* Attribution / Signature */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Reference / Signature</label>
                <input
                  type="text"
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Surah Al-Baqarah (2:185)"
                />
              </div>

              {/* Watermark toggle */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => setIncludeWatermark(!includeWatermark)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    includeWatermark
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <span>Watermark (Noor Companion)</span>
                  <CheckCircle2 className={`w-4 h-4 ${includeWatermark ? "text-emerald-400" : "text-slate-600"}`} />
                </button>
              </div>
            </div>

            {/* Palette & Aspect Ratio Row */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              {/* Palette Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Color Theme</label>
                <div className="flex items-center gap-2">
                  {(Object.keys(PALETTES) as CardPalette[]).map((key) => {
                    const isSelected = palette === key;
                    const p = PALETTES[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setPalette(key)}
                        title={p.name}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected ? "border-white scale-110 shadow-md shadow-white/20" : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                        style={{ background: `linear-gradient(135deg, ${p.bgGradient[0]}, ${p.bgGradient[1]})` }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Arabic Calligraphy Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Arabic Calligraphy</label>
                <select
                  value={arabicCanvasFont}
                  onChange={(e) => setArabicCanvasFont(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-500"
                  aria-label="Select Card Arabic Calligraphy"
                >
                  <option value="'Amiri'">Classical Amiri</option>
                  <option value="'Scheherazade New'">Madani Uthmani</option>
                  <option value="'Noto Naskh Arabic'">Modern Naskh</option>
                  <option value="'Noto Nastaliq Urdu'">Indo-Pak Nastaliq</option>
                  <option value="'Cairo'">Contemporary Cairo</option>
                </select>
              </div>

              {/* Format / Aspect Ratio Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Card Aspect Ratio</label>
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setAspectRatio("square")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      aspectRatio === "square" ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Square (1:1)</span>
                  </button>
                  <button
                    onClick={() => setAspectRatio("story")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      aspectRatio === "story" ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Story (9:16)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Ayah Presets Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Ayah & Reflection Chips</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                {
                  title: "Ayat al-Kursi",
                  arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
                  english: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence.",
                  reference: "Surah Al-Baqarah (2:255)",
                  palette: "gold" as CardPalette,
                },
                {
                  title: "Hardship & Ease",
                  arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا",
                  english: "For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.",
                  reference: "Surah Ash-Sharh (94:5-6)",
                  palette: "emerald" as CardPalette,
                },
                {
                  title: "Surah Al-Ikhlas",
                  arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ • اللَّهُ الصَّمَدُ",
                  english: "Say, He is Allah, [who is] One. Allah, the Eternal Refuge.",
                  reference: "Surah Al-Ikhlas (112:1-2)",
                  palette: "indigo" as CardPalette,
                },
                {
                  title: "Night of Decree",
                  arabic: "لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ",
                  english: "The Night of Decree is better than a thousand months.",
                  reference: "Surah Al-Qadr (97:3)",
                  palette: "indigo" as CardPalette,
                },
              ].map((chip) => (
                <button
                  key={chip.title}
                  type="button"
                  onClick={() => {
                    setArabicText(chip.arabic);
                    setEnglishText(chip.english);
                    setAttribution(chip.reference);
                    setPalette(chip.palette);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-white/[0.08] hover:border-emerald-500/60 text-[11px] text-slate-300 hover:text-emerald-300 font-medium transition active:scale-95"
                >
                  ✨ {chip.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-bold uppercase tracking-wider text-slate-300">Live Framed Preview</span>
            <span className="font-mono">{aspectRatio === "square" ? "1080 × 1080" : "1080 × 1920"}</span>
          </div>

          {/* Elevated Device Mockup Frame */}
          <div className="w-full max-w-sm rounded-[32px] p-3.5 bg-gradient-to-b from-slate-800/90 to-slate-950 border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative flex flex-col items-center">
            <div className="w-16 h-1 bg-white/20 rounded-full mb-3" />
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-2xl shadow-2xl border border-white/[0.08] max-h-[500px] object-contain"
            />
          </div>

          {/* Quick Share Buttons under Canvas */}
          <div className="w-full max-w-sm grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadImage}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md shadow-emerald-600/25"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Image</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-95 border border-white/[0.08]"
            >
              {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedStatus ? "Copied Text!" : "Copy Text"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
