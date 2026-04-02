"use client";

import { useState, useRef } from "react";
import {
    LayoutDashboard,
    PieChart,
    TrendingUp,
    ShieldCheck,
    ArrowUpRight,
    Upload,
    Download,
    AlertTriangle,
    Target,
    Zap,
    Briefcase,
    Loader2
} from "lucide-react";
import { parsePortfolioFile } from "../lib/portfolioParser";
import { analyzePortfolio } from "../services/nvidiaApi";
import { PortfolioAIAnalyst } from "./PortfolioAIAnalyst";

export function Portfolio() {
    const [selectedTab, setSelectedTab] = useState("dashboard");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiData, setAiData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setAiData(null); // Reset previous analysis

        try {
            const portfolioData = await parsePortfolioFile(file);
            console.log("Parsed Data:", portfolioData);
            
            const aiResponse = await analyzePortfolio(portfolioData);
            setAiData(aiResponse || null);
            
        } catch (error) {
            console.error("Error analyzing portfolio:", error);
            alert(error instanceof Error ? error.message : "Failed to analyze portfolio");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Mock Data for Extensive Analytics
    const capDistribution = [
        { label: "Blue-chip (Large Cap)", value: 45, color: "bg-cta", description: "Stable, low volatility" },
        { label: "Midcap", value: 35, color: "bg-secondary", description: "Aggressive growth potential" },
        { label: "Smallcap", value: 20, color: "bg-orange-500", description: "High risk, high reward" },
    ];

    const styleAnalytics = [
        { label: "Growth", value: 55, icon: Zap, color: "text-[#00b894]" },
        { label: "Value", value: 30, icon: Target, color: "text-[#0984e3]" },
        { label: "Dividend", value: 15, icon: TrendingUp, color: "text-[#6c5ce7]" },
    ];

    const sectors = [
        { name: "Technology", weight: 28, risk: "Medium" },
        { name: "Financials", weight: 22, risk: "Low" },
        { name: "Healthcare", weight: 15, risk: "Low" },
        { name: "Energy", weight: 12, risk: "High" },
        { name: "Others", weight: 23, risk: "Medium" },
    ];

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Tabs */}
            <div className="flex justify-between items-center bg-bg-panel/40 backdrop-blur-md p-2 rounded-2xl border border-border-soft w-fit">
                <button
                    onClick={() => setSelectedTab("dashboard")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${selectedTab === 'dashboard' ? 'bg-cta text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                    onClick={() => setSelectedTab("analytics")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${selectedTab === 'analytics' ? 'bg-cta text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                >
                    <PieChart className="w-4 h-4" /> Deep Analytics
                </button>
                <button
                    onClick={() => setSelectedTab("import")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${selectedTab === 'import' ? 'bg-cta text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                >
                    <Upload className="w-4 h-4" /> Import Accounts
                </button>
            </div>

            {selectedTab === 'dashboard' && (
                <div className="grid grid-cols-12 gap-6">
                    {/* NAV Card */}
                    <div className="col-span-12 lg:col-span-8 bg-bg-panel border border-border-soft rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cta/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-cta/10 transition-colors"></div>
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div>
                                <h3 className="text-text-muted uppercase text-xs font-bold tracking-[2px] mb-2">Total Equity Value (NAV)</h3>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-outfit font-bold text-text-main">₹4,82,500</span>
                                    <span className="text-secondary font-bold text-lg flex items-center gap-1">
                                        <TrendingUp className="w-5 h-5" /> +12.4%
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-bg-main rounded-xl border border-border-soft hover:border-cta/30 transition-all">
                                    <Download className="w-5 h-5 text-text-muted" />
                                </button>
                                <button className="px-6 py-2.5 bg-cta text-white rounded-xl font-bold shadow-lg hover:bg-cta-hover transition-all">
                                    Sync Now
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 relative z-10">
                            <div className="bg-bg-main/50 p-6 rounded-2xl border border-border-soft">
                                <span className="text-xs text-text-muted font-bold block mb-1">UNREALIZED P&L</span>
                                <span className="text-2xl font-bold text-secondary">+₹54,200</span>
                            </div>
                            <div className="bg-bg-main/50 p-6 rounded-2xl border border-border-soft">
                                <span className="text-xs text-text-muted font-bold block mb-1">DIVIDEND YIELD</span>
                                <span className="text-2xl font-bold text-cta">2.8%</span>
                            </div>
                            <div className="bg-bg-main/50 p-6 rounded-2xl border border-border-soft">
                                <span className="text-xs text-text-muted font-bold block mb-1">ACCOUNTS SYNCED</span>
                                <span className="text-2xl font-bold text-text-main">3</span>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Sidebar */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-bg-panel border border-border-soft rounded-3xl p-6 h-full flex flex-col">
                            <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-6">
                                <ShieldCheck className="w-5 h-5 text-secondary" /> Portfolio Health
                            </h3>

                            <div className="space-y-4 flex-1">
                                <div className="p-4 bg-secondary/10 rounded-2xl border border-secondary/20 group hover:scale-[1.02] transition-transform cursor-pointer">
                                    <h4 className="font-bold text-secondary text-sm mb-1">What's Working</h4>
                                    <p className="text-xs text-text-muted leading-relaxed">Your exposure to <span className="font-bold text-text-main">US Small Caps</span> via NVDA and AAPL has outperformed NIFTY by 18%.</p>
                                </div>

                                <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 group hover:scale-[1.02] transition-transform cursor-pointer">
                                    <h4 className="font-bold text-orange-500 text-sm mb-1">Improvement Area</h4>
                                    <p className="text-xs text-text-muted leading-relaxed">Concentration in <span className="font-bold text-text-main">Technology</span> is 12% above benchmark. Consider diversification.</p>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-3 bg-bg-main hover:bg-bg-panel border border-border-soft rounded-xl text-xs font-bold text-cta transition-all">
                                View Strategy Adjustments
                            </button>
                        </div>
                    </div>

                    {/* Quick Market Cap Breakdown */}
                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {capDistribution.map(cap => (
                            <div key={cap.label} className="bg-bg-panel border border-border-soft rounded-3xl p-6 group hover:border-cta/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${cap.color}/10`}>
                                        <div className={`w-3 h-3 rounded-full ${cap.color}`}></div>
                                    </div>
                                    <span className="text-2xl font-bold text-text-main">{cap.value}%</span>
                                </div>
                                <h4 className="font-bold text-sm text-text-main mb-1">{cap.label}</h4>
                                <p className="text-[10px] text-text-muted italic">{cap.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedTab === 'analytics' && (
                <div className="grid grid-cols-12 gap-8">
                    {/* Investment Style Analysis */}
                    <div className="col-span-12 lg:col-span-5 bg-bg-panel border border-border-soft rounded-3xl p-8">
                        <h3 className="text-xl font-bold text-text-main mb-8 flex items-center gap-3">
                            Style Quotient
                        </h3>
                        <div className="space-y-8">
                            {styleAnalytics.map(style => (
                                <div key={style.label}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl bg-bg-main border border-border-soft ${style.color}`}>
                                                <style.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm">{style.label}</span>
                                        </div>
                                        <span className="font-bold text-sm">{style.value}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-bg-main rounded-full overflow-hidden border border-border-soft shadow-inner">
                                        <div
                                            className="h-full bg-cta transition-all duration-1000 ease-out"
                                            style={{ width: `${style.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sector Diversification Hub */}
                    <div className="col-span-12 lg:col-span-7 bg-bg-panel border border-border-soft rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-text-main">Sector Diversification</h3>
                            <div className="px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-[10px] font-bold">
                                HEALTHY SCORE: 82/100
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {sectors.map(sector => (
                                <div key={sector.name} className="p-5 bg-bg-main rounded-2xl border border-border-soft hover:border-cta/20 transition-all flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-10 bg-cta/10 group-hover:bg-cta/30 rounded-full transition-colors"></div>
                                        <div>
                                            <h4 className="font-bold text-sm text-text-main">{sector.name}</h4>
                                            <span className={`text-[10px] font-bold uppercase ${sector.risk === 'High' ? 'text-danger' : 'text-text-muted'}`}>
                                                Risk: {sector.risk}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold text-text-main opacity-80">{sector.weight}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === 'import' && (
                <div className="max-w-4xl mx-auto w-full">
                    {isAnalyzing ? (
                        <div className="bg-bg-panel border border-border-soft rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
                            <Loader2 className="w-16 h-16 text-cta animate-spin mb-6" />
                            <h2 className="text-2xl font-outfit font-bold text-text-main mb-2">Analyzing Your Portfolio</h2>
                            <p className="text-text-muted">Extracting alpha signals and sector distribution via NVIDIA Inference Microservices...</p>
                        </div>
                    ) : aiData ? (
                        <PortfolioAIAnalyst data={aiData} onReset={() => setAiData(null)} />
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-bg-panel border-2 border-dashed border-border-soft rounded-[40px] p-20 flex flex-col items-center justify-center text-center group hover:border-cta/40 hover:bg-bg-panel/60 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileUpload}
                            />
                            
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cta/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-cta/10 transition-colors"></div>
                            
                            <div className="w-24 h-24 bg-cta/5 group-hover:bg-cta/10 rounded-full flex items-center justify-center mb-8 transition-all group-hover:scale-110 relative z-10">
                                <Upload className="w-10 h-10 text-cta" />
                            </div>
                            <h2 className="text-3xl font-outfit font-bold text-text-main mb-4 relative z-10">AI Analyst: Upload Portfolio</h2>
                            <p className="text-text-muted mb-6 max-w-md relative z-10 block">
                                Upload your portfolio (.csv or .xlsx). Powered by <span className="font-bold text-[#76B900]">NVIDIA</span> AI, we will analyze your distribution, risk, and generate tactical reallocation suggestions.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center relative z-10">
                                <div className="px-6 py-3 bg-bg-main border border-border-soft rounded-2xl flex items-center gap-3">
                                    <span className="font-bold text-sm text-text-muted">.CSV Supported</span>
                                </div>
                                <div className="px-6 py-3 bg-bg-main border border-border-soft rounded-2xl flex items-center gap-3">
                                    <span className="font-bold text-sm text-text-muted">.XLSX Supported</span>
                                </div>
                            </div>

                            <div className="mt-12 flex items-center gap-4 text-text-muted text-xs font-semibold relative z-10">
                                <ShieldCheck className="w-4 h-4 text-[#00b894]" /> Your data is parsed locally. ONLY anonymized, prompt-structured data is sent to NVIDIA APIs.
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
