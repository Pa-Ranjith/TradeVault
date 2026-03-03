"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
    BookOpen, Calendar, ArrowUpRight, ArrowDownRight, Search,
    Camera, MessageSquare, Star, X, ChevronDown, ChevronUp, Upload
} from "lucide-react";

export function Journal() {
    const { trades, currency, updateTrade } = useApp();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
    const [editingPrePlan, setEditingPrePlan] = useState<Record<number, string>>({});
    const [editingPostReview, setEditingPostReview] = useState<Record<number, string>>({});

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

    const handleScreenshotUpload = (tradeIdx: number, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            const trade = trades[tradeIdx];
            const screenshots = [...(trade.screenshots || []), base64];
            updateTrade(tradeIdx, { screenshots });
        };
        reader.readAsDataURL(file);
    };

    const handleSaveNotes = (tradeIdx: number) => {
        const updates: Record<string, any> = {};
        if (editingNotes[tradeIdx] !== undefined) updates.notes = editingNotes[tradeIdx];
        if (editingPrePlan[tradeIdx] !== undefined) updates.preTradePlan = editingPrePlan[tradeIdx];
        if (editingPostReview[tradeIdx] !== undefined) updates.postTradeReview = editingPostReview[tradeIdx];
        updateTrade(tradeIdx, updates);
        // Clear editing state
        setEditingNotes(prev => { const n = { ...prev }; delete n[tradeIdx]; return n; });
        setEditingPrePlan(prev => { const n = { ...prev }; delete n[tradeIdx]; return n; });
        setEditingPostReview(prev => { const n = { ...prev }; delete n[tradeIdx]; return n; });
    };

    const handleRating = (tradeIdx: number, category: string, rating: number) => {
        const trade = trades[tradeIdx];
        const evaluation = { ...(trade.evaluation || {}), [category]: rating };
        updateTrade(tradeIdx, { evaluation });
    };

    const tagLabels: Record<string, string> = {
        rate_hike: '#InterestRateHike', rate_cut: '#RateCut', earnings: '#EarningsSeason',
        geopolitical: '#Geopolitical', inflation: '#InflationData', gdp: '#GDPReport',
        breakout: '#Breakout', momentum: '#Momentum', reversal: '#Reversal',
        support_resistance: '#SupportResistance', news_driven: '#NewsDriven',
        sector_rotation: '#SectorRotation', fii_dii: '#FII_DII_Flow', budget: '#BudgetImpact',
        global_cues: '#GlobalCues', scalp: '#Scalp', swing: '#SwingTrade', pattern: '#ChartPattern'
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-outfit font-bold text-text-main">Trading Journal</h2>
                    <p className="text-sm text-text-muted">Document, reflect, and improve your trading decisions.</p>
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
                            {searchQuery ? 'No trades match your search.' : 'Your journal is empty. Start logging trades to see your progress.'}
                        </div>
                    ) : (
                        filteredTrades.map((trade, idx) => {
                            const isExpanded = expandedId === idx;
                            return (
                                <div key={idx} className="transition-all">
                                    {/* Trade Row */}
                                    <div
                                        className="flex items-center px-5 py-3.5 hover:bg-bg-main/30 cursor-pointer transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : idx)}
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
                                        <div className={`flex-1 text-right font-bold text-sm ${(trade.netProfit || 0) >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                            {(trade.netProfit || 0) >= 0 ? '+' : ''}{currency}{fmt(trade.netProfit || 0)}
                                        </div>
                                        <div className="w-8 text-right">
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                                        </div>
                                    </div>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 bg-bg-main/20 border-t border-border-soft/50">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
                                                {/* Left: Trade Details + Tags */}
                                                <div className="space-y-4">
                                                    {/* Trade Parameters */}
                                                    <div className="grid grid-cols-4 gap-3 text-sm">
                                                        <div><span className="text-[10px] text-text-muted uppercase block">Entry</span><span className="font-semibold">{currency}{fmt(trade.entry || 0)}</span></div>
                                                        <div><span className="text-[10px] text-text-muted uppercase block">SL</span><span className="font-semibold text-danger">{currency}{fmt(trade.sl || 0)}</span></div>
                                                        <div><span className="text-[10px] text-text-muted uppercase block">Target</span><span className="font-semibold text-secondary">{currency}{fmt(trade.target || 0)}</span></div>
                                                        <div><span className="text-[10px] text-text-muted uppercase block">Qty</span><span className="font-semibold">{trade.qty}</span></div>
                                                    </div>

                                                    {/* Tags */}
                                                    {trade.tags && trade.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {trade.tags.map((t: string) => (
                                                                <span key={t} className="text-[10px] font-medium text-cta bg-cta/10 px-2 py-0.5 rounded-full">
                                                                    {tagLabels[t] || t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Pre-Trade Plan */}
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider flex items-center gap-1 mb-1.5">
                                                            <MessageSquare className="w-3 h-3" /> Pre-Trade Plan
                                                        </label>
                                                        <textarea
                                                            value={editingPrePlan[idx] ?? trade.preTradePlan ?? ''}
                                                            onChange={e => setEditingPrePlan(p => ({ ...p, [idx]: e.target.value }))}
                                                            placeholder="Why am I taking this trade? What's my conviction?"
                                                            className="w-full p-3 text-sm bg-bg-panel border border-border-soft rounded-lg outline-none focus:border-cta resize-none h-20"
                                                        />
                                                    </div>

                                                    {/* Post-Trade Review */}
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider flex items-center gap-1 mb-1.5">
                                                            <MessageSquare className="w-3 h-3" /> Post-Trade Review
                                                        </label>
                                                        <textarea
                                                            value={editingPostReview[idx] ?? trade.postTradeReview ?? ''}
                                                            onChange={e => setEditingPostReview(p => ({ ...p, [idx]: e.target.value }))}
                                                            placeholder="What went right? What could I improve?"
                                                            className="w-full p-3 text-sm bg-bg-panel border border-border-soft rounded-lg outline-none focus:border-cta resize-none h-20"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Right: Screenshots + Self-Evaluation */}
                                                <div className="space-y-4">
                                                    {/* Screenshot Upload */}
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider flex items-center gap-1 mb-1.5">
                                                            <Camera className="w-3 h-3" /> Screenshots
                                                        </label>
                                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                                            {(trade.screenshots || []).map((ss: string, si: number) => (
                                                                <div key={si} className="relative group rounded-lg overflow-hidden border border-border-soft h-20">
                                                                    <img src={ss} alt={`Trade screenshot ${si + 1}`} className="w-full h-full object-cover" />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const screenshots = [...(trade.screenshots || [])];
                                                                            screenshots.splice(si, 1);
                                                                            updateTrade(idx, { screenshots });
                                                                        }}
                                                                        className="absolute top-1 right-1 bg-danger text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X className="w-2.5 h-2.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border-soft rounded-lg cursor-pointer hover:border-cta/30 transition-colors text-sm text-text-muted hover:text-cta">
                                                            <Upload className="w-4 h-4" />
                                                            Upload Screenshot
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                onChange={e => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) handleScreenshotUpload(idx, file);
                                                                    e.target.value = '';
                                                                }}
                                                            />
                                                        </label>
                                                    </div>

                                                    {/* Self-Evaluation */}
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider flex items-center gap-1 mb-2">
                                                            <Star className="w-3 h-3" /> Self-Evaluation
                                                        </label>
                                                        <div className="space-y-2.5">
                                                            {['discipline', 'execution', 'emotions'].map(cat => (
                                                                <div key={cat} className="flex items-center justify-between">
                                                                    <span className="text-xs text-text-muted capitalize">{cat}</span>
                                                                    <div className="flex gap-1">
                                                                        {[1, 2, 3, 4, 5].map(star => (
                                                                            <button
                                                                                key={star}
                                                                                onClick={(e) => { e.stopPropagation(); handleRating(idx, cat, star); }}
                                                                                className="cursor-pointer transition-colors"
                                                                            >
                                                                                <Star
                                                                                    className={`w-4 h-4 ${(trade.evaluation?.[cat] || 0) >= star ? 'text-cta fill-cta' : 'text-border-soft'}`}
                                                                                />
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Notes */}
                                                    <div>
                                                        <label className="text-[10px] font-bold uppercase text-text-muted tracking-wider mb-1.5 block">Quick Notes</label>
                                                        <textarea
                                                            value={editingNotes[idx] ?? trade.notes ?? ''}
                                                            onChange={e => setEditingNotes(p => ({ ...p, [idx]: e.target.value }))}
                                                            placeholder="Any additional thoughts..."
                                                            className="w-full p-3 text-sm bg-bg-panel border border-border-soft rounded-lg outline-none focus:border-cta resize-none h-16"
                                                        />
                                                    </div>

                                                    {/* Save Button */}
                                                    {(editingNotes[idx] !== undefined || editingPrePlan[idx] !== undefined || editingPostReview[idx] !== undefined) && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleSaveNotes(idx); }}
                                                            className="w-full py-2 bg-cta text-white text-sm font-semibold rounded-lg hover:bg-cta-hover transition-colors"
                                                        >
                                                            Save Journal Entry
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
