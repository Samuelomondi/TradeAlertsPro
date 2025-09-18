
"use server";

import { z } from "zod";
import { generateTradeSignal, type TradeSignalOutput } from "@/ai/flows/signal-generation-gen-ai";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatSignalMessage } from "@/lib/utils";
import { getMarketData } from "@/services/market-data";
import { getEconomicNews, type EconomicEvent } from "@/ai/flows/economic-news-flow";
import type { MarketDataSource } from "@/services/market-data";

const signalSchema = z.object({
  currencyPair: z.string(),
  timeframe: z.string(),
  accountBalance: z.coerce.number(),
  riskPercentage: z.coerce.number(),
});

type GenerateSignalSuccess = {
    signal: TradeSignalOutput;
    source: MarketDataSource;
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

    // If data source is mock, we return an explicit error for the UI to handle.
    if (marketData.source === 'mock') {
        return { error: "Failed to fetch live market data. Please check your API configuration or try again later. No signal was generated." };
    }

    const signal = await generateTradeSignal({ ...validatedFields.data, marketData: marketData.latest });
    
    if (signal) {
        const message = formatSignalMessage(signal, validatedFields.data.currencyPair, validatedFields.data.timeframe, marketData.source);
        try {
            await sendTelegramMessage(message);
        } catch (telegramError) {
            console.error("Failed to send Telegram message:", telegramError);
            // Non-fatal, we can still return the signal to the UI
        }
    }

    const response: GenerateSignalSuccess = { signal, source: marketData.source };
    return { data: response };

  } catch (error) {
    console.error("Error generating trade signal:", error);
    return {
      error: "Failed to generate trade signal. Please try again.",
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
        gemini: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY" ? 'Configured' : 'Not Configured',
        twelveData: process.env.TWELVE_DATA_API_KEY && process.env.TWELVE_DATA_API_KEY !== "YOUR_TWELVE_DATA_API_KEY" ? 'Configured' : 'Not Configured',
        telegram: process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== "YOUR_TELEGRAM_BOT_TOKEN" ? 'Configured' : 'Not Configured'
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
