
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
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import SignalGeneration from "./signal-generation";
import TradeHistory from "./trade-history";
import MarketHours from "./market-hours";
import NewsWarning from "./news-warning";
import Help from "./help";
import AppSettings from "./app-settings";

import type { TradeHistoryEntry, TradeStatus } from "@/lib/types";
import TradePerformance from "./trade-performance";
import { isMarketOpen } from "@/lib/utils";
import { CURRENCY_PAIRS } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 md:p-8 bg-background">
            <header className="flex items-center justify-between md:hidden mb-4 border-b pb-4">
                <div className="flex items-center gap-2">
                    <CustomIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-xl font-semibold text-primary">TradeAlert</h1>
                </div>
                <SidebarTrigger />
            </header>
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
    </SidebarProvider>
  );
}

function AppSidebar({ activeView, setActiveView }: { activeView: View; setActiveView: (view: View) => void; }) {
  const { toggleSidebar, isMobile, state } = useSidebar();
  
  const menuItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: "signals", label: "Show Signals", icon: BarChart2 },
    { id: "history", label: "Trade History", icon: History },
    { id: "info", label: "App Settings", icon: Settings },
    { id: "news", label: "News & Sentiment", icon: TriangleAlert },
    { id: "market", label: "Market Hours", icon: Clock },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <button 
            onClick={toggleSidebar}
            className={cn("hidden md:flex items-center gap-2 w-full text-left transition-opacity", state === 'collapsed' && 'justify-center')}
        >
            <CustomIcon className="w-8 h-8 text-primary shrink-0" />
            <h1 className={cn("text-xl font-semibold text-primary transition-all", state === 'collapsed' && 'opacity-0 w-0 h-0')}>TradeAlert</h1>
        </button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => {
                  setActiveView(item.id);
                  if (isMobile) toggleSidebar();
                }}
                isActive={activeView === item.id}
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <Separator className="my-2"/>
      </SidebarFooter>
    </Sidebar>
  );
}
