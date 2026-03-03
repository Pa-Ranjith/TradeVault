"use client";

import { useApp } from "@/context/AppContext";
import { BookOpen, Calendar, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";

export function Journal() {
    const { trades, currency } = useApp();

    const totalProfit = trades.reduce((acc, t) => acc + (t.netProfit || 0), 0);

    // Calculate Discipline Score: average of completed guards vs total required (2)
    const disciplineScore = trades.length > 0
        ? Math.round((trades.reduce((acc, t) => acc + (t.guards?.length || 0), 0) / (trades.length * 2)) * 100)
        : 100;

    const fmt = (val: number) => {
        const locale = currency === "$" ? "en-US" : "en-IN";
        return val.toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-cormorant font-bold text-text-main">Trading Journal</h2>
                    <p className="text-text-muted">Review your performance and psychological notes.</p>
                </div>
            </div>

            {/* Journal Summary Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-bg-panel border border-border-soft rounded-2xl p-6 shadow-soft">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Trades</span>
                    <div className="text-3xl font-bold mt-1 tabular-nums">{trades.length}</div>
                </div>
                <div className="bg-bg-panel border border-border-soft rounded-2xl p-6 shadow-soft">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Net P&L</span>
                    <div className={`text-3xl font-bold mt-1 ${totalProfit >= 0 ? 'text-secondary' : 'text-danger'}`}>
                        {totalProfit >= 0 ? '+' : ''}{currency}{fmt(totalProfit)}
                    </div>
                </div>
                <div className="bg-bg-panel border border-border-soft rounded-2xl p-6 shadow-soft group hover:border-cta/20 transition-all cursor-help" title="Based on Pre-Trade Guard completeness">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Avg Discipline</span>
                    <div className="text-3xl font-bold mt-1 text-cta">{disciplineScore}%</div>
                </div>
            </div>

            <div className="bg-bg-panel border border-border-soft rounded-2xl shadow-soft overflow-hidden">
                <div className="p-6 border-b border-border-soft flex justify-between items-center bg-bg-panel/50">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cta" /> Trade History
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-tighter">
                        <Calendar className="w-4 h-4" /> All Time
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-main/50 text-[10px] uppercase tracking-widest text-text-muted font-bold border-b border-border-soft">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Symbol</th>
                                <th className="px-6 py-4">Market</th>
                                <th className="px-6 py-4">Setup</th>
                                <th className="px-6 py-4">Qty</th>
                                <th className="px-6 py-4">P&L</th>
                                <th className="px-6 py-4 text-right">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted italic">
                                        Your journal is empty. Start logging trades to see your progress.
                                    </td>
                                </tr>
                            ) : (
                                trades.map((trade, idx) => (
                                    <tr key={idx} className="border-b border-border-soft last:border-0 hover:bg-bg-main/30 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-text-muted">
                                            {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-text-main">
                                            {trade.symbol}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] text-text-muted uppercase">
                                                {trade.market?.replace('_', ' ') || 'NSE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${trade.direction === 'LONG' ? 'text-secondary bg-secondary/10' : 'text-danger bg-danger/10'}`}>
                                                {trade.direction}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {trade.qty}
                                        </td>
                                        <td className={`px-6 py-4 font-inter font-bold ${trade.netProfit >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                            {trade.netProfit >= 0 ? '+' : ''}{trade.currency || currency}{fmt(trade.netProfit || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-cta hover:text-cta-hover text-xs font-bold underline transition-colors">Details</button>
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
