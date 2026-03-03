"use client";

import { PositionSizer } from "@/components/PositionSizer";
import { PreTradeGuard } from "@/components/PreTradeGuard";
import { NewsTerminal } from "@/components/NewsTerminal";
import { Sidebar } from "@/components/Sidebar";
import { DailyLimitDropdown } from "@/components/DailyLimitDropdown";
import { Moon, Sun } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { LivePositions } from "@/components/LivePositions";
import { Journal } from "@/components/Journal";
import { Analytics } from "@/components/Analytics";
import { Settings } from "@/components/Settings";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { isDarkMode, setIsDarkMode, activeModule, addTrade } = useApp();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleExecuteTrade = (tradeData: any) => {
    addTrade({
      ...tradeData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'OPEN'
    });
    alert(`Trade Executed: ${tradeData.symbol} @ ${tradeData.entry}`);
  };

  const renderModule = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          {(() => {
            switch (activeModule) {
              case 'positions':
                return <LivePositions />;
              case 'journal':
                return <Journal />;
              case 'analytics':
                return <Analytics />;
              case 'settings':
                return <Settings />;
              default:
                return (
                  <div className="flex gap-8 pb-8" style={{ alignItems: 'stretch' }}>
                    {/* Left Column (35%) — stretches to match right column */}
                    <div className="w-[35%] flex flex-col gap-8" style={{ minHeight: 0 }}>
                      <PreTradeGuard />
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <NewsTerminal />
                      </div>
                    </div>

                    {/* Right Column (65%) */}
                    <div className="w-[65%] flex flex-col">
                      <PositionSizer onExecute={handleExecuteTrade} />
                    </div>
                  </div>
                );
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-main text-text-main font-dmsans">
      <Sidebar />

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-12 bg-bg-main relative">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="font-outfit text-4xl font-bold text-text-main mb-2">Plan Execution</h1>
            <p className="text-text-muted">Define your edge, calculate risk, and execute flawlessly.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* V1 Restored Components */}
            <DailyLimitDropdown />

            <button
              onClick={toggleDarkMode}
              className="bg-bg-panel border border-border-soft rounded-lg h-11 w-11 flex items-center justify-center cursor-pointer shadow-soft hover:bg-bg-main transition-colors text-text-muted hover:text-text-main"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

        </header>

        {renderModule()}
      </main>
    </div>
  );
}
