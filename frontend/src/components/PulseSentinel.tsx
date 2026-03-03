"use client";

import React, { useState, useEffect } from 'react';
import {
    Newspaper,
    Flame,
    Globe,
    BrainCircuit,
    Search,
    TrendingUp,
    MessageSquareText,
    Zap,
    Scale,
    ExternalLink,
    Quote
} from "lucide-react";
import { SentinelService, SentinelNarrative } from "@/services/SentinelService";

export function PulseSentinel() {
    const [symbol, setSymbol] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [narrative, setNarrative] = useState<SentinelNarrative | null>(null);

    // Mock Trending Data based on Global Cues
    const trendingStocks = [
        { symbol: "RELIANCE", change: "+1.2%", sentiment: "Bullish", cue: "Expansion into Green Energy" },
        { symbol: "NVDA", change: "+3.4%", sentiment: "Very Bullish", cue: "Next-gen AI Chip Launch" },
        { symbol: "HDFCBANK", change: "-0.5%", sentiment: "Neutral", cue: "Rate Policy Impact" },
        { symbol: "TSLA", change: "-2.1%", sentiment: "Bearish", cue: "Global Supply Concerns" },
    ];

    const handleAnalyze = async () => {
        if (!symbol) return;
        setIsAnalyzing(true);
        // Narrative remains visible while refreshing to avoid flickering

        try {
            // Fetching from 5+ sources
            const news = await SentinelService.fetchMultiSourceNews(symbol);
            const synthesized = SentinelService.synthesizeConsolidatedNarrative(symbol, news);
            setNarrative(synthesized);
        } catch (error) {
            console.error("Narrative synthesis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Auto-refresh every 2 minutes
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (symbol && narrative) {
            interval = setInterval(() => {
                handleAnalyze();
            }, 120000); // 2 minutes
        }
        return () => clearInterval(interval);
    }, [symbol, narrative, handleAnalyze]);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Search & Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-outfit font-bold text-text-main flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-cta" /> Market Pulse Sentinel
                </h1>
                <p className="text-text-muted">Synthesizing global news into tailor-made market narratives.</p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Search & Sentiment Analysis Box */}
                <div className="col-span-12 lg:col-span-8 bg-bg-panel border border-border-soft rounded-3xl p-8 relative overflow-hidden flex flex-col gap-8">
                    <div className="flex gap-4 relative z-10">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Enter symbol (e.g. RELIANCE, NVDA)..."
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAnalyze();
                                    }
                                }}
                                className="w-full h-14 bg-bg-main border border-border-soft rounded-2xl px-6 outline-none focus:border-cta font-bold transition-all pl-12"
                            />
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                        </div>
                        <button
                            onClick={handleAnalyze}
                            className="px-8 h-14 bg-cta text-white font-bold rounded-2xl shadow-lg hover:bg-cta-hover transition-all flex items-center gap-2"
                        >
                            {isAnalyzing ? "Synthesizing..." : "Generate Story"}
                        </button>
                    </div>

                    {isAnalyzing ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="w-12 h-12 border-4 border-cta/30 border-t-cta rounded-full animate-spin"></div>
                            <div>
                                <h3 className="font-bold text-text-main">Analyzing MoneyControl Sitemaps...</h3>
                                <p className="text-xs text-text-muted">Aggregating global cues and macro factors.</p>
                            </div>
                        </div>
                    ) : narrative ? (
                        <div className="flex flex-col gap-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                            {/* The Synthesized Narrative Story */}
                            <div className="bg-bg-main/40 p-8 rounded-[32px] border border-border-soft group hover:border-cta/20 transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-cta/40"></div>
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-cta/10 rounded-xl">
                                            <Quote className="w-5 h-5 text-cta" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-text-main">The {narrative.symbol} Narrative</h3>
                                            <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase">Verified Market Intelligence</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {/* Sentiment Gauge Surprise */}
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-16 h-1 bg-bg-main rounded-full overflow-hidden border border-border-soft">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${narrative.sentimentScore > 0 ? 'bg-secondary' : 'bg-danger'}`}
                                                    style={{ width: `${Math.abs(narrative.sentimentScore)}%`, marginLeft: narrative.sentimentScore > 0 ? '50%' : `${50 - Math.abs(narrative.sentimentScore)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[8px] font-bold text-text-muted">SENTIMENT FLOW</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold ${narrative.sentimentScore > 0 ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                                                {narrative.sentimentLabel}: {narrative.sentimentScore}
                                            </div>
                                            <span className="text-[9px] font-bold text-text-muted tracking-tighter opacity-70">Conviction: {narrative.confidence}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-sm text-text-main/90 leading-relaxed font-medium italic">
                                        "{narrative.story}"
                                    </p>

                                    <div className="bg-bg-panel/50 p-6 rounded-2xl border border-border-soft/50">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[2px] text-text-muted mb-4">Underlying Intelligence (News Clusters)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {narrative.sources.map((source, i) => (
                                                <a
                                                    key={i}
                                                    href={source.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-col gap-1 group/item hover:bg-bg-main/50 p-2 -m-2 rounded-xl transition-all"
                                                >
                                                    <span className="text-[10px] font-bold text-cta flex items-center justify-between gap-1">
                                                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {source.source}</span>
                                                        <ExternalLink className="w-2 h-2 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </span>
                                                    <p className="text-xs text-text-main font-semibold line-clamp-1 group-hover/item:text-cta">{source.title}</p>
                                                    <p className="text-[10px] text-text-muted line-clamp-2">{source.snippet}</p>
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Technical Pulse Surprise */}
                                    <div className="bg-cta/5 p-4 rounded-xl border border-cta/10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Flame className="w-4 h-4 text-cta" />
                                            <span className="text-[10px] font-bold text-cta uppercase tracking-widest">Trade Intelligence Pulse</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-text-muted font-bold uppercase">Trend Strength</span>
                                                <span className="text-xs font-bold text-text-main">Strong Accumulation</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-text-muted font-bold uppercase">Volatility Index</span>
                                                <span className="text-xs font-bold text-text-main">Low (~12.4%)</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-text-muted font-bold uppercase">Pivot Status</span>
                                                <span className="text-xs font-bold text-secondary">Above Cluster</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {narrative.globalCues.map((cue, i) => (
                                            <span key={i} className="px-3 py-1 bg-bg-main border border-border-soft rounded-full text-[10px] font-bold text-text-muted flex items-center gap-1.5 hover:text-cta transition-colors cursor-default">
                                                <Zap className="w-3 h-3" /> {cue}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center opacity-40">
                            <Newspaper className="w-16 h-16 text-text-muted" />
                            <p className="max-w-sm text-sm">Select a stock to generate a tailor-made story based on trending global events and local news.</p>
                        </div>
                    )}
                </div>

                {/* Side Panels */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    {/* Trending Pulses */}
                    <div className="bg-bg-panel border border-border-soft rounded-3xl p-6 flex flex-col">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-6">
                            <Flame className="w-5 h-5 text-orange-500" /> Trending Pulses
                        </h3>
                        <div className="space-y-3">
                            {trendingStocks.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    className="p-4 bg-bg-main border border-border-soft rounded-2xl group hover:border-cta/30 transition-all cursor-pointer flex justify-between items-center"
                                    onClick={() => setSymbol(stock.symbol)}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-text-main">{stock.symbol}</span>
                                            <span className={`text-[10px] font-bold ${stock.sentiment.includes("Bullish") ? "text-[#00b894]" : "text-text-muted"}`}>
                                                {stock.sentiment}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-text-muted">{stock.cue}</p>
                                    </div>
                                    <span className="text-xs font-bold text-secondary font-mono">{stock.change}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Meta Factors */}
                    <div className="bg-bg-panel border border-border-soft rounded-3xl p-6 flex flex-col">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-6">
                            <Globe className="w-5 h-5 text-cta" /> Global Sentries
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-text-muted">Global Tensions</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 4 ? "bg-danger" : "bg-bg-main"}`}></div>)}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-text-muted">Macro Liquidity</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? "bg-secondary" : "bg-bg-main"}`}></div>)}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-text-muted">Political Impacts</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 2 ? "bg-cta" : "bg-bg-main"}`}></div>)}
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 bg-bg-main border border-border-soft rounded-xl text-[10px] font-bold text-text-muted flex items-center justify-center gap-2 hover:text-cta transition-colors">
                            Source: MoneyControl/Yahoo <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* SEBI Disclaimer */}
            <div className="mt-12 pt-8 border-t border-border-soft/30 text-center">
                <p className="text-[10px] text-text-muted/60 font-medium tracking-wide max-w-2xl mx-auto leading-relaxed italic">
                    DISCLAIMER: Pulse Sentinel is not a SEBI registered advisory entity. All intelligence is synthesized by generative AI for educational and research purposes only. Market investments are subject to risk; please perform independent due diligence or consult a certified professional before taking any trade.
                </p>
            </div>
        </div>
    );
}
