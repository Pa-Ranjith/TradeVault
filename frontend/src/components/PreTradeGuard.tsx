"use client";

import { useState, useEffect } from "react";
import { Shield, PieChart, Activity, Zap, Edit3, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function PreTradeGuard() {
    const { resetTrigger, setGuardReady } = useApp();
    const [activeTab, setActiveTab] = useState<"analysis" | "psychology">("analysis");
    const [activeRatTab, setActiveRatTab] = useState<"fundamentals" | "technicals" | "signal" | "custom">("fundamentals");

    // Psych States
    const [checks, setChecks] = useState({ setup: false, trend: false, mind: false, risk: false });
    const [emotion, setEmotion] = useState("neutral");

    // Rat States
    const [fundamentals, setFundamentals] = useState("");
    const [technicals, setTechnicals] = useState("");
    const [signal, setSignal] = useState("");
    const [custom, setCustom] = useState("");

    const checkedCount = Object.values(checks).filter(Boolean).length;
    const progressPercent = Math.round((checkedCount / 4) * 100);

    const toggleCheck = (id: keyof typeof checks) => {
        setChecks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Push guard readiness to AppContext
    // Rule: Psychology ≥50% (≥2 of 4) AND at least one analysis selection
    useEffect(() => {
        const psychReady = checkedCount >= 2; // ≥50%
        const analysisReady = !!(fundamentals || technicals || signal);
        setGuardReady(psychReady && analysisReady);
    }, [checkedCount, fundamentals, technicals, signal, setGuardReady]);

    // Global Reset Listener
    useEffect(() => {
        if (resetTrigger > 0) {
            setChecks({ setup: false, trend: false, mind: false, risk: false });
            setFundamentals("");
            setTechnicals("");
            setSignal("");
            setCustom("");
            setEmotion("neutral");
            setActiveTab("analysis");
            console.log("[PreTradeGuard] Resetting for new market...");
        }
    }, [resetTrigger]);

    return (
        <div className="bg-bg-panel border border-border-soft rounded-2xl p-8 shadow-soft flex flex-col transition-all overflow-hidden relative">
            <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-3 text-text-main mb-2">
                    <Shield className="w-5 h-5 text-cta" /> Pre-Trade Guard
                </h2>
                <p className="text-sm text-text-muted">Complete both sections to unlock execution.</p>
            </div>

            <div className="flex gap-2 bg-black/5 dark:bg-black/20 p-2 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab("analysis")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "analysis" ? "bg-bg-panel text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                >
                    📊 Analysis
                </button>
                <button
                    onClick={() => setActiveTab("psychology")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "psychology" ? "bg-bg-panel text-text-main shadow-sm" : "text-text-muted hover:text-text-main"}`}
                >
                    🧠 Psychology
                </button>
            </div>

            {activeTab === "analysis" && (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {[
                            { id: "fundamentals", icon: PieChart, label: "Core" },
                            { id: "technicals", icon: Activity, label: "Techs" },
                            { id: "signal", icon: Zap, label: "Signal" },
                            { id: "custom", icon: Edit3, label: "Note" }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveRatTab(t.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${activeRatTab === t.id ? "bg-bg-main border-cta text-cta" : "border-transparent text-text-muted hover:bg-bg-main"}`}
                            >
                                <t.icon className="w-3.5 h-3.5" />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-bg-main/50 p-6 rounded-xl border border-border-soft min-h-[180px]">
                        {activeRatTab === "fundamentals" && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Fundamental Catalyst</label>
                                <select value={fundamentals} onChange={e => setFundamentals(e.target.value)} className="p-3 bg-bg-panel border border-border-soft focus:border-cta rounded-xl outline-none transition-all">
                                    <option value="">-- Select --</option>
                                    <option value="earnings">Earnings Momentum</option>
                                    <option value="valuation">Undervalued (Low P/E)</option>
                                    <option value="delivery">High Delivery Volume</option>
                                    <option value="institutional">FII / DII Accumulation</option>
                                    <option value="debt_free">Debt Free / Strong BS</option>
                                </select>
                            </div>
                        )}

                        {activeRatTab === "technicals" && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Technical Setup</label>
                                <select value={technicals} onChange={e => setTechnicals(e.target.value)} className="p-3 bg-bg-panel border border-border-soft focus:border-cta rounded-xl outline-none transition-all">
                                    <option value="">-- Select --</option>
                                    <option value="support">Support/Res Bounce</option>
                                    <option value="breakout">Trendline Breakout</option>
                                    <option value="crossover">MA Crossover</option>
                                    <option value="rsi">RSI Divergence</option>
                                    <option value="volume">Volume Breakout</option>
                                </select>
                            </div>
                        )}

                        {activeRatTab === "signal" && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Entry Signal</label>
                                <select value={signal} onChange={e => setSignal(e.target.value)} className="p-3 bg-bg-panel border border-border-soft focus:border-cta rounded-xl outline-none transition-all">
                                    <option value="">-- Select --</option>
                                    <option value="patterns">Chart Patterns (H&S, Cup)</option>
                                    <option value="fibonacci">Fibonacci Retail / Pullback</option>
                                    <option value="strength">Relative Strength (RS)</option>
                                    <option value="candlestick">Bullish Engulfing / Pin</option>
                                    <option value="tape">Order Flow / Tape</option>
                                </select>
                            </div>
                        )}

                        {activeRatTab === "custom" && (
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Specific Notes</label>
                                <input type="text" value={custom} onChange={e => setCustom(e.target.value)} placeholder="Optional brief note..." className="p-3 bg-bg-panel border border-border-soft focus:border-cta rounded-xl outline-none transition-all" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "psychology" && (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="mb-6">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            <span>Discipline Level</span>
                            <span className={progressPercent === 100 ? "text-secondary" : ""}>{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                        {[
                            { id: "setup", label: "Checked Daily Limit" },
                            { id: "trend", label: "Not Chasing FOMO" },
                            { id: "mind", label: "Mental state: Calm" },
                            { id: "risk", label: "Results/News/Charts checked" }
                        ].map(chk => (
                            <div
                                key={chk.id}
                                onClick={() => toggleCheck(chk.id as keyof typeof checks)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all duration-300
                  ${checks[chk.id as keyof typeof checks]
                                        ? "bg-[#A8D5BA]/10 border-secondary translate-x-1"
                                        : "border-transparent hover:bg-bg-main hover:border-border-soft"}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                  ${checks[chk.id as keyof typeof checks] ? "bg-secondary border-secondary text-bg-main" : "border-primary"}`}>
                                    {checks[chk.id as keyof typeof checks] && <Check className="w-3 h-3" />}
                                </div>
                                <span className={`text-sm font-medium ${checks[chk.id as keyof typeof checks] ? "text-secondary line-through opacity-70" : "text-text-main"}`}>
                                    {chk.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-border-soft mt-auto">
                        <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Current Emotion</label>
                        <select value={emotion} onChange={e => setEmotion(e.target.value)} className="p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all">
                            <option value="neutral">Neutral & Focused</option>
                            <option value="confident">Confident</option>
                            <option value="fomo">Slight FOMO</option>
                            <option value="bored">Bored / Impatient</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
