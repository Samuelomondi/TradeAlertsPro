
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert, Loader2, Calendar, Newspaper, Smile, Meh, Frown, Sparkles } from "lucide-react";
import { getNewsEventsAction, getNewsSentimentAction } from '@/app/actions';
import type { EconomicEvent } from '@/ai/flows/economic-news-flow';
import type { NewsSentimentOutput } from '@/ai/flows/news-sentiment-flow';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CURRENCY_PAIRS } from '@/lib/constants';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useSettings } from './settings-provider';

const formatEventTime = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return date.toLocaleString(undefined, {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

const sentimentIcons = {
  "Positive": <Smile className="w-6 h-6 text-green-500" />,
  "Neutral": <Meh className="w-6 h-6 text-yellow-500" />,
  "Negative": <Frown className="w-6 h-6 text-red-500" />,
}

const sentimentColors = {
  "Positive": "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
  "Neutral": "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
  "Negative": "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200",
}

export default function NewsWarning() {
  const { settings } = useSettings();
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  
  const [sentiment, setSentiment] = useState<NewsSentimentOutput | null>(null);
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
  const [sentimentError, setSentimentError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState(CURRENCY_PAIRS[0]);

  useEffect(() => {
    async function fetchNews() {
      setIsLoadingEvents(true);
      setEventsError(null);
      try {
        const newsEvents = await getNewsEventsAction({ geminiApiKey: settings.geminiApiKey });
        setEvents(newsEvents);
      } catch (error) {
          if (error instanceof Error) {
            setEventsError(error.message);
          } else {
            setEventsError("An unknown error occurred.");
          }
      } finally {
        setIsLoadingEvents(false);
      }
    }
    fetchNews();
  }, [settings.geminiApiKey]);

  const handleFetchSentiment = async () => {
    setIsLoadingSentiment(true);
    setSentiment(null);
    setSentimentError(null);
    try {
        const sentimentData = await getNewsSentimentAction({
            currencyPair: selectedPair,
            geminiApiKey: settings.geminiApiKey,
        });
        setSentiment(sentimentData);
    } catch (error) {
        if (error instanceof Error) {
            setSentimentError(error.message);
        } else {
            setSentimentError("An unknown error occurred.");
        }
    } finally {
        setIsLoadingSentiment(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Global Economic Calendar</CardTitle>
          <CardDescription>Major upcoming economic events that could impact market volatility.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>High-Impact News Advisory</AlertTitle>
            <AlertDescription>
              Major economic releases can cause extreme volatility and wider spreads. This bot does not account for news events in its signals. Always trade with caution.
            </AlertDescription>
          </Alert>

          <div className="mt-6">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Calendar className="w-5 h-5" />
                <h3 className="font-semibold">Key Upcoming Events (AI-Generated)</h3>
              </div>
              {isLoadingEvents ? (
                  <div className="space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                  </div>
              ) : eventsError ? (
                 <Alert variant="destructive">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Error Fetching Events</AlertTitle>
                    <AlertDescription>{eventsError}</AlertDescription>
                </Alert>
              ) : (
                  <ul className="list-disc list-inside space-y-2 text-sm">
                      {events.length > 0 ? events.map((event, index) => (
                          <li key={index}><span className="font-semibold">{event.name}:</span> {formatEventTime(event.time)}</li>
                      )) : (
                          <li>No upcoming high-impact news events found.</li>
                      )}
                  </ul>
              )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live News Sentiment Analysis</CardTitle>
          <CardDescription>Uses AI to analyze recent news headlines for a specific currency pair and determine market sentiment.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex-1 w-full sm:w-auto">
              <label htmlFor="currency-select" className="text-sm font-medium mb-1 block">Currency Pair</label>
              <Select onValueChange={setSelectedPair} defaultValue={selectedPair}>
                  <SelectTrigger id="currency-select">
                      <SelectValue placeholder="Select a pair" />
                  </SelectTrigger>
                  <SelectContent>
                      {CURRENCY_PAIRS.map((pair) => (
                          <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <Button onClick={handleFetchSentiment} disabled={isLoadingSentiment} className="w-full sm:w-auto mt-4 sm:mt-0 sm:self-end">
              {isLoadingSentiment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Analyze Sentiment
            </Button>
          </div>

          {isLoadingSentiment && (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-lg">Analyzing news sentiment...</p>
            </div>
          )}

          {sentimentError && !isLoadingSentiment && (
            <Alert variant="destructive">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Error Fetching Sentiment</AlertTitle>
                <AlertDescription>{sentimentError}</AlertDescription>
            </Alert>
          )}

          {sentiment && !isLoadingSentiment && (
             <div className="animate-in fade-in-50 duration-500">
                <div className="flex items-center gap-2 mb-4 text-primary">
                    <Newspaper className="w-5 h-5" />
                    <h3 className="font-semibold">Analysis for {selectedPair}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={cn("p-4 rounded-lg flex flex-col items-center justify-center text-center", sentimentColors[sentiment.sentiment])}>
                        {sentimentIcons[sentiment.sentiment]}
                        <p className="text-xl font-bold mt-2">{sentiment.sentiment}</p>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="font-semibold mb-1">Sentiment Summary</h4>
                        <p className="text-sm text-muted-foreground">{sentiment.summary}</p>
                    </div>
                </div>
             </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Market Sentiment Indicators</CardTitle>
            <CardDescription>Common indicators used to gauge overall market mood.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                While direct data feeds for these are not integrated, it's crucial to be aware of them. These indicators help gauge whether the market is overly fearful or greedy.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm mt-4">
                <li><span className="font-semibold">Fear & Greed Index:</span> Measures emotion across the market. Extreme fear can be a buying opportunity, while extreme greed can signal a correction is due.</li>
                <li><span className="font-semibold">Commitment of Traders (COT) Report:</span> Shows the positions of different types of traders. Can indicate how "crowded" a trade is.</li>
                <li><span className="font-semibold">Volatility Index (VIX):</span> Often called the "fear index" for stocks, its movements can have ripple effects in the forex market, indicating risk-on or risk-off sentiment.</li>
            </ul>
        </CardContent>
      </Card>

    </div>
  );
}
