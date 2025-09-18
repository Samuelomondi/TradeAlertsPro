"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart2,
  Settings,
  Calculator,
  Clock,
  HelpCircle,
  History,
  PanelLeft,
  Rss,
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SignalGeneration from "./signal-generation";
import TradeHistory from "./trade-history";
import RiskCalculator from "./risk-calculator";
import MarketHours from "./market-hours";
import NewsWarning from "./news-warning";
import Help from "./help";

import type { TradeHistoryEntry, TradeStatus } from "@/lib/types";
import TradePerformance from "./trade-performance";

type View = "signals" | "history" | "risk" | "info" | "market" | "news" | "help";

const TRADE_HISTORY_STORAGE_KEY = "tradeHistory";

type DashboardProps = {
  botInfo: React.ReactNode;
};

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

export default function Dashboard({ botInfo }: DashboardProps) {
  const [activeView, setActiveView] = useState<View>("signals");
  const [history, setHistory] = useState<TradeHistoryEntry[]>([]);
  const [accountBalance, setAccountBalance] = useState(1000);
  const [riskPercentage, setRiskPercentage] = useState(1);

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
            {activeView === 'signals' && <SignalGeneration addTradeToHistory={addTradeToHistory} accountBalance={accountBalance} riskPercentage={riskPercentage} history={history} updateTradeStatus={updateTradeStatus} />}
            {activeView === 'history' && (
                <div className="space-y-8">
                    <TradePerformance history={history} />
                    <TradeHistory history={history} updateTradeStatus={updateTradeStatus} clearHistory={clearHistory} deleteTrade={deleteTrade} />
                </div>
            )}
            {activeView === 'risk' && <RiskCalculator accountBalance={accountBalance} riskPercentage={riskPercentage} setAccountBalance={setAccountBalance} setRiskPercentage={setRiskPercentage} />}
            {activeView === 'info' && botInfo}
            {activeView === 'market' && <MarketHours />}
            {activeView === 'news' && <NewsWarning />}
            {activeView === 'help' && <Help />}
        </main>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar({ activeView, setActiveView }: { activeView: View; setActiveView: (view: View) => void; }) {
  const { toggleSidebar, isMobile } = useSidebar();

  const menuItems: { id: View; label: string; icon: React.ElementType }[] = [
    { id: "signals", label: "Show Signals", icon: BarChart2 },
    { id: "history", label: "Trade History", icon: History },
    { id: "risk", label: "Risk Settings", icon: Calculator },
    { id: "info", label: "App Settings", icon: Settings },
    { id: "news", label: "News Warning", icon: TriangleAlert },
    { id: "market", label: "Market Hours", icon: Clock },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="hidden md:flex items-center gap-2">
            <CustomIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-semibold text-primary">TradeAlert</h1>
        </div>
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
         <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
             <Rss className="w-4 h-4 mr-2" />
             <span>Status: Connected</span>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
