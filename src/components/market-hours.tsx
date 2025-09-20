
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Globe } from 'lucide-react';

interface Market {
  name: string;
  openUtc: number;
  closeUtc: number;
}

const markets: Market[] = [
  { name: 'Sydney', openUtc: 22, closeUtc: 6 },
  { name: 'London', openUtc: 8, closeUtc: 16 },
  { name: 'New York', openUtc: 13, closeUtc: 21 },
  { name: 'Tokyo', openUtc: 0, closeUtc: 8 },
];

// Sort markets by their opening time, handling the overnight Sydney case
const sortedMarkets = [...markets].sort((a, b) => {
    // Treat Sydney's 22:00 as -2 for sorting purposes to place it first
    const aOpen = a.name === 'Sydney' ? -2 : a.openUtc;
    const bOpen = b.name === 'Sydney' ? -2 : b.openUtc;
    return aOpen - bOpen;
});


function getMarketStatus(market: Market, currentHour: number) {
  if (market.openUtc < market.closeUtc) {
    return currentHour >= market.openUtc && currentHour < market.closeUtc;
  } else { // Handles overnight markets like Sydney & Tokyo
    return currentHour >= market.openUtc || currentHour < market.closeUtc;
  }
}

function formatUtcHourToLocal(utcHour: number, baseDate: Date) {
    const date = new Date(baseDate);
    date.setUTCHours(utcHour, 0, 0, 0);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function MarketHours() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const currentUtcHour = currentTime.getUTCHours();
  
  const localTime = currentTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Hours</CardTitle>
        <CardDescription>
          Live status of major forex sessions, ordered by their typical opening. This covers all major pairs including AUD, NZD (Sydney), JPY (Tokyo), EUR, GBP, CHF (London), and USD, CAD (New York). Current local time: {localTime}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedMarkets.map((market) => {
          const isOpen = getMarketStatus(market, currentUtcHour);
          return (
            <Card key={market.name} className={`flex flex-col items-center p-6 ${isOpen ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <Globe className={`w-10 h-10 mb-2 ${isOpen ? 'text-green-600' : 'text-red-600'}`} />
              <h3 className="text-lg font-semibold">{market.name}</h3>
              <p className={`font-bold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
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
  );
}
