"use client";

import { useState, useEffect } from "react";
import { Target, Search, RefreshCw } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MarketService } from "@/services/MarketService";

export function PositionSizer({ onExecute }: { onExecute?: (data: any) => void }) {
    const [market, setMarket] = useState("NSE");
    const [segment, setSegment] = useState("NSE_EQ");
    const [product, setProduct] = useState("INTRADAY");
    const [direction, setDirection] = useState("LONG");
    const [symbol, setSymbol] = useState("");
    const [qty, setQty] = useState<number | "">("");
    const [entry, setEntry] = useState<number | "">("");
    const [sl, setSl] = useState<number | "">("");
    const [target, setTarget] = useState<number | "">("");
    const [lotSize, setLotSize] = useState<number>(1);

    const [margin, setMargin] = useState(0);
    const [risk, setRisk] = useState(0);
    const [reward, setReward] = useState(0);
    const [rr, setRr] = useState(0);
    const [netProfit, setNetProfit] = useState(0);
    const [stocks, setStocks] = useState<any[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFetchingPrice, setIsFetchingPrice] = useState(false);
    const [priceSource, setPriceSource] = useState<string>("");
    const [priceFreshness, setPriceFreshness] = useState<"LIVE" | "DELAYED" | "IDLE">("IDLE");

    const { currency, setCurrency, triggerReset } = useApp();

    useEffect(() => {
        fetch('/data/equities.json')
            .then(res => res.json())
            .then(data => setStocks(data))
            .catch(err => console.error("Failed to load symbols:", err));
    }, []);

    useEffect(() => {
        if (symbol.length > 0) {
            let filtered = [];

            if (market === "INDIAN_EQUITIES") {
                filtered = stocks.filter(s =>
                    (s.symbol.toLowerCase().includes(symbol.toLowerCase()) || s.name.toLowerCase().includes(symbol.toLowerCase())) &&
                    !s.symbol.includes("US:")
                );
            } else if (market === "US_EQ") {
                const usStocks = [
                    { symbol: "AAPL", name: "Apple Inc." },
                    { symbol: "GOOGL", name: "Alphabet Inc." },
                    { symbol: "MSFT", name: "Microsoft Corporation" },
                    { symbol: "TSLA", name: "Tesla, Inc." },
                    { symbol: "NVDA", name: "NVIDIA Corporation" },
                    { symbol: "AMZN", name: "Amazon.com, Inc." },
                    { symbol: "META", name: "Meta Platforms, Inc." },
                    { symbol: "NFLX", name: "Netflix, Inc." }
                ];
                filtered = usStocks.filter(s =>
                    s.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                    s.name.toLowerCase().includes(symbol.toLowerCase())
                );
            } else if (market === "COMMODITIES") {
                const commodities = [
                    { symbol: "XAUUSD", name: "Gold Spot / US Dollar" },
                    { symbol: "XAGUSD", name: "Silver Spot / US Dollar" },
                    { symbol: "COPPER", name: "Copper Spot" },
                    { symbol: "ZINC", name: "Zinc Spot" },
                    { symbol: "CRUDEOIL", name: "WTI Crude Oil" },
                    { symbol: "NATURALGAS", name: "Natural Gas Spot" }
                ];
                filtered = commodities.filter(c =>
                    c.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                    c.name.toLowerCase().includes(symbol.toLowerCase())
                );
            } else if (market === "FOREX") {
                const forex = [
                    { symbol: "EURUSD", name: "Euro / US Dollar" },
                    { symbol: "GBPUSD", name: "British Pound / US Dollar" },
                    { symbol: "USDJPY", name: "US Dollar / Japanese Yen" },
                    { symbol: "AUDUSD", name: "Australian Dollar / US Dollar" },
                    { symbol: "USDCAD", name: "US Dollar / Canadian Dollar" }
                ];
                filtered = forex.filter(f =>
                    f.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                    f.name.toLowerCase().includes(symbol.toLowerCase())
                );
            } else if (market === "CRYPTO") {
                const cryptos = [
                    { symbol: "BTC", name: "Bitcoin" },
                    { symbol: "ETH", name: "Ethereum" },
                    { symbol: "SOL", name: "Solana" }
                ];
                filtered = cryptos.filter(c => c.symbol.toLowerCase().includes(symbol.toLowerCase()));
            }

            setFilteredStocks(filtered.slice(0, 10));
            setShowDropdown(filtered.length > 0);
        } else {
            setShowDropdown(false);
        }
    }, [symbol, stocks, market]);

    // Market Switch Reset & Currency Sync
    useEffect(() => {
        if (market) {
            console.log(`[PositionSizer] Market switched to ${market}. Syncing currency...`);

            // Sync Global Currency
            if (market === "US_EQ" || market === "CRYPTO" || market === "FOREX" || market === "COMMODITIES") {
                setCurrency("$");
            } else {
                setCurrency("₹");
            }

            setSymbol("");
            setQty("");
            setEntry("");
            setSl("");
            setTarget("");
            setNetProfit(0);
            setPriceFreshness("IDLE");
            triggerReset();
        }
    }, [market]);

    // Auto-fetch price when symbol is selected
    useEffect(() => {
        if (symbol && symbol.length > 2) {
            handleFetchPrice();
        }
    }, [symbol]);

    const handleFetchPrice = async () => {
        setIsFetchingPrice(true);
        try {
            // Normalize market for service
            const serviceMarket = market === "INDIAN_EQUITIES" ? "NSE" : market;
            const result = await MarketService.fetchPrice(symbol, serviceMarket);
            if (result) {
                setEntry(result.price);
                // If the provider specifically indicates it's a live fetch, mark it LIVE
                setPriceFreshness(result.provider === "Binance" || result.provider === "Finnhub" ? "LIVE" : "DELAYED");
            }
        } catch (err) {
            console.error("Fetch price failed", err);
            setPriceFreshness("IDLE");
        } finally {
            setIsFetchingPrice(false);
        }
    };

    useEffect(() => {
        // Math Core
        const numQty = Number(qty) || 0;
        const numEntry = Number(entry) || 0;
        const numSl = Number(sl) || 0;
        const numTarget = Number(target) || 0;

        if (!numQty || !numEntry || !numSl) {
            setMargin(0); setRisk(0); setReward(0); setRr(0); setNetProfit(0);
            return;
        }

        const actualQty = numQty * (segment === "NSE_FNO" ? lotSize : 1);

        let riskPerShare = direction === "LONG" ? (numEntry - numSl) : (numSl - numEntry);
        let rewardPerShare = direction === "LONG" ? (numTarget - numEntry) : (numEntry - numTarget);

        if (riskPerShare < 0) riskPerShare = Math.abs(riskPerShare);
        if (rewardPerShare < 0) rewardPerShare = 0;

        let positionValue = actualQty * numEntry;
        if (segment === "NSE_EQ" && product === "INTRADAY") positionValue /= 5;

        const actualRisk = actualQty * riskPerShare;
        const totalReward = actualQty * rewardPerShare;
        const ratio = riskPerShare > 0 ? (rewardPerShare / riskPerShare) : 0;

        const turnover = (numEntry * actualQty) + (numTarget * actualQty);
        let estBrokerage = 0, estSTT = 0, estExchange = 0;

        if (market === "INDIAN_EQUITIES") {
            estBrokerage = Math.min(20, numEntry * actualQty * 0.0003) + Math.min(20, numTarget * actualQty * 0.0003);
            estSTT = numTarget * actualQty * 0.00025;
            estExchange = turnover * 0.0000325;
        } else if (market === "US_EQ") {
            estBrokerage = Math.max(1, actualQty * 0.005) * 2;
            estSTT = turnover * 0.0000229;
        } else {
            estBrokerage = turnover * 0.001;
        }

        const totalEstCost = estBrokerage + estSTT + estExchange;

        setMargin(positionValue);
        setRisk(actualRisk);
        setReward(totalReward);
        setRr(ratio);
        setNetProfit(Math.max(0, totalReward - totalEstCost));

    }, [market, segment, product, direction, qty, entry, sl, target, lotSize]);

    // Format currency based on locale
    const fmt = (val: number) => {
        const locale = currency === "$" ? "en-US" : "en-IN";
        return val.toLocaleString(locale, {
            maximumFractionDigits: market === "CRYPTO" ? 4 : 2,
            minimumFractionDigits: 2
        });
    };

    return (
        <div className="flex-1 bg-bg-panel border border-border-soft rounded-2xl p-8 shadow-soft flex flex-col transition-all">
            <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-3 text-text-main mb-2">
                    <Target className="w-5 h-5 text-cta" /> Position Sizer
                </h2>
                <p className="text-sm text-text-muted">Enter parameters to visualize risk/reward.</p>
            </div>

            <div className="grid grid-cols-12 gap-4 mb-8">
                {/* Row 1 */}
                <div className="col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Market</label>
                    <select value={market} onChange={e => setMarket(e.target.value)} className="p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all">
                        <option value="INDIAN_EQUITIES">Indian Equities (NSE/BSE)</option>
                        <option value="US_EQ">US Stocks (NYSE/NAS)</option>
                        <option value="CRYPTO">Crypto (USD)</option>
                        <option value="FOREX">Forex</option>
                        <option value="COMMODITIES">Commodities</option>
                    </select>
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Segment</label>
                    <select value={segment} onChange={e => setSegment(e.target.value)} className="p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all">
                        <option value="NSE_EQ">Equity</option>
                        <option value="NSE_FNO">F&O / Options</option>
                    </select>
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Product</label>
                    <select value={product} onChange={e => setProduct(e.target.value)} className="p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all">
                        <option value="INTRADAY">Intraday</option>
                        <option value="MARGIN">Swing</option>
                    </select>
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Setup</label>
                    <select value={direction} onChange={e => setDirection(e.target.value)} className="p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all">
                        <option value="LONG">Long (Buy)</option>
                        <option value="SHORT">Short (Sell)</option>
                    </select>
                </div>

                {/* Row 2: Search */}
                <div className="col-span-12 flex flex-col gap-2 relative">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Symbol</label>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Search for a stock..."
                            value={symbol}
                            onChange={e => setSymbol(e.target.value)}
                            onFocus={() => symbol.length > 1 && setShowDropdown(true)}
                            className="p-3 pr-10 bg-bg-main border border-transparent focus:border-cta rounded-xl w-full outline-none transition-all"
                        />
                        <Search className="w-4 h-4 text-text-muted absolute right-4 pointer-events-none" />

                        {showDropdown && filteredStocks.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-panel border border-border-soft rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                {filteredStocks.map((s, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setSymbol(s.symbol);
                                            setShowDropdown(false);
                                        }}
                                        className="p-3 hover:bg-bg-main cursor-pointer flex justify-between items-center border-b border-border-soft/30 last:border-0"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{s.symbol}</span>
                                            <span className="text-[10px] text-text-muted">{s.name}</span>
                                        </div>
                                        <span className="text-[10px] bg-cta/10 text-cta px-2 py-0.5 rounded font-bold">
                                            {market === "INDIAN_EQUITIES" ? "NSE" :
                                                market === "US_EQ" ? "NASDAQ" :
                                                    market === "COMMODITIES" ? "GLOBAL" :
                                                        market === "FOREX" ? "OANDA" : market}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 3: Math */}
                <div className="col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Qty</label>
                    <input type="number" placeholder="100" value={qty} onChange={e => setQty(Number(e.target.value) || "")} className="p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all" />
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted flex justify-between items-center">
                        CMP ({currency})
                        {isFetchingPrice ? (
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-cta" />
                        ) : (
                            <span className="text-[10px] text-cta/70 font-bold">{priceSource}</span>
                        )}
                    </label>
                    <div className="relative group">
                        <input
                            type="number"
                            value={entry}
                            onChange={e => setEntry(Number(e.target.value))}
                            className={`w-full p-4 bg-bg-main border-2 ${priceFreshness === "LIVE" ? "border-green-500/30" : priceFreshness === "DELAYED" ? "border-amber-500/30" : "border-transparent"} focus:border-cta rounded-2xl outline-none transition-all text-xl font-bold`}
                            placeholder="0.00"
                        />
                        {priceFreshness !== "IDLE" && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${priceFreshness === "LIVE" ? "bg-green-500" : "bg-amber-500"}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${priceFreshness === "LIVE" ? "text-green-500" : "text-amber-500"}`}>
                                    {priceFreshness === "LIVE" ? "Live" : "Delayed"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Stop Loss ({currency})</label>
                    <input type="number" placeholder="0.00" value={sl} onChange={e => setSl(Number(e.target.value) || "")} className="p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all" />
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">Target ({currency})</label>
                    <input type="number" placeholder="0.00" value={target} onChange={e => setTarget(Number(e.target.value) || "")} className="p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-bg-main p-4 rounded-xl flex flex-col border border-border-soft">
                    <span className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-1">Capital Req</span>
                    <span className="text-lg font-bold text-text-main">{currency}{fmt(margin)}</span>
                </div>
                <div className="bg-bg-main p-4 rounded-xl flex flex-col border border-border-soft">
                    <span className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-1">Risk</span>
                    <span className="text-lg font-bold text-danger">{currency}{fmt(risk)}</span>
                </div>
                <div className="bg-[#A8D5BA]/10 p-4 rounded-xl flex flex-col border border-secondary/30">
                    <span className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-1">Reward</span>
                    <span className="text-lg font-bold text-secondary">{currency}{fmt(reward)}</span>
                </div>
                <div className="bg-bg-main p-4 rounded-xl flex flex-col border border-border-soft">
                    <span className="text-xs uppercase font-semibold text-text-muted tracking-wider mb-1">R:R</span>
                    <span className="text-lg font-bold text-text-main">1 : {rr.toFixed(2)}</span>
                </div>

                <div className={`col-span-4 p-6 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 border
          ${netProfit > 0 && Number(qty) > 0 && Number(sl) > 0 ? "bg-gradient-to-br from-[#00b894] via-[#00cec9] to-[#0984e3] border-transparent shadow-[0_10px_40px_rgba(0,184,148,0.3)] scale-[1.02]" : "bg-bg-main border-border-soft"}`}>
                    <span className={`text-[10px] uppercase font-bold tracking-[2px] mb-1 ${netProfit > 0 && Number(qty) > 0 && Number(sl) > 0 ? "text-white/90" : "text-text-muted"}`}>✨ Estimated Net Profit ✨</span>
                    <span className={`text-3xl font-bold ${netProfit > 0 && Number(qty) > 0 && Number(sl) > 0 ? "text-white drop-shadow-md" : "text-text-main"}`}>
                        {currency}{fmt(netProfit)}
                    </span>
                </div>
            </div>

            <button
                onClick={() => onExecute && onExecute({ symbol, qty, entry, sl, target, market, direction, netProfit })}
                disabled={!symbol || !qty || !entry}
                className="w-full max-w-md mx-auto h-14 bg-cta hover:bg-cta-hover text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Execute Trade
            </button>

        </div>
    );
}
