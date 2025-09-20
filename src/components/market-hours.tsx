
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, Clock, Layers, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CURRENCY_PAIRS } from '@/lib/constants';
import { getMarketStatus, getOverlapStatus, overlaps, markets, pairOverlapMap } from '@/lib/utils';

interface Market {
  name: 'Sydney' | 'London' | 'New York' | 'Tokyo';
  openUtc: number;
  closeUtc: number;
}

const sortedMarkets = [...markets].sort((a, b) => {
    const aOpen = a.name === 'Sydney' ? -2 : a.openUtc;
    const bOpen = b.name === 'Sydney' ? -2 : b.openUtc;
    return aOpen - bOpen;
});

function formatUtcHourToLocal(utcHour: number, baseDate: Date) {
    const date = new Date(baseDate);
    date.setUTCHours(utcHour, 0, 0, 0);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function MarketHours({ selectedPair }: { selectedPair: string }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);
  
  const localTime = currentTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
  });

  const relevantOverlapIds = pairOverlapMap[selectedPair] || [];

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Market Sessions</CardTitle>
                <CardDescription>
                Live status of major forex sessions, ordered by opening. Current local time: {localTime}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sortedMarkets.map((market) => {
                const isOpen = getMarketStatus(market, currentTime);
                return (
                    <Card key={market.name} className={cn("flex flex-col items-center p-6", isOpen ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20')}>
                    <Globe className={cn("w-10 h-10 mb-2", isOpen ? 'text-green-600' : 'text-red-600')} />
                    <h3 className="text-lg font-semibold">{market.name}</h3>
                    <p className={cn("font-bold", isOpen ? 'text-green-600' : 'text-red-600')}>
                        {isOpen ? 'Open' : 'Closed'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {formatUtcHourToLocal(market.openUtc, currentTime)} - {formatUtcHourToLocal(market.closeUtc, currentTime)}
                    </p>
                    </Card>
                );
                })}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Session Overlaps</CardTitle>
                <CardDescription>
                    These periods often have the highest trading volume and volatility. The most relevant overlap for <span className="font-bold text-primary">{selectedPair}</span> is highlighted.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {overlaps.map((overlap) => {
                    const isActive = getOverlapStatus(overlap, currentTime);
                    const isRelevant = relevantOverlapIds.includes(overlap.id);
                    return (
                        <Card key={overlap.name} className={cn(
                            "flex flex-col items-center p-6 relative", 
                            isActive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted',
                            isRelevant && "border-primary border-2"
                        )}>
                            {isRelevant && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-primary font-semibold">
                                    <Star className="w-4 h-4" />
                                    <span>Relevant</span>
                                </div>
                            )}
                            <Layers className={cn("w-10 h-10 mb-2", isActive ? 'text-green-600' : 'text-muted-foreground')} />
                            <h3 className="text-lg font-semibold">{overlap.name}</h3>
                            <p className={cn("font-bold", isActive ? 'text-green-600' : 'text-muted-foreground')}>
                                {isActive ? 'Active' : 'Inactive'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {formatUtcHourToLocal(overlap.startUtc, currentTime)} - {formatUtcHourToLocal(overlap.endUtc, currentTime)}
                            </p>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
    </div>
  );
}
