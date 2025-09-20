
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe, Clock, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Market {
  name: string;
  openUtc: number;
  closeUtc: number;
}

interface Overlap {
  name: string;
  startUtc: number;
  endUtc: number;
}

const markets: Market[] = [
  { name: 'Sydney', openUtc: 22, closeUtc: 6 },
  { name: 'London', openUtc: 8, closeUtc: 16 },
  { name: 'New York', openUtc: 13, closeUtc: 21 },
  { name: 'Tokyo', openUtc: 0, closeUtc: 8 },
];

const overlaps: Overlap[] = [
    { name: 'Sydney/Tokyo', startUtc: 0, endUtc: 6 },
    { name: 'London/New York', startUtc: 13, endUtc: 16 },
];

const sortedMarkets = [...markets].sort((a, b) => {
    const aOpen = a.name === 'Sydney' ? -2 : a.openUtc;
    const bOpen = b.name === 'Sydney' ? -2 : b.openUtc;
    return aOpen - bOpen;
});

function getMarketStatus(market: Market, now: Date) {
    const currentUtcDay = now.getUTCDay();
    const currentUtcHour = now.getUTCHours();
    
    if (currentUtcDay === 6 || (currentUtcDay === 5 && currentUtcHour >= 21) || (currentUtcDay === 0 && currentUtcHour < 21)) {
        return false;
    }

    if (market.openUtc < market.closeUtc) {
        return currentUtcHour >= market.openUtc && currentUtcHour < market.closeUtc;
    } else {
        return currentUtcHour >= market.openUtc || currentUtcHour < market.closeUtc;
    }
}

function getOverlapStatus(overlap: Overlap, now: Date) {
    const currentUtcDay = now.getUTCDay();
    const currentUtcHour = now.getUTCHours();
    
    if (currentUtcDay === 6 || currentUtcDay === 0) return false;
    if (currentUtcDay === 5 && currentUtcHour >= overlap.endUtc) return false;

    return currentUtcHour >= overlap.startUtc && currentUtcHour < overlap.endUtc;
}

function formatUtcHourToLocal(utcHour: number, baseDate: Date) {
    const date = new Date(baseDate);
    date.setUTCHours(utcHour, 0, 0, 0);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function MarketHours() {
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
                    These periods often have the highest trading volume and volatility, making them optimal times for trading.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {overlaps.map((overlap) => {
                    const isActive = getOverlapStatus(overlap, currentTime);
                    return (
                        <Card key={overlap.name} className={cn("flex flex-col items-center p-6", isActive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-muted')}>
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
