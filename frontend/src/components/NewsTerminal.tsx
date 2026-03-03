"use client";

import { useState, useEffect, useCallback } from "react";
import { Globe, RefreshCw, ExternalLink } from "lucide-react";

interface NewsArticle {
    id: number;
    title: string;
    url: string;
    image: string;
    source: string;
    category: string;
    freshness: string;
}

const CAT_COLORS: Record<string, string> = {
    MACRO: "bg-blue-500/20 text-blue-400",
    POLITICS: "bg-purple-500/20 text-purple-400",
    TECH: "bg-cyan-500/20 text-cyan-400",
    COMMODITIES: "bg-amber-500/20 text-amber-400",
    CRYPTO: "bg-orange-500/20 text-orange-400",
    FINANCE: "bg-emerald-500/20 text-emerald-400",
    EARNINGS: "bg-green-500/20 text-green-400",
    BUSINESS: "bg-slate-500/20 text-slate-400",
};

export function NewsTerminal() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/news");
            if (res.ok) {
                const data = await res.json();
                if (data.articles) setArticles(data.articles.slice(0, 10));
            }
        } catch (e) {
            console.error("[NewsTerminal] Fetch failed:", e);
        } finally {
            setLoading(false);
            setLastUpdated(new Date());
        }
    }, []);

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 180000);
        return () => clearInterval(interval);
    }, [fetchNews]);

    return (
        <div className="bg-bg-panel border border-border-soft rounded-2xl shadow-soft flex flex-col transition-all overflow-hidden h-full">
            {/* Compact Header */}
            <div className="flex justify-between items-center px-4 py-2.5 border-b border-border-soft/50 shrink-0">
                <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-semibold text-text-main">Market Updates</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <RefreshCw className={`w-2 h-2 ${loading ? 'animate-spin' : ''}`} />
                        {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="bg-danger/10 text-danger px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest animate-pulse">LIVE</div>
                </div>
            </div>

            {/* Compact horizontal news cards — scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                {articles.map((a) => (
                    <a
                        key={a.id}
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 px-3 py-2.5 border-b border-border-soft/30 hover:bg-bg-main/50 transition-colors group cursor-pointer"
                    >
                        {/* Thumbnail — small square */}
                        {a.image && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-bg-main">
                                <img
                                    src={a.image}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            {/* Top row: category + freshness */}
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none ${CAT_COLORS[a.category] || CAT_COLORS.BUSINESS}`}>
                                    {a.category}
                                </span>
                                <span className="text-[10px] text-text-muted tabular-nums">{a.freshness}</span>
                            </div>

                            {/* Title — 2 lines max */}
                            <h3 className="text-xs font-semibold line-clamp-2 leading-snug text-text-main group-hover:text-primary transition-colors">
                                {a.title}
                            </h3>

                            {/* Source + CTA */}
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-text-muted font-medium">{a.source}</span>
                                <span className="text-[10px] font-bold text-cta opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                    Read <ExternalLink className="w-2 h-2" />
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
