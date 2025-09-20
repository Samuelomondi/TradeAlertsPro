
"use server";

import { z } from "zod";
import { generateTradeSignal } from "@/ai/flows/signal-generation-gen-ai";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatSignalMessage } from "@/lib/utils";
import { getMarketData } from "@/services/market-data";
import { getEconomicNews, type EconomicEvent } from "@/ai/flows/economic-news-flow";
import type { MarketDataSource, MarketDataSeries } from "@/services/market-data";
import { getNewsSentiment, type NewsSentimentOutput } from "@/ai/flows/news-sentiment-flow";
import type { TradeSignal } from "@/lib/types";
import { StrategyId } from "@/lib/constants";

const signalSchema = z.object({
  currencyPair: z.string(),
  timeframe: z.string(),
  strategy: z.custom<StrategyId>(),
  accountBalance: z.coerce.number(),
  riskPercentage: z.coerce.number(),
  geminiApiKey: z.string().optional(),
  twelveDataApiKey: z.string().optional(),
  telegramChatId: z.string().optional(),
});

export type GenerateSignalSuccess = {
    signal: TradeSignal;
    source: MarketDataSource;
    series: MarketDataSeries[];
}

const TELEGRAM_BOT_TOKEN = '8266783870:AAFSZzVpmeLykifAq1lLp5vS_rgz-_USiGA';
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
  
  const { geminiApiKey, twelveDataApiKey, telegramChatId, ...tradeInputs } = validatedFields.data;

  try {
    const marketData = await getMarketData(
      tradeInputs.currencyPair,
      tradeInputs.timeframe,
      twelveDataApiKey
    );

    const signal = await generateTradeSignal({ ...tradeInputs, marketData: marketData.latest });
    
    if (signal && marketData.source === 'live' && HOURLY_TIMEFRAMES.includes(tradeInputs.timeframe) && telegramChatId) {
        const message = formatSignalMessage(signal, tradeInputs.currencyPair, tradeInputs.timeframe, marketData.source);
        try {
            await sendTelegramMessage(message, { botToken: TELEGRAM_BOT_TOKEN, chatId: telegramChatId });
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
  geminiApiKey: z.string().optional(),
});

export async function getNewsEventsAction(data: { geminiApiKey?: string }): Promise<EconomicEvent[]> {
    const validated = ApiKeySchema.safeParse(data);
    if (!validated.success || !validated.data.geminiApiKey) {
        throw new Error("A Gemini API Key is required for this feature. Please add it in the App Settings.");
    }
    
    try {
        const news = await getEconomicNews({ geminiApiKey: validated.data.geminiApiKey });
        return news.events;
    } catch (error) {
        console.error("Error fetching news events:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch news events: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching news events.");
    }
}

const NewsSentimentActionSchema = z.object({
    currencyPair: z.string(),
    geminiApiKey: z.string().optional(),
});

export async function getNewsSentimentAction(data: { currencyPair: string, geminiApiKey?: string }): Promise<NewsSentimentOutput> {
    const validated = NewsSentimentActionSchema.safeParse(data);
     if (!validated.success || !validated.data.geminiApiKey) {
        throw new Error("A Gemini API Key is required for this feature. Please add it in the App Settings.");
    }
    
    try {
        const sentiment = await getNewsSentiment(validated.data as { currencyPair: string, geminiApiKey: string });
        return sentiment;
    } catch (error) {
        console.error(`Error fetching news sentiment for ${validated.data.currencyPair}:`, error);
        if (error instanceof Error) {
            throw new Error(`Failed to fetch sentiment: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching news sentiment.");
    }
}
