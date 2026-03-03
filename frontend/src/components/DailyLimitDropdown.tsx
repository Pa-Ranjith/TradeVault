"use client";

import { useState, useRef, useEffect } from "react";
import { Shield, ChevronDown, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function DailyLimitDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const { currency, setCurrency, dailyLimit, setDailyLimit } = useApp();
    const [localLimit, setLocalLimit] = useState(dailyLimit.toString()); // Local temp state while typing
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync local when global changes
    useEffect(() => {
        setLocalLimit(dailyLimit.toString());
    }, [dailyLimit]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePreset = (amount: number) => {
        setDailyLimit(amount);
        setIsOpen(false);
    };

    const confirmCustom = () => {
        setDailyLimit(Number(localLimit) || 0);
        setIsOpen(false);
    };

    return (
        <div className="relative z-50 flex items-center gap-2" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-bg-panel border border-border-soft rounded-lg h-11 px-3 flex items-center gap-2 cursor-pointer shadow-soft hover:bg-bg-main transition-colors"
            >
                <Shield className="w-4 h-4 text-text-muted" />
                <span className="font-inter text-sm font-semibold text-text-main whitespace-nowrap">
                    Daily Limit: {currency}{dailyLimit.toLocaleString(currency === '₹' ? 'en-IN' : 'en-US')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-bg-panel border border-border-soft rounded-lg shadow-soft p-3 w-max flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex gap-2">
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="px-2 py-1.5 text-sm border border-border-soft rounded bg-transparent focus:outline-none focus:border-primary text-text-main"
                        >
                            <option value="₹">₹</option>
                            <option value="$">$</option>
                        </select>
                        <input
                            type="number"
                            value={localLimit}
                            onChange={(e) => setLocalLimit(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") confirmCustom(); }}
                            className="w-24 px-2 py-1.5 text-sm border border-border-soft rounded bg-transparent focus:outline-none focus:border-primary text-text-main format-number"
                        />
                    </div>

                    <div className="flex gap-1 items-center mt-1">
                        <button onClick={() => handlePreset(2500)} className="flex-1 py-1 px-2 text-xs border border-border-soft rounded hover:bg-border-soft transition-colors text-text-main">2.5k</button>
                        <button onClick={() => handlePreset(5000)} className="flex-1 py-1 px-2 text-xs border border-border-soft rounded hover:bg-border-soft transition-colors text-text-main">5k</button>
                        <button onClick={() => handlePreset(10000)} className="flex-1 py-1 px-2 text-xs border border-border-soft rounded hover:bg-border-soft transition-colors text-text-main">10k</button>
                    </div>

                    <button
                        onClick={confirmCustom}
                        className="w-full mt-1 bg-cta text-white border-none rounded-md py-1.5 text-sm font-bold flex items-center justify-center gap-1 hover:bg-[#00a383] transition-colors shadow-[0_4px_12px_rgba(0,184,148,0.2)]"
                    >
                        Cool <Check className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
