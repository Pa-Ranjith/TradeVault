"use client";

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    snippet: string;
}

export interface SentinelNarrative {
    symbol: string;
    story: string;
    sentimentScore: number; // -100 to 100
    sentimentLabel: "BULLISH" | "BEARISH" | "NEUTRAL" | "EXTREMELY BULLISH" | "EXTREMELY BEARISH";
    confidence: number;
    sources: NewsItem[];
    globalCues: string[];
}

export const SentinelService = {
    // 5+ Free News Source Interfaces
    SOURCES: {
        MONEYCONTROL: { name: "MoneyControl", type: "Sitemap/RSS", weight: 1.2 },
        YAHOO: { name: "Yahoo Finance", type: "RSS", weight: 1.0 },
        INVESTING: { name: "Investing.com", type: "RSS", weight: 1.1 },
        ECON_TIMES: { name: "Economic Times", type: "RSS", weight: 1.0 },
        GOOGLE_NEWS: { name: "Google News", type: "Search RSS", weight: 0.9 }
    },

    /**
     * Aggregates news from 5 distinct sources.
     * In a real production app, this would use a fetch-proxy to parse XML from all endpoints.
     */
    async fetchMultiSourceNews(symbol: string): Promise<NewsItem[]> {
        const symbolEncoded = encodeURIComponent(symbol);
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const mockNews: NewsItem[] = [
            {
                title: `${symbol} - Technical Structure & Delivery Volume Analysis`,
                link: `https://www.moneycontrol.com/news/common-search-result.php?q=${symbolEncoded}`,
                pubDate: tenDaysAgo.toISOString(),
                source: "MoneyControl",
                snippet: `Analysis of delivery percentages and historical price action for ${symbol} over the last fortnight.`
            },
            {
                title: `${symbol} (NSE) - Breaking Institutional Sentiment`,
                link: `https://finance.yahoo.com/quote/${symbolEncoded}/news`,
                pubDate: new Date().toISOString(),
                source: "Yahoo Finance",
                snippet: `Recent fund manager commentary and institutional holdings update for ${symbol}.`
            },
            {
                title: `${symbol} Search: Global Peer Comparison & Valuation`,
                link: `https://www.investing.com/search/?q=${symbolEncoded}&tab=news`,
                pubDate: new Date().toISOString(),
                source: "Investing.com",
                snippet: `Valuation metrics and relative strength index (RSI) comparison for ${symbol} against its sector.`
            },
            {
                title: `${symbol} - Industry Policy & Sectoral Tailwinds`,
                link: `https://economictimes.indiatimes.com/topic/${symbolEncoded}/news`,
                pubDate: new Date().toISOString(),
                source: "Economic Times",
                snippet: `Deep dive into regulatory shifts affecting the ${symbol} ecosystem and projected CAGR.`
            },
            {
                title: `Global Sentiment Probe: ${symbol} Awareness`,
                link: `https://news.google.com/search?q=${symbolEncoded}+stock+news`,
                pubDate: new Date().toISOString(),
                source: "Google News",
                snippet: `Real-time search trends and social media sentiment clusters for ${symbol}.`
            }
        ];
        return mockNews;
    },

    /**
     * Synchronizes and synthesizes multiple news items into a best-possible output.
     */
    synthesizeConsolidatedNarrative(symbol: string, news: NewsItem[]): SentinelNarrative {
        const sourceNames = news.map(n => n.source);
        const uniqueSources = [...new Set(sourceNames)];

        // Sentiment Scoring Logic (Simulation)
        // In reality, this would use NLP to score each title/snippet
        let score = 78; // Base bullish score for this example

        const sentimentLabel = score > 80 ? "EXTREMELY BULLISH" :
            score > 30 ? "BULLISH" :
                score < -80 ? "EXTREMELY BEARISH" :
                    score < -30 ? "BEARISH" : "NEUTRAL";

        // Highly Granular Technical Narration
        const story = `The technical structure of ${symbol} suggests a persistent momentum profile, 
            underscored by a cluster of institutional buying over the last session. 
            Price action is currently consolidating above a major volume-weighted support zone, 
            with the Relative Strength Index (RSI) indicating a disciplined accumulation phase. 
            While earlier reports from ${news[0].source} focused on historical delivery metrics, 
            the current trajectory is being reshaped by the sectoral tailwinds identified by 
            ${news[3].source}. This rare convergence of favorable governance, regulatory easing, 
            and a breakout in social awareness suggests that ${symbol} is detaching from 
            broader index volatility to pursue its own intrinsic value gaps. Traders should 
            monitor the current pivot point, as the buildup in high-conviction delivery 
            volume signals a potential trend continuation regardless of 10-day historical noise.`;

        return {
            symbol,
            story: story.replace(/\s+/g, ' ').trim(),
            sentimentScore: score,
            sentimentLabel,
            confidence: 91,
            sources: news,
            globalCues: [
                "Domestic Institutional Buying (DII) remains aggressive",
                "Positive Sectoral Rotation in Indian Equities",
                "Fed Policy stability providing US market support",
                "High Relative Strength Index (RSI) against Benchmark",
                "Decreasing raw material costs due to global easing"
            ]
        };
    }
};
