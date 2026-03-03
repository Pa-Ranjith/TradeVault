"use client";

import { useState } from "react";
import { LayoutDashboard, Activity, BookOpen, BarChart2, Settings, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";

export function Sidebar() {
    const { activeModule, setActiveModule, trades, currency, capital } = useApp();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const openPositions = trades.filter(t => t.status === 'OPEN' || !t.status).length;

    const navItems = [
        { id: 'planner', icon: LayoutDashboard, label: 'Planner' },
        { id: 'positions', icon: Activity, label: 'Live Positions', badge: openPositions > 0 ? openPositions : null },
        { id: 'journal', icon: BookOpen, label: 'Journal' },
        { id: 'analytics', icon: BarChart2, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className={`${isCollapsed ? "w-[80px]" : "w-[260px]"} bg-bg-panel border-r border-border-soft flex flex-col transition-all duration-300 relative h-screen`}>
            {/* Logo Section */}
            <div className={`p-6 flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3 font-cormorant text-2xl font-bold text-text-main">
                        <Image src="/logo.png" alt="TradeVault Logo" width={32} height={32} className="rounded-lg shadow-lg" />
                        <span>TradeVault</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-text-muted hover:text-text-main transition-colors bg-bg-main p-1.5 rounded-md border border-border-soft"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>

            {isCollapsed && (
                <div className="flex justify-center mb-6">
                    <Image src="/logo.png" alt="TradeVault Logo" width={32} height={32} className="rounded-lg shadow-lg" />
                </div>
            )}

            {/* Navigation */}
            <nav className="px-4 flex-1 flex flex-col gap-2 mt-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveModule(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group
                            ${activeModule === item.id ? 'bg-cta text-white shadow-lg' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}
                    >
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${activeModule === item.id ? 'text-white' : 'text-text-muted transition-colors group-hover:text-cta'}`} />
                        {!isCollapsed && (
                            <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && (
                            <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                {item.badge}
                            </span>
                        )}
                        {isCollapsed && item.badge && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-bg-panel" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto p-4 flex flex-col gap-4">
                {/* Performance Summary (Only if not collapsed) */}
                {!isCollapsed && (
                    <div className="p-4 bg-bg-main/30 rounded-2xl border border-border-soft/50 group hover:border-cta/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Day Performance</span>
                            <TrendingUp className="w-3 h-3 text-secondary animate-pulse" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold">{currency}0.00</span>
                            <span className="text-[10px] font-bold text-secondary">+0.0%</span>
                        </div>
                    </div>
                )}

                {/* Capital Display */}
                <div className={`p-4 border-t border-border-soft flex flex-col gap-3 ${isCollapsed ? "items-center" : ""}`}>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#00b894] uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00b894] shadow-[0_0_8px_#00b894] animate-pulse"></div>
                        {!isCollapsed && "Dhan Connected"}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider opacity-60">Trading Capital</span>
                            <span className="text-lg font-bold text-text-main font-inter tabular-nums">
                                {currency}{capital?.toLocaleString(currency === '₹' ? 'en-IN' : 'en-US')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
