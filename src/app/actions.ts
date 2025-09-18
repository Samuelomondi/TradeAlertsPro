
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
  geminiApiKey: z.string().min(1, "Gemini API Key is required."),
  twelveDataApiKey: z.string().min(1, "Twelve Data API Key is required."),
});

export type GenerateSignalSuccess = {
    signal: TradeSignalOutput;
    source: MarketDataSource;
    series: MarketDataSeries[];
}

const TELEGRAM_BOT_TOKEN = '8266783870:AAFSZzVpmeLykifAq1lLp5vS_rgz-_USiGA';
const TELEGRAM_CHAT_ID = '531957996';
const HOURLY_TIMEFRAMES = ['1H', '4H', '1D', '1W'];

export async function generateSignalAction(formData: FormData): Promise<{ data?: GenerateSignalSuccess; error?: string; fields?: any; }> {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = signalSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input data.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { geminiApiKey, twelveDataApiKey, ...tradeInputs } = validatedFields.data;

  try {
    const marketData = await getMarketData(
      tradeInputs.currencyPair,
      tradeInputs.timeframe,
      twelveDataApiKey
    );

    const signal = await generateTradeSignal({ ...tradeInputs, marketData: marketData.latest });
    
    if (signal && marketData.source === 'live' && HOURLY_TIMEFRAMES.includes(tradeInputs.timeframe)) {
        const message = formatSignalMessage(signal, tradeInputs.currencyPair, tradeInputs.timeframe, marketData.source);
        try {
            await sendTelegramMessage(message, { botToken: TELEGRAM_BOT_TOKEN, chatId: TELEGRAM_CHAT_ID });
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

const ApiKeySchema = z.object({
  geminiApiKey: z.string().min(1, "Gemini API Key is required."),
});

export async function getNewsEventsAction(data: { geminiApiKey?: string }): Promise<EconomicEvent[]> {
    const validated = ApiKeySchema.safeParse(data);
    if (!validated.success) return [];
    
    try {
        const news = await getEconomicNews({ geminiApiKey: validated.data.geminiApiKey });
        return news.events;
    } catch (error) {
        console.error("Error fetching news events:", error);
        return [];
    }
}

const NewsSentimentActionSchema = z.object({
    currencyPair: z.string(),
    geminiApiKey: z.string().min(1, "Gemini API Key is required."),
});

export async function getNewsSentimentAction(data: { currencyPair: string, geminiApiKey?: string }): Promise<NewsSentimentOutput | null> {
    const validated = NewsSentimentActionSchema.safeParse(data);
    if (!validated.success) return null;
    
    try {
        const sentiment = await getNewsSentiment(validated.data);
        return sentiment;
    } catch (error) {
        console.error(`Error fetching news sentiment for ${validated.data.currencyPair}:`, error);
        return null;
    }
}
