
"use server";

import { z } from "zod";
import { generateTradeSignal, type TradeSignalOutput } from "@/ai/flows/signal-generation-gen-ai";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatSignalMessage } from "@/lib/utils";
import { getMarketData } from "@/services/market-data";
import { getEconomicNews, type EconomicEvent } from "@/ai/flows/economic-news-flow";
import type { MarketDataSource, MarketDataSeries } from "@/services/market-data";
import { getNewsSentiment, type NewsSentimentOutput } from "@/ai/flows/news-sentiment-flow";

const signalSchema = z.object({
  currencyPair: z.string(),
  timeframe: z.string(),
  accountBalance: z.coerce.number(),
  riskPercentage: z.coerce.number(),
});

export type GenerateSignalSuccess = {
    signal: TradeSignalOutput;
    source: MarketDataSource;
    series: MarketDataSeries[];
}

export async function generateSignalAction(formData: FormData): Promise<{ data?: GenerateSignalSuccess; error?: string; fields?: any; }> {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = signalSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input data.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const marketData = await getMarketData(
      validatedFields.data.currencyPair,
      validatedFields.data.timeframe
    );

    const signal = await generateTradeSignal({ ...validatedFields.data, marketData: marketData.latest });
    
    if (signal && marketData.source === 'live') {
        const message = formatSignalMessage(signal, validatedFields.data.currencyPair, validatedFields.data.timeframe, marketData.source);
        try {
            await sendTelegramMessage(message);
        } catch (telegramError) {
            console.error("Failed to send Telegram message:", telegramError);
        }
    }

    const response: GenerateSignalSuccess = { signal, source: marketData.source, series: marketData.series };
    return { data: response };

  } catch (error) {
    console.error("Error generating trade signal:", error);
    
    let errorMessage = "An unknown error occurred while generating the signal.";
    if (error instanceof Error) {
        if (error.message.includes('503') || error.message.toLowerCase().includes('overloaded')) {
            errorMessage = "The AI model is currently busy. Please wait a moment and try again.";
        } else {
            errorMessage = error.message;
        }
    }
    
    return {
      error: `Failed to generate trade signal: ${errorMessage}`,
    };
  }
}

export type ServiceStatus = 'Configured' | 'Not Configured';

export interface SystemStatus {
  gemini: ServiceStatus;
  twelveData: ServiceStatus;
  telegram: ServiceStatus;
}

export async function getSystemStatus(): Promise<SystemStatus> {
    return {
        gemini: (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0) ? 'Configured' : 'Not Configured',
        twelveData: (process.env.TWELVE_DATA_API_KEY && process.env.TWELVE_DATA_API_KEY.length > 0) ? 'Configured' : 'Not Configured',
        telegram: (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.length > 0 && process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID.length > 0) ? 'Configured' : 'Not Configured'
    };
}

export async function getNewsEventsAction(): Promise<EconomicEvent[]> {
    try {
        const news = await getEconomicNews();
        return news.events;
    } catch (error) {
        console.error("Error fetching news events:", error);
        return [];
    }
}

export async function getNewsSentimentAction(currencyPair: string): Promise<NewsSentimentOutput | null> {
    try {
        const sentiment = await getNewsSentiment({ currencyPair });
        return sentiment;
    } catch (error) {
        console.error(`Error fetching news sentiment for ${currencyPair}:`, error);
        return null;
    }
}
