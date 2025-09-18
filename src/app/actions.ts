"use server";

import { z } from "zod";
import { generateTradeSignal } from "@/ai/flows/signal-generation-gen-ai";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatSignalMessage } from "@/lib/utils";
import { getMarketData } from "@/services/market-data";
import { getEconomicNews, type EconomicEvent } from "@/ai/flows/economic-news-flow";

const signalSchema = z.object({
  currencyPair: z.string(),
  timeframe: z.string(),
  accountBalance: z.coerce.number(),
  riskPercentage: z.coerce.number(),
});

export async function generateSignalAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = signalSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input data.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { data: marketData, source } = await getMarketData(
      validatedFields.data.currencyPair,
      validatedFields.data.timeframe
    );
    const signal = await generateTradeSignal({ ...validatedFields.data, marketData });
    
    if (signal) {
        const message = formatSignalMessage(signal, validatedFields.data.currencyPair, validatedFields.data.timeframe, source);
        try {
            await sendTelegramMessage(message);
        } catch (telegramError) {
            console.error("Failed to send Telegram message:", telegramError);
            // Non-fatal, we can still return the signal to the UI
        }
    }

    return { data: signal, source };
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
