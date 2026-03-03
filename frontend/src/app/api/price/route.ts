import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side price proxy route.
 * Why: Yahoo Finance / Binance APIs have CORS restrictions.
 * This route runs on the server, fetches the price, and returns JSON.
 * 
 * Failsafe chain: Yahoo Finance → Binance → Google Finance fallback
 */

interface PriceResponse {
    price: number;
    provider: string;
    symbol: string;
}

// Map market+symbol → Yahoo Finance symbol format
function toYahooSymbol(symbol: string, market: string): string {
    switch (market) {
        case "NSE":
        case "INDIAN_EQUITIES":
            return `${symbol}.NS`;
        case "BSE":
            return `${symbol}.BO`;
        case "CRYPTO":
            return `${symbol}-USD`;
        case "FOREX":
            return `${symbol}=X`;
        default:
            return symbol; // US stocks use raw symbol
    }
}

// Provider 1: Yahoo Finance (works for all markets)
async function fetchYahoo(symbol: string, market: string): Promise<number | null> {
    try {
        const ySymbol = toYahooSymbol(symbol, market);
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ySymbol)}?interval=1d&range=1d`;

        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) return null;
        const data = await res.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        return price && price > 0 ? price : null;
    } catch {
        return null;
    }
}

// Provider 2: Binance (crypto only)
async function fetchBinance(symbol: string): Promise<number | null> {
    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`, {
            signal: AbortSignal.timeout(3000),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return parseFloat(data.price) || null;
    } catch {
        return null;
    }
}

// Provider 3: CoinGecko (crypto fallback)
async function fetchCoinGecko(symbol: string): Promise<number | null> {
    try {
        const coinMap: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "ripple", ADA: "cardano", DOT: "polkadot", DOGE: "dogecoin" };
        const coinId = coinMap[symbol.toUpperCase()];
        if (!coinId) return null;
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data[coinId]?.usd || null;
    } catch {
        return null;
    }
}

// Provider 4: Finnhub (US equities fallback)
async function fetchFinnhub(symbol: string): Promise<number | null> {
    try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=sandbox_c8lsv2aad3i8dq4q8v0g`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.c && data.c > 0 ? data.c : null;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const market = searchParams.get("market") || "NSE";

    if (!symbol) {
        return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
    }

    // Build provider chain based on market
    const providers: { name: string; fetcher: () => Promise<number | null> }[] = [];

    // Yahoo Finance works for everything - always first
    providers.push({ name: "Yahoo Finance", fetcher: () => fetchYahoo(symbol, market) });

    if (market === "CRYPTO") {
        providers.push({ name: "Binance", fetcher: () => fetchBinance(symbol) });
        providers.push({ name: "CoinGecko", fetcher: () => fetchCoinGecko(symbol) });
    } else {
        providers.push({ name: "Finnhub", fetcher: () => fetchFinnhub(symbol) });
    }

    // Try each provider in sequence (failsafe chain)
    for (const provider of providers) {
        try {
            console.log(`[PriceAPI] Trying ${provider.name} for ${symbol}...`);
            const price = await provider.fetcher();
            if (price && price > 0) {
                console.log(`[PriceAPI] ✅ ${provider.name} returned ${price} for ${symbol}`);
                return NextResponse.json({ price, provider: provider.name, symbol } satisfies PriceResponse);
            }
        } catch (err) {
            console.warn(`[PriceAPI] ❌ ${provider.name} failed:`, err);
        }
    }

    return NextResponse.json({ error: `No price available for ${symbol}`, symbol }, { status: 404 });
}
