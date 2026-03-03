"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
    currency: string;
    setCurrency: (c: string) => void;
    dailyLimit: number;
    setDailyLimit: (l: number) => void;
    capital: number;
    setCapital: (c: number) => void;
    isDarkMode: boolean;
    setIsDarkMode: (d: boolean) => void;
    activeModule: string;
    trades: any[];
    resetTrigger: number;
    setActiveModule: (val: string) => void;
    addTrade: (trade: any) => void;
    triggerReset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState("₹");
    const [dailyLimit, setDailyLimitState] = useState(10000);
    const [capital, setCapitalState] = useState(100000);
    const [isDarkMode, setIsDarkModeState] = useState(false);
    const [activeModule, setActiveModule] = useState('planner');
    const [trades, setTrades] = useState<any[]>([]);
    const [resetTrigger, setResetTrigger] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Load from localStorage on mount
        const storedCurrency = localStorage.getItem("tv_base_currency");
        const storedLimit = localStorage.getItem("tv_max_loss");
        const storedCapital = localStorage.getItem("tv_capital");
        const storedTheme = localStorage.getItem("tv_theme");
        const storedTrades = localStorage.getItem("tv_trades");
        const storedActiveModule = localStorage.getItem("tv_active_module");

        if (storedCurrency) {
            if (storedCurrency === "INR") setCurrencyState("₹");
            else if (storedCurrency === "USD") setCurrencyState("$");
            else setCurrencyState(storedCurrency);
        } else {
            setCurrencyState("₹");
        }

        if (storedLimit) setDailyLimitState(parseFloat(storedLimit));
        else setDailyLimitState(10000);

        if (storedCapital) setCapitalState(parseFloat(storedCapital));
        else setCapitalState(100000);

        if (storedTheme) setIsDarkModeState(storedTheme === 'dark');
        else setIsDarkModeState(document.documentElement.classList.contains("dark"));

        if (storedTrades) setTrades(JSON.parse(storedTrades));
        else setTrades([]);

        if (storedActiveModule) setActiveModule(storedActiveModule);
        else setActiveModule('planner');

        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        localStorage.setItem("tv_base_currency", currency === "₹" ? "INR" : "USD");
        localStorage.setItem("tv_max_loss", dailyLimit.toString());
        localStorage.setItem("tv_capital", capital.toString());
        localStorage.setItem("tv_theme", isDarkMode ? "dark" : "light");
        localStorage.setItem("tv_trades", JSON.stringify(trades));
        localStorage.setItem("tv_active_module", activeModule);

        if (isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [currency, dailyLimit, capital, isDarkMode, trades, activeModule, isMounted]);

    const setCurrency = (c: string) => {
        setCurrencyState(c);
    };

    const setDailyLimit = (l: number) => {
        setDailyLimitState(l);
    };

    const setCapital = (c: number) => {
        setCapitalState(c);
    };

    const triggerReset = () => {
        setResetTrigger(prev => prev + 1);
    };

    const setIsDarkMode = (d: boolean) => {
        setIsDarkModeState(d);
    };

    const addTrade = (trade: any) => {
        setTrades(prev => [trade, ...prev]);
    };

    return (
        <AppContext.Provider value={{
            currency, setCurrency,
            dailyLimit, setDailyLimit,
            capital, setCapital,
            isDarkMode, setIsDarkMode,
            activeModule, setActiveModule,
            trades, addTrade,
            resetTrigger, triggerReset
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
