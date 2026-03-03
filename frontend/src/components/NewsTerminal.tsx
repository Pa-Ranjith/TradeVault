"use client";

import { useState, useEffect } from "react";
import { Globe, RefreshCw } from "lucide-react";
import Image from "next/image";

export function NewsTerminal() {
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const initialNews = [
        { id: 1, title: "Federal Reserve hints at potential rate cuts in late 2026 amid cooling inflation", time: "10m ago", source: "Reuters", tag: "MACRO", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400" },
        { id: 2, title: "Tech giants surge as AI hardware demand outpaces supply chains", time: "45m ago", source: "Bloomberg", tag: "TECH", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400" },
        { id: 3, title: "Oil prices stabilize after inventory reports show unexpected drawdowns", time: "1h ago", source: "CNBC", tag: "COMMODITIES", image: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=400" },
        { id: 4, title: "Asian markets open mixed as investors digest latest manufacturing data", time: "2h ago", source: "WSJ", tag: "GLOBAL", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=400" },
        { id: 5, title: "Retail sales beat expectations despite lingering consumer sentiment concerns", time: "3h ago", source: "FT", tag: "RETAIL", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400" }
    ];

    const [newsData, setNewsData] = useState(initialNews);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Refreshing News Terminal...");
            // Simulate an update by updating lastUpdated and slightly shuffling/refreshing data
            setLastUpdated(new Date());
            setNewsData(prev => [...prev].sort(() => Math.random() - 0.5));
        }, 180000); // 3 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-bg-panel border border-border-soft rounded-2xl shadow-soft flex flex-col transition-all overflow-hidden h-full relative">
            <div className="flex justify-between items-center p-6 pb-4 bg-bg-panel z-10 sticky top-0 border-b border-border-soft/50">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-text-main">
                        <Globe className="w-5 h-5 text-primary" /> Market Updates
                    </h2>
                    <span className="text-[10px] text-text-muted flex items-center gap-1 font-medium italic">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                        Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest animate-pulse">LIVE FEED</div>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto min-h-0 p-4 custom-scrollbar">
                {newsData.map((news) => (
                    <div
                        key={news.id}
                        onMouseEnter={() => setHoveredId(news.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col
              ${hoveredId === news.id ? "bg-bg-main border-primary/50 shadow-md transform -translate-y-1" : "bg-bg-main/50 border-border-soft"}`}
                    >
                        <div className="relative w-full h-[140px] overflow-hidden">
                            <Image
                                src={news.image}
                                alt={news.title}
                                fill
                                className={`object-cover transition-transform duration-500 ${hoveredId === news.id ? "scale-110" : "scale-100"}`}
                            />
                            <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded uppercase tracking-wider">{news.tag}</span>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <span className="text-xs text-text-muted font-medium mb-2">{news.time}</span>
                            <h3 className={`text-sm font-semibold line-clamp-2 leading-snug transition-colors mb-3 ${hoveredId === news.id ? "text-primary" : "text-text-main"}`}>
                                {news.title}
                            </h3>
                            <div className="mt-auto flex justify-between items-center text-[10px] font-bold text-text-muted">
                                <span>{news.source}</span>
                                <span className={`transition-opacity ${hoveredId === news.id ? "opacity-100 text-primary" : "opacity-0"}`}>Read Story {'->'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-bg-panel border-t border-border-soft text-center text-[10px] text-text-muted font-bold tracking-wider z-10">
                POWERED BY FINNHUB
            </div>
        </div>
    );
}
