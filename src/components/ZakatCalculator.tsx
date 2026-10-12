"use client";

import React, { useState } from "react";
import { Calculator, Coins, HelpCircle, CheckCircle, AlertCircle, RefreshCw, DollarSign } from "lucide-react";

interface AssetInputs {
  cash: number;
  goldGrams: number;
  silverGrams: number;
  investments: number;
  businessGoods: number;
  moneyOwedToYou: number;
  shortTermDebts: number;
}

export const ZakatCalculator: React.FC = () => {
  // Commodity prices (per gram)
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(85.0);
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(1.1);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [nisabStandard, setNisabStandard] = useState<"gold" | "silver">("gold");

  // User financial assets
  const [assets, setAssets] = useState<AssetInputs>({
    cash: 0,
    goldGrams: 0,
    silverGrams: 0,
    investments: 0,
    businessGoods: 0,
    moneyOwedToYou: 0,
    shortTermDebts: 0,
  });

  // Calculate Nisab Threshold
  // Gold Nisab = 85 grams of gold
  // Silver Nisab = 595 grams of silver
  const goldNisabValue = 85 * goldPricePerGram;
  const silverNisabValue = 595 * silverPricePerGram;
  const currentNisabValue = nisabStandard === "gold" ? goldNisabValue : silverNisabValue;

  // Total Zakatable Wealth
  const goldValue = assets.goldGrams * goldPricePerGram;
  const silverValue = assets.silverGrams * silverPricePerGram;

  const totalGrossAssets =
    assets.cash +
    goldValue +
    silverValue +
    assets.investments +
    assets.businessGoods +
    assets.moneyOwedToYou;

  const netZakatableWealth = Math.max(0, totalGrossAssets - assets.shortTermDebts);

  // Zakat is 2.5% (or 1/40th) of net wealth if >= Nisab
  const isEligible = netZakatableWealth >= currentNisabValue && currentNisabValue > 0;
  const zakatDue = isEligible ? netZakatableWealth * 0.025 : 0;

  const handleInputChange = (field: keyof AssetInputs, value: string) => {
    const num = parseFloat(value) || 0;
    setAssets((prev) => ({ ...prev, [field]: num }));
  };

  const resetAll = () => {
    setAssets({
      cash: 0,
      goldGrams: 0,
      silverGrams: 0,
      investments: 0,
      businessGoods: 0,
      moneyOwedToYou: 0,
      shortTermDebts: 0,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Result Hero Card */}
      <div
        className={`rounded-3xl p-6 md:p-8 border shadow-xl transition-all ${
          isEligible
            ? "bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/50 ring-1 ring-emerald-500/30"
            : "bg-slate-900/80 border-slate-800"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span>Zakat al-Mal (2.5%)</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {currencySymbol}
              {zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>

            <p className="text-xs text-slate-400">
              {isEligible ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Zakat is required on your wealth.
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Your net wealth is below the Nisab threshold ({currencySymbol}
                  {currentNisabValue.toLocaleString()}). Zakat is not obligatory.
                </span>
              )}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Net Zakatable Wealth:</span>
              <span className="font-mono font-bold text-white">
                {currencySymbol}
                {netZakatableWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Selected Nisab ({nisabStandard}):</span>
              <span className="font-mono font-bold text-emerald-400">
                {currencySymbol}
                {currentNisabValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Total Deductions:</span>
              <span className="font-mono text-rose-400">
                -{currencySymbol}
                {assets.shortTermDebts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nisab & Currency Settings */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Nisab Benchmark & Rates
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
              <option value="SAR ">SAR (ر.س)</option>
              <option value="AED ">AED (د.إ)</option>
              <option value="CAD ">CAD ($)</option>
              <option value="₨ ">PKR (₨)</option>
              <option value="₹ ">INR (₹)</option>
              <option value="₦">NGN (₦)</option>
            </select>

            <button
              onClick={resetAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Nisab Selector */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <label className="text-slate-400 block mb-1 font-medium">Standard Standard</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setNisabStandard("gold")}
                className={`py-1.5 px-2 rounded-lg font-semibold transition ${
                  nisabStandard === "gold"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                Gold (85g)
              </button>
              <button
                onClick={() => setNisabStandard("silver")}
                className={`py-1.5 px-2 rounded-lg font-semibold transition ${
                  nisabStandard === "silver"
                    ? "bg-slate-300/20 text-slate-200 border border-slate-400/40"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                Silver (595g)
              </button>
            </div>
          </div>

          {/* Gold Price per gram */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <label className="text-slate-400 block mb-1 font-medium">Gold Price / gram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={goldPricePerGram || ""}
                onChange={(e) => setGoldPricePerGram(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Silver Price per gram */}
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <label className="text-slate-400 block mb-1 font-medium">Silver Price / gram</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={silverPricePerGram || ""}
                onChange={(e) => setSilverPricePerGram(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Input Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assets Section */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Zakatable Assets (held for 1 Lunar Year)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Cash in Hand & Bank Accounts
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={assets.cash || ""}
                onChange={(e) => handleInputChange("cash", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Gold Owned (grams)</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={assets.goldGrams || ""}
                  onChange={(e) => handleInputChange("goldGrams", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Silver Owned (grams)</label>
                <input
                  type="number"
                  placeholder="e.g. 200"
                  value={assets.silverGrams || ""}
                  onChange={(e) => handleInputChange("silverGrams", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Stocks, Mutual Funds & Crypto
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={assets.investments || ""}
                onChange={(e) => handleInputChange("investments", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Trade Merchandise & Business Inventory
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={assets.businessGoods || ""}
                onChange={(e) => handleInputChange("businessGoods", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Loans Given Out (expected to be repaid)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={assets.moneyOwedToYou || ""}
                onChange={(e) => handleInputChange("moneyOwedToYou", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Liabilities & Guidance */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Deductible Liabilities</span>
            </h3>

            <div>
              <label className="text-slate-300 font-medium block mb-1 text-xs">
                Debts & Immediate Bills Due this Month
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={assets.shortTermDebts || ""}
                onChange={(e) => handleInputChange("shortTermDebts", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                *Only deduct immediate due debts and bills, not future long-term mortgage principal.
              </p>
            </div>
          </div>

          {/* Quranic Guidance */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-3">
            <h4 className="font-semibold text-xs text-emerald-400 uppercase tracking-wider">
              Who Receives Zakat? (Quran 9:60)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zakat is distributed to the 8 categories specified by Allah: the poor (Al-Fuqara), the needy (Al-Masakin), those who work to collect it, those whose hearts are reconciled, freeing captives/slaves, those in heavy debt (Al-Gharimin), in the cause of Allah (Fi Sabilillah), and the stranded traveler (Ibn al-Sabil).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
