/**
 * Failsafe Market Service
 * Implements multiple API fallbacks for real-time price fetching.
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
     * Fetches price with multiple fallbacks
     */
    async fetchPrice(symbol: string, market: string): Promise<PriceResult | null> {
        const cacheKey = `${market}:${symbol}`;

        // Check cache
        if (priceCache[cacheKey] && (Date.now() - priceCache[cacheKey].timestamp < CACHE_DURATION)) {
            console.log(`[MarketService] Using cached price for ${symbol}`);
            return priceCache[cacheKey];
        }

        const providers = this.getProviders(market, symbol);

        for (const provider of providers) {
            try {
                console.log(`[MarketService] Trying provider: ${provider.name} for ${symbol}`);
                const price = await provider.fetcher();
                if (price && price > 0) {
                    const result = { price, provider: provider.name, timestamp: Date.now() };
                    priceCache[cacheKey] = result;
                    return result;
                }
            } catch (err) {
                console.warn(`[MarketService] Provider ${provider.name} failed:`, err);
            }
        }

        return null;
    },

    getProviders(market: string, symbol: string) {
        const providers = [
            // 1. Finnhub (Best for US/Global)
            {
                name: "Finnhub",
                fetcher: async () => {
                    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=sandbox_c8lsv2aad3i8dq4q8v0g`);
                    const data = await res.json();
                    return data.c;
                }
            },
            // 2. Alpha Vantage (Forex/US)
            {
                name: "AlphaVantage",
                fetcher: async () => {
                    const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`);
                    const data = await res.json();
                    return parseFloat(data["Global Quote"]?.["05. price"]);
                }
            },
            // 3. Binance Public API (Crypto)
            {
                name: "Binance",
                fetcher: async () => {
                    if (market !== "CRYPTO") return null;
                    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
                    const data = await res.json();
                    return parseFloat(data.price);
                }
            },
            // 4. CryptoWatch (Crypto)
            {
                name: "CryptoWatch",
                fetcher: async () => {
                    if (market !== "CRYPTO") return null;
                    const res = await fetch(`https://api.cryptowat.ch/markets/binance/${symbol.toLowerCase()}usdt/price`);
                    const data = await res.json();
                    return data.result.price;
                }
            },
            // 5. Polygon.io Mock/Fallback
            {
                name: "Polygon.io",
                fetcher: async () => {
                    // Placeholder for real logic
                    return null;
                }
            }
        ];

        return providers;
    }
};
