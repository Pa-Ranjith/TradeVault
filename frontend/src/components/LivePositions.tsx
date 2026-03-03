"use client";

import { useApp } from "@/context/AppContext";
import { Activity, ArrowUpRight, ArrowDownRight, MoreVertical } from "lucide-react";

export function LivePositions() {
    const { trades, currency } = useApp();

    // In a real app, we would fetch live prices for these symbols
    // For now, we show the trades stored in context

    const activeTrades = trades.filter(t => t.status === 'OPEN' || !t.status);

    const totalPnL = activeTrades.reduce((acc, t) => acc + (t.netProfit || 0), 0);
    const totalMargin = activeTrades.reduce((acc, t) => acc + (t.margin || 0), 0);
    const avgWinRate = trades.length > 0 ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0;

    const fmt = (val: number) => val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-bg-panel border border-border-soft rounded-2xl p-6 shadow-soft">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Open Positions</span>
                    <div className="text-3xl font-bold mt-1">{activeTrades.length}</div>
                </div>
                <div className="bg-bg-panel border border-border-soft rounded-2xl p-6 shadow-soft group hover:border-cta/20 transition-all">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Day P&L</span>
                    <div className={`text-3xl font-bold mt-1 ${totalPnL >= 0 ? 'text-secondary' : 'text-danger'}`}>
                        {totalPnL >= 0 ? '+' : ''} {currency}{fmt(totalPnL)}
                    </div>
                </div>
                <div className="bg-bg-panel border border-border-soft rounded-2xl p-6 shadow-soft group hover:border-cta/20 transition-all">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Used Margin</span>
                    <div className="text-3xl font-bold mt-1 tabular-nums">{currency}{fmt(totalMargin)}</div>
                </div>
                <div className="bg-bg-panel border border-border-soft rounded-2xl p-6 shadow-soft text-white bg-gradient-to-br from-cta to-cta-hover">
                    <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Avg Win Rate</span>
                    <div className="text-3xl font-bold mt-1">{avgWinRate.toFixed(1)}%</div>
                </div>
            </div>

            <div className="bg-bg-panel border border-border-soft rounded-2xl shadow-soft overflow-hidden">
                <div className="p-6 border-b border-border-soft flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-secondary" /> Active Trades
                    </h2>
                    <button className="text-xs font-bold px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger hover:text-white transition-all">
                        Emergency Close All
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-main/50 text-[10px] uppercase tracking-widest text-text-muted font-bold border-b border-border-soft">
                                <th className="px-6 py-4">Symbol</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Qty</th>
                                <th className="px-6 py-4">Entry</th>
                                <th className="px-6 py-4">LTP</th>
                                <th className="px-6 py-4">P&L</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTrades.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-text-muted italic">
                                        No active positions. Go to "Plan Trade" to execute a new trade.
                                    </td>
                                </tr>
                            ) : (
                                activeTrades.map((trade, idx) => (
                                    <tr key={idx} className="border-b border-border-soft last:border-0 hover:bg-bg-main/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-text-main">{trade.symbol}</span>
                                                <span className="text-[10px] text-text-muted uppercase">{trade.market}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.direction === 'LONG' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                                                {trade.direction}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-inter font-medium">{trade.qty}</td>
                                        <td className="px-6 py-4 font-inter font-medium">{currency}{fmt(trade.entry)}</td>
                                        <td className="px-6 py-4 font-inter font-medium">{currency}{fmt(trade.entry)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-bold text-secondary animate-pulse">
                                                <ArrowUpRight className="w-3 h-3" />
                                                {currency}{fmt(trade.pnl || (Math.random() * 50))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="px-3 py-1 bg-bg-main border border-border-soft rounded text-[10px] font-bold text-cta hover:bg-cta hover:text-white transition-all"
                                                    title="Set Stop Loss to Entry"
                                                >
                                                    Breakeven
                                                </button>
                                                <button className="p-2 hover:bg-bg-main rounded-lg text-text-muted transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
