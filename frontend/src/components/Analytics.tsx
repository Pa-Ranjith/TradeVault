"use client";

import { useApp } from "@/context/AppContext";
import {
    BarChart3, TrendingUp, Target, Award, ShieldCheck, Clock,
    ArrowUpRight, ArrowDownRight, Flame, Zap, PieChart
} from "lucide-react";

export function Analytics() {
    const { trades, currency } = useApp();

    // --- COMPUTED METRICS ---
    const totalTrades = trades.length;
    const wins = trades.filter(t => (t.netProfit || 0) > 0);
    const losses = trades.filter(t => (t.netProfit || 0) <= 0);
    const winRate = totalTrades > 0 ? Math.round((wins.length / totalTrades) * 100) : 0;

    const totalProfit = wins.reduce((a, t) => a + (t.netProfit || 0), 0);
    const totalLoss = Math.abs(losses.reduce((a, t) => a + (t.netProfit || 0), 0));
    const profitFactor = totalLoss > 0 ? +(totalProfit / totalLoss).toFixed(2) : totalProfit > 0 ? Infinity : 0;
    const netPnL = trades.reduce((a, t) => a + (t.netProfit || 0), 0);

    const avgWin = wins.length > 0 ? totalProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 0;
    const avgRR = avgLoss > 0 ? +(avgWin / avgLoss).toFixed(2) : 0;

    // Max Drawdown (peak-to-trough)
    let peak = 0, maxDrawdown = 0;
    const equityCurve: number[] = [];
    let cumPnL = 0;
    trades.slice().reverse().forEach(t => {
        cumPnL += (t.netProfit || 0);
        equityCurve.push(cumPnL);
        if (cumPnL > peak) peak = cumPnL;
        const dd = peak - cumPnL;
        if (dd > maxDrawdown) maxDrawdown = dd;
    });

    // Current streak
    let streak = 0;
    for (let i = 0; i < trades.length; i++) {
        if ((trades[i].netProfit || 0) > 0) streak++;
        else break;
    }

    // Discipline score
    const disciplineScore = totalTrades > 0
        ? Math.round((trades.reduce((a, t) => a + (t.guards?.length || 0), 0) / (totalTrades * 2)) * 100)
        : 100;

    // Best & Worst trade
    const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.netProfit || 0)) : 0;
    const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.netProfit || 0)) : 0;

    // Market allocation
    const marketCounts: Record<string, number> = {};
    trades.forEach(t => {
        const m = t.market || 'NSE';
        marketCounts[m] = (marketCounts[m] || 0) + 1;
    });
    const marketEntries = Object.entries(marketCounts).sort((a, b) => b[1] - a[1]);

    // Setup performance (by tags)
    const tagPerf: Record<string, { wins: number; total: number; pnl: number }> = {};
    trades.forEach(t => {
        const tags = t.tags || ['Untagged'];
        tags.forEach((tag: string) => {
            if (!tagPerf[tag]) tagPerf[tag] = { wins: 0, total: 0, pnl: 0 };
            tagPerf[tag].total++;
            tagPerf[tag].pnl += (t.netProfit || 0);
            if ((t.netProfit || 0) > 0) tagPerf[tag].wins++;
        });
    });

    // Day-of-week performance
    const dayPerf: Record<string, { wins: number; total: number }> = {
        Mon: { wins: 0, total: 0 }, Tue: { wins: 0, total: 0 }, Wed: { wins: 0, total: 0 },
        Thu: { wins: 0, total: 0 }, Fri: { wins: 0, total: 0 }
    };
    trades.forEach(t => {
        const d = new Date(t.timestamp || Date.now());
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = days[d.getDay()];
        if (dayPerf[day]) {
            dayPerf[day].total++;
            if ((t.netProfit || 0) > 0) dayPerf[day].wins++;
        }
    });

    const fmt = (val: number) => {
        const locale = currency === "$" ? "en-US" : "en-IN";
        return val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const marketColors: Record<string, string> = {
        'INDIAN_EQUITIES': 'bg-blue-500', 'NSE': 'bg-blue-500', 'US_EQ': 'bg-purple-500',
        'CRYPTO': 'bg-orange-500', 'FOREX': 'bg-green-500', 'COMMODITIES': 'bg-amber-500'
    };

    const tagLabels: Record<string, string> = {
        breakout: 'Breakout', momentum: 'Momentum', reversal: 'Reversal', news: 'News-Driven',
        scalp: 'Scalp', swing: 'Swing', sr: 'S/R Level', pattern: 'Pattern', Untagged: 'Untagged'
    };

    // SVG equity curve
    const svgWidth = 600, svgHeight = 120;
    const eqMin = Math.min(0, ...equityCurve);
    const eqMax = Math.max(1, ...equityCurve);
    const eqRange = eqMax - eqMin || 1;
    const eqPoints = equityCurve.map((v, i) => {
        const x = (i / Math.max(1, equityCurve.length - 1)) * svgWidth;
        const y = svgHeight - ((v - eqMin) / eqRange) * (svgHeight - 10) - 5;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-outfit font-bold text-text-main">Performance Analytics</h2>
                <p className="text-sm text-text-muted">Data-driven insights from your trading history.</p>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <KpiCard icon={<Target className="w-4 h-4" />} label="Win Rate" value={`${winRate}%`} accent={winRate >= 50 ? "text-secondary" : "text-danger"} />
                <KpiCard icon={<BarChart3 className="w-4 h-4" />} label="Profit Factor" value={profitFactor === Infinity ? '∞' : `${profitFactor}`} accent="text-cta" />
                <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Avg R:R" value={`${avgRR}`} accent="text-primary" />
                <KpiCard icon={<ArrowDownRight className="w-4 h-4" />} label="Max Drawdown" value={`${currency}${fmt(maxDrawdown)}`} accent="text-danger" />
                <KpiCard icon={<Flame className="w-4 h-4" />} label="Win Streak" value={`${streak}`} accent="text-orange-500" />
                <KpiCard icon={<ShieldCheck className="w-4 h-4" />} label="Discipline" value={`${disciplineScore}%`} accent="text-cta" />
            </div>

            {/* Row 2: Net P&L + Equity Curve */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Net P&L Summary */}
                <div className="bg-bg-panel border border-border-soft rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">P&L Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">Net P&L</span>
                            <span className={`text-lg font-bold ${netPnL >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                {netPnL >= 0 ? '+' : ''}{currency}{fmt(netPnL)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">Best Trade</span>
                            <span className="text-sm font-semibold text-secondary">+{currency}{fmt(bestTrade)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">Worst Trade</span>
                            <span className="text-sm font-semibold text-danger">{currency}{fmt(worstTrade)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">Avg Win</span>
                            <span className="text-sm font-semibold text-secondary">+{currency}{fmt(avgWin)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">Avg Loss</span>
                            <span className="text-sm font-semibold text-danger">-{currency}{fmt(avgLoss)}</span>
                        </div>
                        <div className="border-t border-border-soft pt-3 flex justify-between items-center">
                            <span className="text-sm text-text-muted">Total Trades</span>
                            <span className="text-sm font-bold text-text-main">{totalTrades} ({wins.length}W / {losses.length}L)</span>
                        </div>
                    </div>
                </div>

                {/* Equity Curve */}
                <div className="lg:col-span-2 bg-bg-panel border border-border-soft rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Equity Curve</h3>
                    {equityCurve.length > 1 ? (
                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-[120px]">
                            <defs>
                                <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={netPnL >= 0 ? "#A8D5BA" : "#FF7675"} stopOpacity="0.4" />
                                    <stop offset="100%" stopColor={netPnL >= 0 ? "#A8D5BA" : "#FF7675"} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <polygon
                                points={`0,${svgHeight} ${eqPoints} ${svgWidth},${svgHeight}`}
                                fill="url(#eqGrad)"
                            />
                            <polyline
                                points={eqPoints}
                                fill="none"
                                stroke={netPnL >= 0 ? "#63B984" : "#FF6B6B"}
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        <div className="h-[120px] flex items-center justify-center text-sm text-text-muted italic">
                            Execute trades to see your equity curve
                        </div>
                    )}
                </div>
            </div>

            {/* Row 3: Market Allocation + Day Performance + Setup Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Market Allocation */}
                <div className="bg-bg-panel border border-border-soft rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-1.5">
                        <PieChart className="w-3.5 h-3.5" /> Market Allocation
                    </h3>
                    {marketEntries.length > 0 ? (
                        <div className="space-y-3">
                            {marketEntries.map(([market, count]) => {
                                const pct = Math.round((count / totalTrades) * 100);
                                return (
                                    <div key={market}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-text-muted">{market.replace('_', ' ')}</span>
                                            <span className="font-semibold text-text-main">{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${marketColors[market] || 'bg-gray-400'} transition-all duration-500`}
                                                style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted italic">No trades yet</p>
                    )}
                </div>

                {/* Day-of-Week Heatmap */}
                <div className="bg-bg-panel border border-border-soft rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Day Performance
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                        {Object.entries(dayPerf).map(([day, data]) => {
                            const wr = data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0;
                            const intensity = wr > 60 ? 'bg-secondary/30 border-secondary/40' : wr > 40 ? 'bg-amber-500/20 border-amber-500/30' : data.total > 0 ? 'bg-danger/20 border-danger/30' : 'bg-bg-main border-border-soft';
                            return (
                                <div key={day} className={`flex flex-col items-center p-3 rounded-lg border ${intensity} transition-all`}>
                                    <span className="text-[10px] font-bold text-text-muted uppercase">{day}</span>
                                    <span className="text-lg font-bold text-text-main mt-1">{wr}%</span>
                                    <span className="text-[10px] text-text-muted">{data.total} trades</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Setup Performance */}
                <div className="bg-bg-panel border border-border-soft rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Setup Performance
                    </h3>
                    {Object.keys(tagPerf).length > 0 ? (
                        <div className="space-y-2.5">
                            {Object.entries(tagPerf).sort((a, b) => b[1].pnl - a[1].pnl).map(([tag, data]) => {
                                const wr = Math.round((data.wins / data.total) * 100);
                                return (
                                    <div key={tag} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-text-main font-medium">{tagLabels[tag] || tag}</span>
                                            <span className="text-[10px] text-text-muted">({data.total})</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold ${wr >= 50 ? 'text-secondary' : 'text-danger'}`}>{wr}%</span>
                                            <span className={`text-xs font-semibold ${data.pnl >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                                {data.pnl >= 0 ? '+' : ''}{currency}{fmt(data.pnl)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-text-muted italic">Tag your trades to see setup performance</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// Reusable KPI Card
function KpiCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
    return (
        <div className="bg-bg-panel border border-border-soft rounded-xl p-4 hover:border-cta/20 transition-all group">
            <div className="flex items-center gap-1.5 mb-2 text-text-muted group-hover:text-cta transition-colors">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <span className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</span>
        </div>
    );
}
