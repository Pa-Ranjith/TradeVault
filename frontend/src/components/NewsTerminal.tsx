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

// Category color map
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
                if (data.articles) {
                    setArticles(data.articles.slice(0, 10));
                }
            }
        } catch (e) {
            console.error("[NewsTerminal] Fetch failed:", e);
        } finally {
            setLoading(false);
            setLastUpdated(new Date());
        }
    }, []);

    // Initial load + auto-refresh every 3 minutes
    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 180000);
        return () => clearInterval(interval);
    }, [fetchNews]);

    return (
        <div className="bg-bg-panel border border-border-soft rounded-2xl shadow-soft flex flex-col transition-all overflow-hidden h-full relative">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-3 bg-bg-panel z-10 sticky top-0 border-b border-border-soft/50">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold text-text-main">Market Updates</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-text-muted flex items-center gap-1 font-medium">
                        <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
                        {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="bg-danger/10 text-danger border border-danger/20 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest animate-pulse">
                        LIVE
                    </div>
                </div>
            </div>

            {/* News Cards — scrollable */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0 p-3 custom-scrollbar">
                {articles.length === 0 && !loading && (
                    <div className="text-center text-sm text-text-muted py-8 italic">No news available</div>
                )}
                {articles.map((article) => (
                    <a
                        key={article.id}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-xl border border-border-soft bg-bg-main/50 hover:bg-bg-main hover:border-primary/30 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer block"
                    >
                        {/* Top bar: Category (left) + Freshness (right) */}
                        <div className="flex justify-between items-center px-3 pt-2.5 pb-1">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${CAT_COLORS[article.category] || CAT_COLORS.BUSINESS}`}>
                                {article.category}
                            </span>
                            <span className="text-[9px] text-text-muted font-medium tabular-nums">
                                {article.freshness}
                            </span>
                        </div>

                        {/* Thumbnail */}
                        {article.image && (
                            <div className="relative w-full h-[100px] mx-3 mt-1 overflow-hidden rounded-lg" style={{ width: 'calc(100% - 24px)' }}>
                                <img
                                    src={article.image}
                                    alt=""
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}

                        {/* Title + CTA */}
                        <div className="px-3 pt-2 pb-3">
                            <h3 className="text-xs font-semibold line-clamp-2 leading-relaxed text-text-main group-hover:text-primary transition-colors">
                                {article.title}
                            </h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[9px] text-text-muted font-medium">{article.source}</span>
                                <span className="text-[9px] font-bold text-cta opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    Read More <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
