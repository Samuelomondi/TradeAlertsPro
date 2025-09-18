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
  { name: 'London', openUtc: 8, closeUtc: 16 },
  { name: 'New York', openUtc: 13, closeUtc: 21 },
  { name: 'Tokyo', openUtc: 0, closeUtc: 8 },
];

function getMarketStatus(market: Market, currentHour: number) {
  if (market.openUtc < market.closeUtc) {
    return currentHour >= market.openUtc && currentHour < market.closeUtc;
  } else { // Handles overnight markets like Tokyo
    return currentHour >= market.openUtc || currentHour < market.closeUtc;
  }
}

export default function MarketHours() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const currentUtcHour = currentTime.getUTCHours();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Hours</CardTitle>
        <CardDescription>
          Live status of major foreign exchange markets. Current UTC time: {currentTime.toUTCString().slice(17, 22)}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {markets.map((market) => {
          const isOpen = getMarketStatus(market, currentUtcHour);
          return (
            <Card key={market.name} className={`flex flex-col items-center p-6 ${isOpen ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
              <Globe className={`w-10 h-10 mb-2 ${isOpen ? 'text-green-600' : 'text-red-600'}`} />
              <h3 className="text-lg font-semibold">{market.name}</h3>
              <p className={`font-bold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isOpen ? 'Open' : 'Closed'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {String(market.openUtc).padStart(2, '0')}:00 - {String(market.closeUtc).padStart(2, '0')}:00 UTC
              </p>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}
