import React from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface AIResult {
  summary: string;
  highlights: string[];
  reallocations: Array<{ from: string; to: string; reason: string }>;
  sectorAnalysis: Array<{ sector: string; status: string; suggestion: string }>;
  alphaScore: number;
}

export function PortfolioAIAnalyst({ data, onReset }: { data: string, onReset: () => void }) {
    let result: AIResult | null = null;
    
    try {
        result = JSON.parse(data);
    } catch (e) {
        // Fallback or error handling
        console.error("Failed to parse AI response", e);
    }

    if (!result) {
        return (
            <div className="bg-bg-panel border border-border-soft rounded-3xl p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
                <h3 className="text-xl font-bold text-text-main mb-2">Analysis Failed</h3>
                <p className="text-text-muted mb-6">We couldn't structure the AI's response properly. Please try again.</p>
                <button onClick={onReset} className="px-6 py-2 bg-bg-main border border-border-soft rounded-xl text-text-main hover:bg-cta hover:border-cta transition-all">
                    Reset & Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Header Area */}
            <div className="flex justify-between items-start bg-bg-panel border border-cta/30 shadow-[0_0_40px_rgba(45,212,191,0.1)] rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-cta/10 blur-3xl rounded-full"></div>
                <div className="relative z-10 w-2/3">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-cta/20 rounded-xl text-cta">
                            <BrainCircuit className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold font-outfit text-text-main">AI Portfolio Strategist</h2>
                    </div>
                    <p className="text-text-muted leading-relaxed text-sm">
                        {result.summary}
                    </p>
                </div>
                
                <div className="relative z-10 bg-bg-main px-8 py-6 rounded-2xl border border-border-soft text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-text-muted mb-1 block tracking-wider uppercase">Alpha Potential</span>
                    <span className="text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-r from-cta to-secondary">
                        {result.alphaScore}
                        <span className="text-lg text-text-muted">/100</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Tactical Adjustments */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    {/* Reallocations */}
                    <div className="bg-bg-panel rounded-3xl p-8 border border-border-soft">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-6">
                            <ArrowRight className="w-5 h-5 text-secondary" /> Recommended Reallocations
                        </h3>
                        <div className="space-y-4">
                            {result.reallocations.map((mov, i) => (
                                <div key={i} className="p-5 bg-bg-main border border-border-soft rounded-2xl group hover:border-cta/40 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-danger bg-danger/10 px-3 py-1 rounded-lg text-sm">{mov.from}</span>
                                            <ArrowRight className="w-4 h-4 text-text-muted" />
                                            <span className="font-bold text-cta bg-cta/10 px-3 py-1 rounded-lg text-sm">{mov.to}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-muted">{mov.reason}</p>
                                </div>
                            ))}
                            {result.reallocations.length === 0 && (
                                <p className="text-text-muted text-sm italic">No immediate reallocations suggested by the AI.</p>
                            )}
                        </div>
                    </div>

                    {/* Highlights */}
                    <div className="bg-bg-panel rounded-3xl p-8 border border-border-soft">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-6 justify-between">
                            <span className="flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500" /> What's Working</span>
                        </h3>
                        <ul className="space-y-3">
                            {result.highlights.map((h, i) => (
                                <li key={i} className="flex gap-3 text-sm text-text-muted items-start">
                                    <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                                    <span>{h}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column - Sector Breakdown */}
                <div className="col-span-12 lg:col-span-5">
                    <div className="bg-bg-panel rounded-3xl p-8 border border-border-soft h-full">
                        <h3 className="text-lg font-bold text-text-main flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-cta" /> Sector Strategy
                        </h3>
                        <div className="space-y-5">
                            {result.sectorAnalysis.map((sec, i) => (
                                <div key={i} className="border-b border-border-soft last:border-0 pb-5 last:pb-0">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="font-bold text-text-main text-sm">{sec.sector}</span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${sec.status.toLowerCase() === 'overweight' ? 'bg-danger/10 text-danger' : sec.status.toLowerCase() === 'underweight' ? 'bg-orange-500/10 text-orange-500' : 'bg-secondary/10 text-secondary'}`}>
                                            {sec.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-muted leading-relaxed">{sec.suggestion}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end pt-4">
               <button onClick={onReset} className="px-6 py-3 bg-bg-panel border border-border-soft rounded-xl text-sm font-bold text-text-muted hover:text-text-main hover:bg-bg-main transition-all">
                    Upload New Portfolio
               </button>
            </div>
        </div>
    );
}
