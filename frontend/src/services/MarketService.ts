/**
 * Failsafe Market Service v2
 * Uses the Next.js API route (/api/price) as a server-side proxy.
 * This avoids CORS issues and provides a multi-provider failsafe chain.
 */

interface PriceResult {
    price: number;
    provider: string;
    timestamp: number;
}

const CACHE_DURATION = 60000; // 1 minute cache
const priceCache: Record<string, PriceResult> = {};

export const MarketService = {
    /**
     * Fetches price via our server-side proxy with built-in failsafe.
     * Chain: Yahoo Finance → Binance/Finnhub → CoinGecko
     */
    async fetchPrice(symbol: string, market: string): Promise<PriceResult | null> {
        const cacheKey = `${market}:${symbol}`;

        // Check cache first (1 minute TTL)
        if (priceCache[cacheKey] && (Date.now() - priceCache[cacheKey].timestamp < CACHE_DURATION)) {
            console.log(`[MarketService] Cache hit for ${symbol}`);
            return priceCache[cacheKey];
        }

        try {
            console.log(`[MarketService] Fetching price for ${symbol} (${market})...`);
            const res = await fetch(`/api/price?symbol=${encodeURIComponent(symbol)}&market=${encodeURIComponent(market)}`);

            if (!res.ok) {
                console.warn(`[MarketService] API returned ${res.status} for ${symbol}`);
                return null;
            }

            const data = await res.json();

            if (data.price && data.price > 0) {
                const result: PriceResult = {
                    price: data.price,
                    provider: data.provider,
                    timestamp: Date.now()
                };
                priceCache[cacheKey] = result;
                console.log(`[MarketService] ✅ ${data.provider}: ${symbol} = ${data.price}`);
                return result;
            }
        } catch (err) {
            console.error(`[MarketService] Failed to fetch ${symbol}:`, err);
        }

        return null;
    }
};
