"use client";

import React, { useState } from "react";
import {
  BarChart2,
  Bot,
  Calculator,
  Clock,
  HelpCircle,
  History,
  PanelLeft,
  Rss,
  TriangleAlert,
  Waveform,
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import SignalGeneration from "./signal-generation";
import TradeHistory from "./trade-history";
import RiskCalculator from "./risk-calculator";
import BotInfo from "./bot-info";
import MarketHours from "./market-hours";
import NewsWarning from "./news-warning";
import Help from "./help";

import type { TradeHistoryEntry } from "@/lib/types";

type View = "signals" | "history" | "risk" | "info" | "market" | "news" | "help";

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>("signals");
  const [history, setHistory] = useState<TradeHistoryEntry[]>([]);

  const addTradeToHistory = (entry: TradeHistoryEntry) => {
    setHistory((prev) => [entry, ...prev]);
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 md:p-8 bg-background">
            {activeView === 'signals' && <SignalGeneration addTradeToHistory={addTradeToHistory} />}
            {activeView === 'history' && <TradeHistory history={history} />}
            {activeView === 'risk' && <RiskCalculator />}
            {activeView === 'info' && <BotInfo />}
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
    { id: "risk", label: "Risk Calc", icon: Calculator },
    { id: "info", label: "Bot Info", icon: Bot },
    { id: "news", label: "News Warning", icon: TriangleAlert },
    { id: "market", label: "Market Hours", icon: Clock },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}><PanelLeft /></Button>
            <Waveform className="w-8 h-8 text-primary" />
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