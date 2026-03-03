"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
    Settings2, Sun, Moon, DollarSign, Palette, Database,
    Download, Trash2, Upload, Info, Shield, TrendingUp, AlertTriangle
} from "lucide-react";

export function Settings() {
    const {
        currency, setCurrency,
        capital, setCapital,
        dailyLimit, setDailyLimit,
        isDarkMode, setIsDarkMode,
        trades
    } = useApp();

    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [importStatus, setImportStatus] = useState<string | null>(null);

    const handleExportCSV = () => {
        if (trades.length === 0) return;
        const headers = ['Date', 'Symbol', 'Market', 'Direction', 'Qty', 'Entry', 'SL', 'Target', 'P&L', 'Tags', 'Notes'];
        const rows = trades.map(t => [
            t.timestamp ? new Date(t.timestamp).toLocaleDateString() : '',
            t.symbol || '', t.market || '', t.direction || '', t.qty || '',
            t.entry || '', t.sl || '', t.target || '', t.netProfit || 0,
            (t.tags || []).join('; '), (t.notes || '').replace(/,/g, ' ')
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TradeVault_Trades_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportJSON = () => {
        if (trades.length === 0) return;
        const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TradeVault_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportJSON = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (Array.isArray(data)) {
                    localStorage.setItem("tv_trades", JSON.stringify(data));
                    setImportStatus(`✅ Imported ${data.length} trades. Refresh to see changes.`);
                } else {
                    setImportStatus("❌ Invalid file format. Expected an array of trades.");
                }
            } catch {
                setImportStatus("❌ Failed to parse file.");
            }
        };
        reader.readAsText(file);
    };

    const handleClearAll = () => {
        localStorage.removeItem("tv_trades");
        setShowClearConfirm(false);
        window.location.reload();
    };

    return (
        <div className="flex flex-col gap-6 max-w-3xl">
            <div>
                <h2 className="text-2xl font-outfit font-bold text-text-main">Settings</h2>
                <p className="text-sm text-text-muted">Customize your TradeVault experience.</p>
            </div>

            {/* Appearance */}
            <SettingsSection icon={<Palette className="w-4 h-4" />} title="Appearance">
                <SettingsRow label="Theme" description="Switch between light and dark mode">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="flex items-center gap-2 px-4 py-2 bg-bg-main border border-border-soft rounded-lg text-sm font-medium hover:border-cta/30 transition-all cursor-pointer"
                    >
                        {isDarkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-cta" />}
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </button>
                </SettingsRow>
            </SettingsSection>

            {/* Trading Config */}
            <SettingsSection icon={<TrendingUp className="w-4 h-4" />} title="Trading Configuration">
                <SettingsRow label="Default Currency" description="Set your base currency for all calculations">
                    <div className="flex gap-2">
                        {['₹', '$'].map(c => (
                            <button
                                key={c}
                                onClick={() => setCurrency(c)}
                                className={`w-10 h-10 rounded-lg border text-sm font-bold flex items-center justify-center transition-all cursor-pointer
                                    ${currency === c ? 'bg-cta text-white border-cta' : 'bg-bg-main border-border-soft text-text-muted hover:border-cta/30'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </SettingsRow>

                <SettingsRow label="Trading Capital" description="Your base trading capital for position sizing">
                    <input
                        type="number"
                        value={capital}
                        onChange={e => setCapital(Number(e.target.value) || 0)}
                        className="w-40 px-3 py-2 text-sm bg-bg-main border border-border-soft rounded-lg outline-none focus:border-cta text-right font-semibold"
                    />
                </SettingsRow>

                <SettingsRow label="Daily Loss Limit" description="Maximum loss allowed per day before trading stops">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-danger" />
                        <input
                            type="number"
                            value={dailyLimit}
                            onChange={e => setDailyLimit(Number(e.target.value) || 0)}
                            className="w-40 px-3 py-2 text-sm bg-bg-main border border-border-soft rounded-lg outline-none focus:border-cta text-right font-semibold"
                        />
                    </div>
                </SettingsRow>
            </SettingsSection>

            {/* Data Management */}
            <SettingsSection icon={<Database className="w-4 h-4" />} title="Data Management">
                <SettingsRow label="Export Trades" description="Download your trade history">
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportCSV}
                            disabled={trades.length === 0}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-bg-main border border-border-soft rounded-lg hover:border-cta/30 transition-all disabled:opacity-40 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                        <button
                            onClick={handleExportJSON}
                            disabled={trades.length === 0}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-bg-main border border-border-soft rounded-lg hover:border-cta/30 transition-all disabled:opacity-40 cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" /> JSON Backup
                        </button>
                    </div>
                </SettingsRow>

                <SettingsRow label="Import Trades" description="Restore from a JSON backup">
                    <div className="flex flex-col items-end gap-1">
                        <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-bg-main border border-border-soft rounded-lg hover:border-cta/30 transition-all cursor-pointer">
                            <Upload className="w-3.5 h-3.5" /> Import JSON
                            <input type="file" accept=".json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImportJSON(f); e.target.value = ''; }} />
                        </label>
                        {importStatus && <p className="text-[10px] text-text-muted">{importStatus}</p>}
                    </div>
                </SettingsRow>

                <SettingsRow label="Clear All Trades" description="Permanently delete all trade history">
                    {!showClearConfirm ? (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-all cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Clear Data
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-danger font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Are you sure?
                            </span>
                            <button onClick={handleClearAll} className="px-3 py-1.5 text-xs font-bold text-white bg-danger rounded-lg cursor-pointer">Yes, Delete</button>
                            <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1.5 text-xs font-semibold text-text-muted bg-bg-main border border-border-soft rounded-lg cursor-pointer">Cancel</button>
                        </div>
                    )}
                </SettingsRow>
            </SettingsSection>

            {/* About */}
            <SettingsSection icon={<Info className="w-4 h-4" />} title="About">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Version</span>
                    <span className="font-semibold text-text-main">TradeVault v2.0.0</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Source Code</span>
                    <a href="https://github.com/akileshm-ops/Portfolio-manager" target="_blank" rel="noopener noreferrer" className="text-cta hover:text-cta-hover font-semibold transition-colors">
                        GitHub →
                    </a>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Stack</span>
                    <span className="text-text-main font-medium">Next.js 16 · React 19 · Tailwind 4</span>
                </div>
            </SettingsSection>
        </div>
    );
}

// Reusable section wrapper
function SettingsSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <div className="bg-bg-panel border border-border-soft rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-4">
                {icon} {title}
            </h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

// Reusable setting row
function SettingsRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <span className="text-sm font-medium text-text-main">{label}</span>
                <p className="text-[11px] text-text-muted">{description}</p>
            </div>
            {children}
        </div>
    );
}
