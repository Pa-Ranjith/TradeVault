"use client";

import { useState, useEffect } from "react";
import { Target, Search, RefreshCw, Tag } from "lucide-react";

const TRADE_TAGS = [
    { id: "rate_hike", label: "#InterestRateHike" },
    { id: "rate_cut", label: "#RateCut" },
    { id: "earnings", label: "#EarningsSeason" },
    { id: "geopolitical", label: "#Geopolitical" },
    { id: "inflation", label: "#InflationData" },
    { id: "gdp", label: "#GDPReport" },
    { id: "breakout", label: "#Breakout" },
    { id: "momentum", label: "#Momentum" },
    { id: "reversal", label: "#Reversal" },
    { id: "support_resistance", label: "#SupportResistance" },
    { id: "news_driven", label: "#NewsDriven" },
    { id: "sector_rotation", label: "#SectorRotation" },
    { id: "fii_dii", label: "#FII_DII_Flow" },
    { id: "budget", label: "#BudgetImpact" },
    { id: "global_cues", label: "#GlobalCues" },
    { id: "scalp", label: "#Scalp" },
    { id: "swing", label: "#SwingTrade" },
    { id: "pattern", label: "#ChartPattern" }
];
import { useApp } from "@/context/AppContext";
import { MarketService } from "@/services/MarketService";

