
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TradeHistoryEntry } from '@/lib/types';
import { TrendingUp, TrendingDown, Target, Percent } from 'lucide-react';

type TradePerformanceProps = {
    history: TradeHistoryEntry[];
};

export default function TradePerformance({ history }: TradePerformanceProps) {
    const totalTrades = history.length;
    const wins = history.filter(trade => trade.status === 'won').length;
    const losses = history.filter(trade => trade.status === 'lost').length;
    const openTrades = totalTrades - wins - losses;
    
    const closedTrades = wins + losses;
    const winRate = closedTrades > 0 ? (wins / closedTrades) * 100 : 0;

    const kpiData = [
        { label: "Total Trades", value: totalTrades, icon: Target },
        { label: "Wins", value: wins, icon: TrendingUp, color: "text-accent" },
        { label: "Losses", value: losses, icon: TrendingDown, color: "text-destructive" },
        { label: "Win Rate", value: `${winRate.toFixed(1)}%`, icon: Percent, color: "text-blue-500" },
    ];

    if (totalTrades === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trade Performance</CardTitle>
                <CardDescription>A summary of your performance based on the trade history.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                    {kpiData.map(kpi => (
                         <div key={kpi.label} className="p-4 bg-muted/50 rounded-lg">
                            <kpi.icon className={`mx-auto h-7 w-7 mb-2 ${kpi.color || ''}`} />
                            <p className="text-2xl font-bold">{kpi.value}</p>
                            <p className="text-sm text-muted-foreground">{kpi.label}</p>
                        </div>
                    ))}
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-accent">Wins ({wins})</span>
                        <span className="font-medium text-destructive">Losses ({losses})</span>
                    </div>
                    <Progress value={winRate} className="h-3 [&>div]:bg-accent" />
                     <p className="text-xs text-muted-foreground mt-2">
                        {openTrades} trade(s) are still open and not included in the win rate calculation.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
