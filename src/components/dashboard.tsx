
"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart2,
  Settings,
  Clock,
  HelpCircle,
  History,
  TriangleAlert,
} from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import SignalGeneration from "./signal-generation";
import TradeHistory from "./trade-history";
import MarketHours from "./market-hours";
import NewsWarning from "./news-warning";
import Help from "./help";
import AppSettings from "./app-settings";

import type { TradeHistoryEntry, TradeStatus } from "@/lib/types";
import TradePerformance from "./trade-performance";
import { CURRENCY_PAIRS } from "@/lib/constants";
import { Button } from "./ui/button";

type View = "signals" | "history" | "info" | "market" | "news" | "help";

const TRADE_HISTORY_STORAGE_KEY = "tradeHistory";

const CustomIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M3 3v18h18" />
        <path d="M7 12l5-5 5 5" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))"/>
        <path d="M7 16l5-5 5 5" fill="hsl(var(--primary) / 0.5)" stroke="hsl(var(--primary))"/>
    </svg>
);

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>("signals");
  const [history, setHistory] = useState<TradeHistoryEntry[]>([]);
  const [accountBalance, setAccountBalance] = useState(1000);
  const [riskPercentage, setRiskPercentage] = useState(1);
  const [selectedPair, setSelectedPair] = useState(CURRENCY_PAIRS[0]);

  // Load history from localStorage on initial client-side render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(TRADE_HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to parse trade history from localStorage", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(TRADE_HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save trade history to localStorage", error);
    }
  }, [history]);

  const addTradeToHistory = (entry: TradeHistoryEntry) => {
    setHistory((prev) => [entry, ...prev]);
  };

  const updateTradeStatus = (id: string, status: TradeStatus) => {
    setHistory(prev => prev.map(trade => trade.id === id ? { ...trade, status } : trade));
  };
  
  const clearHistory = () => {
    setHistory([]);
  };

  const deleteTrade = (id: string) => {
    setHistory(prev => prev.filter(trade => trade.id !== id));
  };
  
  const menuItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: "signals", label: "Show Signals", icon: BarChart2 },
    { id: "history", label: "Trade History", icon: History },
    { id: "info", label: "App Settings", icon: Settings },
    { id: "news", label: "News & Sentiment", icon: TriangleAlert },
    { id: "market", label: "Market Hours", icon: Clock },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
            <CustomIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-semibold text-primary">TradeAlert</h1>
        </div>
        <Menubar>
            <MenubarMenu>
                <MenubarTrigger>Menu</MenubarTrigger>
                <MenubarContent>
                    {menuItems.map((item) => (
                        <MenubarItem key={item.id} onSelect={() => setActiveView(item.id)} className="gap-2">
                             <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                        </MenubarItem>
                    ))}
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
      </header>
      <main className="flex-1 p-4 md:p-8 bg-background">
          {activeView === 'signals' && <SignalGeneration addTradeToHistory={addTradeToHistory} accountBalance={accountBalance} riskPercentage={riskPercentage} history={history} updateTradeStatus={updateTradeStatus} selectedPair={selectedPair} setSelectedPair={setSelectedPair} />}
          {activeView === 'history' && (
              <div className="space-y-8">
                  <TradePerformance history={history} />
                  <TradeHistory history={history} updateTradeStatus={updateTradeStatus} clearHistory={clearHistory} deleteTrade={deleteTrade} />
              </div>
          )}
          {activeView === 'info' && <AppSettings accountBalance={accountBalance} riskPercentage={riskPercentage} setAccountBalance={setAccountBalance} setRiskPercentage={setRiskPercentage} />}
          {activeView === 'market' && <MarketHours selectedPair={selectedPair} />}
          {activeView === 'news' && <NewsWarning />}
          {activeView === 'help' && <Help />}
      </main>
    </div>
  );
}