export function PositionSizer({ onExecute }: { onExecute?: (data: any) => void }) {
    const [market, setMarket] = useState("INDIAN_EQUITIES");
    const [segment, setSegment] = useState("NSE_EQ");
    const [product, setProduct] = useState("INTRADAY");
    const [direction, setDirection] = useState("LONG");
    const [symbol, setSymbol] = useState("");
    const [qty, setQty] = useState<number | "">("");
    const [entry, setEntry] = useState<number | "">("");
    const [sl, setSl] = useState<number | "">("");
    const [target, setTarget] = useState<number | "">("");
    const [lotSize, setLotSize] = useState<number>(1);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
    };

    const [margin, setMargin] = useState(0);
    const [risk, setRisk] = useState(0);
    const [reward, setReward] = useState(0);
    const [rr, setRr] = useState(0);
    const [netProfit, setNetProfit] = useState(0);
    const [stocks, setStocks] = useState<any[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);
    const [isFetchingPrice, setIsFetchingPrice] = useState(false);
    const [priceSource, setPriceSource] = useState<string>("");

    const { currency, setCurrency, triggerReset, guardReady } = useApp();

    // Market data stores — loaded from JSON files
    const [indianStocks, setIndianStocks] = useState<any[]>([]);
    const [usStocks, setUsStocks] = useState<any[]>([]);
    const [cryptoList, setCryptoList] = useState<any[]>([]);
    const [forexList, setForexList] = useState<any[]>([]);
    const [commoditiesList, setCommoditiesList] = useState<any[]>([]);
    const [indicesList, setIndicesList] = useState<any[]>([]);

    // Load all market data on mount
    useEffect(() => {
        const loadJson = (url: string, setter: (d: any[]) => void) =>
            fetch(url).then(r => r.json()).then(setter).catch(e => console.error(`Failed to load ${url}:`, e));

        loadJson('/data/equities.json', setIndianStocks);
        loadJson('/data/us_equities.json', setUsStocks);
        loadJson('/data/crypto.json', setCryptoList);
        loadJson('/data/forex.json', setForexList);
        loadJson('/data/commodities.json', setCommoditiesList);
        loadJson('/data/indices.json', setIndicesList);
    }, []);

    // Unified search filter across all markets
    useEffect(() => {
        if (symbol.length > 0) {
            let filtered: any[] = [];
            const q = symbol.toLowerCase();
            const matchFn = (s: any) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);

            if (market === "INDIAN_EQUITIES") {
                const matches = indianStocks.filter(s => matchFn(s) && !s.symbol.includes("US:"));
                filtered = matches.flatMap(s => [
                    { symbol: s.symbol, name: s.name, exchange: 'NSE' },
                    { symbol: s.symbol, name: s.name, exchange: 'BSE' }
                ]);
            } else if (market === "US_EQ") {
                filtered = usStocks.filter(matchFn).map(s => ({ ...s, exchange: 'NYSE/NAS' }));
            }

            setFilteredStocks(filtered.slice(0, 15));
            setShowDropdown(filtered.length > 0);
        } else {
            setFilteredStocks([]);
            setShowDropdown(false);
        }
    }, [symbol, indianStocks, usStocks, market]);

    // Market Switch Reset & Currency Sync
    useEffect(() => {
        if (market) {
            // Sync Global Currency
            if (market === "US_EQ") {
                setCurrency("$");
            } else {
                setCurrency("₹");
            }

            // Full reset on market switch
            setSymbol("");
            setQty("");
            setEntry("");
            setSl("");
            setTarget("");
            setNetProfit(0);
            setSelectedTags([]);
            setPriceSource("");
            setHighlightedIdx(-1);
            setShowDropdown(false);
            setShowTagDropdown(false);
            triggerReset();
        }
    }, [market]);

    // Auto-fetch price when symbol is selected (debounced)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (symbol && symbol.length >= 2) {
                handleFetchPrice();
            }
        }, 400); // 400ms debounce
        return () => clearTimeout(handler);
    }, [symbol]);

    const handleFetchPrice = async (overrideSymbol?: string) => {
        const symbolToFetch = overrideSymbol || symbol;
        if (!symbolToFetch || symbolToFetch.length < 2) return;

        setIsFetchingPrice(true);
        try {
            const serviceMarket = market === "INDIAN_EQUITIES" ? "NSE" : market;
            const result = await MarketService.fetchPrice(symbolToFetch, serviceMarket);
            if (result) {
                setEntry(result.price);
                setPriceSource(result.provider);
            }
        } catch (err) {
            console.error("Fetch price failed", err);
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
                            onChange={e => { setSymbol(e.target.value); setHighlightedIdx(-1); }}
                            onFocus={() => symbol.length > 1 && setShowDropdown(true)}
                            onKeyDown={e => {
                                if (!showDropdown || filteredStocks.length === 0) return;
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    setHighlightedIdx(prev => Math.min(prev + 1, filteredStocks.length - 1));
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    setHighlightedIdx(prev => Math.max(prev - 1, 0));
                                } else if (e.key === 'Enter' && highlightedIdx >= 0) {
                                    e.preventDefault();
                                    const selected = filteredStocks[highlightedIdx].symbol;
                                    setSymbol(selected);
                                    setShowDropdown(false);
                                    setHighlightedIdx(-1);
                                    handleFetchPrice(selected); // Instant local fetch
                                } else if (e.key === 'Escape') {
                                    setShowDropdown(false);
                                    setHighlightedIdx(-1);
                                }
                            }}
                            className="p-3 pr-10 bg-bg-main border border-transparent focus:border-cta rounded-xl w-full outline-none transition-all"
                        />
                        <Search className="w-4 h-4 text-text-muted absolute right-4 pointer-events-none" />

                        {showDropdown && filteredStocks.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-bg-panel border border-border-soft rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                {filteredStocks.map((s, idx) => (
                                    <div
                                        key={idx}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setSymbol(s.symbol);
                                            setShowDropdown(false);
                                            setHighlightedIdx(-1);
                                            handleFetchPrice(s.symbol); // Instant local fetch
                                        }}
                                        className={`p-3 cursor-pointer flex justify-between items-center border-b border-border-soft/30 last:border-0 transition-colors
                                            ${idx === highlightedIdx ? 'bg-cta/10 border-l-2 border-l-cta' : 'hover:bg-bg-main'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{s.symbol}</span>
                                            <span className="text-[10px] text-text-muted">{s.name}</span>
                                        </div>
                                        <span className="text-[10px] bg-cta/10 text-cta px-2 py-0.5 rounded font-bold">
                                            {s.exchange ? s.exchange :
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
                        <span className="flex items-center gap-1.5">
                            CMP ({currency})
                            {priceSource && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
                        </span>
                        {isFetchingPrice ? (
                            <RefreshCw className="w-2.5 h-2.5 animate-spin text-cta" />
                        ) : priceSource ? (
                            <span className="text-[9px] text-text-muted/60 font-medium">{priceSource}</span>
                        ) : null}
                    </label>
                    <input
                        type="number"
                        value={entry}
                        onChange={e => setEntry(Number(e.target.value))}
                        className="w-full p-3 bg-bg-main border border-transparent focus:border-cta rounded-xl outline-none transition-all text-lg font-bold"
                        placeholder="0.00"
                    />
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

            {/* Trade Reason — subtle dropdown with hashtags */}
            <div className="relative mb-4">
                <button
                    type="button"
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                    className="flex items-center gap-2 text-xs text-text-muted hover:text-cta transition-colors cursor-pointer mx-auto"
                >
                    <Tag className="w-3 h-3" />
                    {selectedTags.length > 0 ? (
                        <span className="flex items-center gap-1.5 flex-wrap justify-center">
                            {selectedTags.map(id => {
                                const tag = TRADE_TAGS.find(t => t.id === id);
                                return <span key={id} className="text-cta font-semibold">{tag?.label}</span>;
                            })}
                        </span>
                    ) : (
                        <span className="italic">Add trade reason (optional)</span>
                    )}
                </button>

                {showTagDropdown && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[420px] bg-bg-panel border border-border-soft rounded-xl shadow-2xl z-50 p-3 max-h-48 overflow-y-auto custom-scrollbar">
                        <div className="flex flex-wrap gap-1.5">
                            {TRADE_TAGS.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 cursor-pointer
                                        ${selectedTags.includes(tag.id)
                                            ? 'bg-cta/15 text-cta border-cta/30 font-semibold'
                                            : 'bg-bg-main text-text-muted border-border-soft hover:border-cta/20 hover:text-text-main'}`}
                                >
                                    {tag.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => { setShowTagDropdown(false); onExecute && onExecute({ symbol, qty, entry, sl, target, market, direction, netProfit, tags: selectedTags }); }}
                disabled={!symbol || !qty || !entry || !guardReady}
                className="w-full max-w-md mx-auto h-14 bg-cta hover:bg-cta-hover text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                Execute Trade
            </button>

        </div>
    );
}
