"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
    BookOpen, Calendar, ArrowUpRight, ArrowDownRight, Search,
    Camera, MessageSquare, Star, X, ChevronLeft, Upload, TrendingUp, TrendingDown, Tag
} from "lucide-react";

export function Journal() {
    const { trades, currency, updateTrade } = useApp();
    const [selectedTradeIdx, setSelectedTradeIdx] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingPrePlan, setEditingPrePlan] = useState("");
    const [editingPostReview, setEditingPostReview] = useState("");
    const [editingNotes, setEditingNotes] = useState("");

    const totalProfit = trades.reduce((acc, t) => acc + (t.netProfit || 0), 0);
    const winCount = trades.filter(t => (t.netProfit || 0) > 0).length;
    const winRate = trades.length > 0 ? Math.round((winCount / trades.length) * 100) : 0;
    const disciplineScore = trades.length > 0
        ? Math.round((trades.reduce((acc, t) => acc + (t.guards?.length || 0), 0) / (trades.length * 2)) * 100)
        : 100;

    const fmt = (val: number) => {
        const locale = currency === "$" ? "en-US" : "en-IN";
        return val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const filteredTrades = trades.filter(t =>
        !searchQuery || t.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.market?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tagLabels: Record<string, string> = {
        rate_hike: '#InterestRateHike', rate_cut: '#RateCut', earnings: '#EarningsSeason',
        geopolitical: '#Geopolitical', inflation: '#InflationData', gdp: '#GDPReport',
        breakout: '#Breakout', momentum: '#Momentum', reversal: '#Reversal',
        support_resistance: '#SupportResistance', news_driven: '#NewsDriven',
        sector_rotation: '#SectorRotation', fii_dii: '#FII_DII_Flow', budget: '#BudgetImpact',
        global_cues: '#GlobalCues', scalp: '#Scalp', swing: '#SwingTrade', pattern: '#ChartPattern'
    };

    // Open detail view for a trade
    const openDetail = (idx: number) => {
        const trade = trades[idx];
        setSelectedTradeIdx(idx);
        setEditingPrePlan(trade.preTradePlan || "");
        setEditingPostReview(trade.postTradeReview || "");
        setEditingNotes(trade.notes || "");
    };

    const closeDetail = () => {
        setSelectedTradeIdx(null);
        setEditingPrePlan("");
        setEditingPostReview("");
        setEditingNotes("");
    };

    const handleSave = () => {
        if (selectedTradeIdx === null) return;
        updateTrade(selectedTradeIdx, {
            preTradePlan: editingPrePlan,
            postTradeReview: editingPostReview,
            notes: editingNotes
        });
    };

    const handleScreenshotUpload = (file: File) => {
        if (selectedTradeIdx === null) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            const trade = trades[selectedTradeIdx];
            const screenshots = [...(trade.screenshots || []), base64];
            updateTrade(selectedTradeIdx, { screenshots });
        };
        reader.readAsDataURL(file);
    };

    const handleRating = (category: string, rating: number) => {
        if (selectedTradeIdx === null) return;
        const trade = trades[selectedTradeIdx];
        const evaluation = { ...(trade.evaluation || {}), [category]: rating };
        updateTrade(selectedTradeIdx, { evaluation });
    };

    const removeScreenshot = (ssIdx: number) => {
        if (selectedTradeIdx === null) return;
        const trade = trades[selectedTradeIdx];
        const screenshots = [...(trade.screenshots || [])];
        screenshots.splice(ssIdx, 1);
        updateTrade(selectedTradeIdx, { screenshots });
    };

    // ─── DETAIL VIEW ───
    if (selectedTradeIdx !== null) {
        const trade = trades[selectedTradeIdx];
        if (!trade) { closeDetail(); return null; }
        const isProfit = (trade.netProfit || 0) >= 0;

        return (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={closeDetail} className="p-2 hover:bg-bg-panel rounded-xl transition-colors">
                        <ChevronLeft className="w-5 h-5 text-text-muted" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-outfit font-bold text-text-main">{trade.symbol}</h2>
                            <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg ${trade.direction === 'LONG' ? 'text-secondary bg-secondary/10' : 'text-danger bg-danger/10'}`}>
                                {trade.direction}
                            </span>
                            <span className="text-[10px] text-text-muted uppercase bg-bg-panel px-2.5 py-1 rounded-lg">
                                {trade.market?.replace('_', ' ') || 'NSE'}
                            </span>
                        </div>
                        <p className="text-sm text-text-muted mt-0.5">
                            {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : 'Today'}
                        </p>
                    </div>
                    <div className={`text-right ${isProfit ? 'text-secondary' : 'text-danger'}`}>
                        <div className="text-3xl font-bold flex items-center gap-2">
                            {isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                            {isProfit ? '+' : ''}{currency}{fmt(trade.netProfit || 0)}
                        </div>
                        <span className="text-xs text-text-muted">Estimated P&L</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Trade Details */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Trade Parameters */}
                        <div className="bg-bg-panel border border-border-soft rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-cta" /> Trade Parameters
                            </h3>
                            <div className="grid grid-cols-5 gap-4">
                                {[
                                    { label: 'Entry', value: `${currency}${fmt(trade.entry || 0)}`, color: '' },
                                    { label: 'Stop Loss', value: `${currency}${fmt(trade.sl || 0)}`, color: 'text-danger' },
                                    { label: 'Target', value: `${currency}${fmt(trade.target || 0)}`, color: 'text-secondary' },
                                    { label: 'Quantity', value: trade.qty, color: '' },
                                    { label: 'R:R Ratio', value: trade.sl && trade.target && trade.entry ? `1:${((Number(trade.target) - Number(trade.entry)) / (Number(trade.entry) - Number(trade.sl))).toFixed(1)}` : 'N/A', color: 'text-cta' },
                                ].map((p, i) => (
                                    <div key={i} className="bg-bg-main/50 rounded-xl p-3 text-center">
                                        <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">{p.label}</span>
                                        <span className={`text-lg font-bold ${p.color}`}>{p.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        {trade.tags && trade.tags.length > 0 && (
                            <div className="bg-bg-panel border border-border-soft rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-cta" /> Trade Reasons
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {trade.tags.map((t: string) => (
                                        <span key={t} className="text-xs font-medium text-cta bg-cta/10 px-3 py-1.5 rounded-full">
                                            {tagLabels[t] || t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pre-Trade Plan */}
                        <div className="bg-bg-panel border border-border-soft rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-cta" /> Pre-Trade Plan
                            </h3>
                            <textarea
                                value={editingPrePlan}
                                onChange={e => setEditingPrePlan(e.target.value)}
                                placeholder="Why am I taking this trade? What's my conviction level? What's the thesis?"
                                className="w-full p-4 text-sm bg-bg-main border border-border-soft rounded-xl outline-none focus:border-cta resize-none h-28 leading-relaxed"
                            />
                        </div>

                        {/* Post-Trade Review */}
                        <div className="bg-bg-panel border border-border-soft rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-secondary" /> Post-Trade Review
                            </h3>
                            <textarea
                                value={editingPostReview}
                                onChange={e => setEditingPostReview(e.target.value)}
                                placeholder="What went right? What could I improve? Would I take this trade again?"
                                className="w-full p-4 text-sm bg-bg-main border border-border-soft rounded-xl outline-none focus:border-cta resize-none h-28 leading-relaxed"
                            />
                        </div>

                        {/* Quick Notes */}
                        <div className="bg-bg-panel border border-border-soft rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-text-main mb-3">Quick Notes</h3>
                            <textarea
                                value={editingNotes}
                                onChange={e => setEditingNotes(e.target.value)}
                                placeholder="Any additional observations, lessons learned..."
                                className="w-full p-4 text-sm bg-bg-main border border-border-soft rounded-xl outline-none focus:border-cta resize-none h-20 leading-relaxed"
                            />
                        </div>

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-cta hover:bg-cta-hover text-white font-bold rounded-xl shadow-lg transition-all"
                        >
                            Save Journal Entry
                        </button>
                    </div>

                    {/* RIGHT: Screenshots + Evaluation */}
                    <div className="space-y-5">
                        {/* Screenshots */}
                        <div className="bg-bg-panel border border-border-soft rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-text-main mb-3 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-cta" /> Screenshots
                            </h3>
                            <div className="space-y-2 mb-3">
                                {(trade.screenshots || []).map((ss: string, si: number) => (
                                    <div key={si} className="relative group rounded-xl overflow-hidden border border-border-soft">
                                        <img src={ss} alt={`Chart screenshot ${si + 1}`} className="w-full h-40 object-cover" />
                                        <button
                                            onClick={() => removeScreenshot(si)}
                                            className="absolute top-2 right-2 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border-soft rounded-xl cursor-pointer hover:border-cta/30 transition-colors text-sm text-text-muted hover:text-cta">
                                <Upload className="w-4 h-4" />
                                Upload Chart Screenshot
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleScreenshotUpload(file);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>

                        {/* Self-Evaluation */}
                        <div className="bg-bg-panel border border-border-soft rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                                <Star className="w-4 h-4 text-cta" /> Self-Evaluation
                            </h3>
                            <div className="space-y-4">
                                {['discipline', 'execution', 'emotions'].map(cat => (
                                    <div key={cat}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-text-muted capitalize font-medium">{cat}</span>
                                            <span className="text-[10px] text-text-muted">{trade.evaluation?.[cat] || 0}/5</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleRating(cat, star)}
                                                    className="cursor-pointer transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 ${(trade.evaluation?.[cat] || 0) >= star ? 'text-cta fill-cta' : 'text-border-soft'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trade Summary Card */}
                        <div className="bg-bg-panel border border-border-soft rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-text-main mb-3">Trade Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-text-muted">Direction</span><span className="font-medium">{trade.direction}</span></div>
                                <div className="flex justify-between"><span className="text-text-muted">Market</span><span className="font-medium">{trade.market?.replace('_', ' ') || 'NSE'}</span></div>
                                <div className="flex justify-between"><span className="text-text-muted">Product</span><span className="font-medium">{trade.product || 'INTRADAY'}</span></div>
                                <div className="flex justify-between"><span className="text-text-muted">Segment</span><span className="font-medium">{trade.segment || 'EQ'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── LIST VIEW ───
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-outfit font-bold text-text-main">Trading Journal</h2>
                    <p className="text-sm text-text-muted">Click any trade to open the full detail view.</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search trades..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-2 text-sm bg-bg-panel border border-border-soft rounded-lg outline-none focus:border-cta w-48"
                    />
                    <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-bg-panel border border-border-soft rounded-xl p-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Trades</span>
                    <div className="text-2xl font-bold mt-1 tabular-nums">{trades.length}</div>
                </div>
                <div className="bg-bg-panel border border-border-soft rounded-xl p-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Net P&L</span>
                    <div className={`text-2xl font-bold mt-1 ${totalProfit >= 0 ? 'text-secondary' : 'text-danger'}`}>
                        {totalProfit >= 0 ? '+' : ''}{currency}{fmt(totalProfit)}
                    </div>
                </div>
                <div className="bg-bg-panel border border-border-soft rounded-xl p-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Win Rate</span>
                    <div className={`text-2xl font-bold mt-1 ${winRate >= 50 ? 'text-secondary' : 'text-danger'}`}>{winRate}%</div>
                </div>
                <div className="bg-bg-panel border border-border-soft rounded-xl p-4">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Discipline</span>
                    <div className="text-2xl font-bold mt-1 text-cta">{disciplineScore}%</div>
                </div>
            </div>

            {/* Trade History */}
            <div className="bg-bg-panel border border-border-soft rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border-soft flex justify-between items-center">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cta" /> Trade History
                    </h3>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> All Time
                    </span>
                </div>

                <div className="divide-y divide-border-soft">
                    {filteredTrades.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-text-muted italic">
                            {searchQuery ? 'No trades match your search.' : 'Your journal is empty. Execute a trade from the Planner to get started.'}
                        </div>
                    ) : (
                        filteredTrades.map((trade, idx) => (
                            <div
                                key={idx}
                                className="flex items-center px-5 py-3.5 hover:bg-bg-main/30 cursor-pointer transition-colors group"
                                onClick={() => openDetail(idx)}
                            >
                                <div className="w-24 text-xs text-text-muted">
                                    {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today'}
                                </div>
                                <div className="w-28 font-bold text-sm text-text-main">{trade.symbol}</div>
                                <div className="w-24 text-[10px] text-text-muted uppercase">{trade.market?.replace('_', ' ') || 'NSE'}</div>
                                <div className="w-20">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${trade.direction === 'LONG' ? 'text-secondary bg-secondary/10' : 'text-danger bg-danger/10'}`}>
                                        {trade.direction}
                                    </span>
                                </div>
                                <div className="w-16 text-sm">{trade.qty}</div>
                                {/* Tags preview */}
                                <div className="flex-1 flex gap-1 flex-wrap">
                                    {(trade.tags || []).slice(0, 2).map((t: string) => (
                                        <span key={t} className="text-[9px] text-cta bg-cta/8 px-1.5 py-0.5 rounded-full">{tagLabels[t] || t}</span>
                                    ))}
                                </div>
                                <div className={`w-32 text-right font-bold text-sm ${(trade.netProfit || 0) >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                    {(trade.netProfit || 0) >= 0 ? '+' : ''}{currency}{fmt(trade.netProfit || 0)}
                                </div>
                                <div className="w-8 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="w-4 h-4 text-cta" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
