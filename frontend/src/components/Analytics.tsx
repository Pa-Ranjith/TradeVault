"use client";

import { useApp } from "@/context/AppContext";
import { BarChart3, TrendingUp, Target, Award, ShieldCheck, Clock } from "lucide-react";

export function Analytics() {
    const { trades, currency } = useApp();

    // Stats Engine
    const winningTrades = trades.filter(t => (t.netProfit || 0) > 0);
    const losingTrades = trades.filter(t => (t.netProfit || 0) <= 0);

    const winRate = trades.length > 0 ? Math.round((winningTrades.length / trades.length) * 100) : 0;

    const grossProfit = winningTrades.reduce((acc, t) => acc + (t.netProfit || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + (t.netProfit || 0), 0));

    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? "∞" : "0.00");

    const avgDiscipline = trades.length > 0
        ? Math.round((trades.reduce((acc, t) => acc + (t.guards?.length || 0), 0) / (trades.length * 2)) * 100)
        : 100;

    // Equity Curve Data (Cumulative)
    let currentEquity = 0;
    const equityCurve = trades.slice().reverse().map(t => {
        currentEquity += (t.netProfit || 0);
        return currentEquity;
    });

    // Market Allocation
    const allocation = trades.reduce((acc: any, t) => {
        const m = t.market || 'INDIAN_EQUITIES';
        acc[m] = (acc[m] || 0) + 1;
        return acc;
    }, {});

    const totalTrades = trades.length || 1;
    const nsePerc = Math.round(((allocation['INDIAN_EQUITIES'] || 0) / totalTrades) * 100);
    const usPerc = Math.round(((allocation['US_EQ'] || 0) / totalTrades) * 100);
    const otherPerc = 100 - nsePerc - usPerc;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-cormorant font-bold text-text-main">Performance Analytics</h2>
                    <p className="text-text-muted">Statistical breakdown of your trading edge and discipline.</p>
                </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-bg-panel border border-border-soft rounded-3xl p-8 shadow-soft flex flex-col gap-4 group hover:border-cta/20 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Win Rate</span>
                        <div className="text-4xl font-bold text-text-main mt-1">{winRate}%</div>
                        <div className="w-full bg-bg-main h-1.5 rounded-full mt-4 overflow-hidden border border-border-soft/50">
                            <div className="bg-secondary h-full transition-all duration-1000" style={{ width: `${winRate}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-bg-panel border border-border-soft rounded-3xl p-8 shadow-soft flex flex-col gap-4 group hover:border-cta/20 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-cta/10 flex items-center justify-center text-cta">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Discipline Score</span>
                        <div className="text-4xl font-bold text-text-main mt-1">{avgDiscipline}%</div>
                        <div className="w-full bg-bg-main h-1.5 rounded-full mt-4 overflow-hidden border border-border-soft/50">
                            <div className="bg-cta h-full transition-all duration-1000" style={{ width: `${avgDiscipline}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-bg-panel border border-border-soft rounded-3xl p-8 shadow-soft flex flex-col gap-4 group hover:border-cta/20 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Profit Factor</span>
                        <div className="text-4xl font-bold text-text-main mt-1">{profitFactor}</div>
                        <p className="text-[10px] text-text-muted mt-4 font-medium italic">Your edge is statistically sustainable.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Performance Curve Placeholder */}
                <div className="bg-bg-panel border border-border-soft rounded-3xl p-8 shadow-soft">
                    <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cta" /> Equity Curve (MTD)
                    </h3>
                    <div className="h-48 w-full flex items-end gap-2 px-2">
                        {equityCurve.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs italic">
                                No trade data for curve.
                            </div>
                        ) : (
                            equityCurve.map((val, i) => {
                                const max = Math.max(...equityCurve, 1);
                                const height = Math.max(10, (val / max) * 100);
                                return (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-t-lg transition-all relative group ${val >= 0 ? 'bg-secondary/20 hover:bg-secondary/40' : 'bg-danger/20 hover:bg-danger/40'}`}
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-main border border-border-soft px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {val >= 0 ? '' : '-'}{currency}{Math.abs(val).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                        <span>Feb 1</span>
                        <span>Feb 28</span>
                    </div>
                </div>

                {/* Market Distribution */}
                <div className="bg-bg-panel border border-border-soft rounded-3xl p-8 shadow-soft flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-warning" /> Market Allocation
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold">Indian Equities</span>
                                <span className="text-sm font-bold">{nsePerc}%</span>
                            </div>
                            <div className="w-full bg-bg-main h-2 rounded-full overflow-hidden">
                                <div className="bg-secondary h-full transition-all duration-500" style={{ width: `${nsePerc}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-semibold">US Stocks</span>
                                <span className="text-sm font-bold">{usPerc}%</span>
                            </div>
                            <div className="w-full bg-bg-main h-2 rounded-full overflow-hidden">
                                <div className="bg-cta h-full transition-all duration-500" style={{ width: `${usPerc}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm font-semibold">Other Assets</span>
                                <span className="text-sm font-bold">{otherPerc}%</span>
                            </div>
                            <div className="w-full bg-bg-main h-2 rounded-full overflow-hidden">
                                <div className="bg-warning h-full transition-all duration-500" style={{ width: `${otherPerc}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-text-muted border-t border-border-soft pt-4 mt-4">
                        Data reflects your current risk distribution across global markets.
                    </p>
                </div>
            </div>
        </div>
    );
}
