"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, Loader2 } from "lucide-react";
import { getNewsEventsAction } from '@/app/actions';
import type { EconomicEvent } from '@/ai/flows/economic-news-flow';
import { Skeleton } from './ui/skeleton';

export default function NewsWarning() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      setIsLoading(true);
      const newsEvents = await getNewsEventsAction();
      setEvents(newsEvents);
      setIsLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>News & Volatility Warning</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>High-Impact News Advisory</AlertTitle>
          <AlertDescription>
            Major economic data releases can cause extreme market volatility, slippage, and wider spreads. Trading during these periods carries significantly higher risk. Always check an economic calendar before placing trades. This bot does not account for news events.
          </AlertDescription>
        </Alert>

        <div className="mt-6">
            <h3 className="font-semibold mb-2">Key Upcoming Events (AI-Generated)</h3>
            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                </div>
            ) : (
                <ul className="list-disc list-inside space-y-2 text-sm">
                    {events.length > 0 ? events.map((event, index) => (
                        <li key={index}><span className="font-semibold">{event.name}:</span> {event.time}</li>
                    )) : (
                        <li>No upcoming high-impact news events found.</li>
                    )}
                </ul>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
