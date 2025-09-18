
"use server";

import { z } from "zod";
import { generateTradeSignal, type TradeSignalOutput } from "@/ai/flows/signal-generation-gen-ai";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatSignalMessage } from "@/lib/utils";
import { getMarketData, getHistoricalData } from "@/services/market-data";
import { getEconomicNews, type EconomicEvent } from "@/ai/flows/economic-news-flow";
import type { MarketDataSource, HistoricalDataPoint } from "@/services/market-data";
import type { BacktestResults } from "@/lib/types";

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

    // Allow mock data to generate a signal for demonstration purposes.
    // The UI will indicate that the data source is 'mock'.
    const signal = await generateTradeSignal({ ...validatedFields.data, marketData: marketData.latest });
    
    if (signal && marketData.source === 'live') {
        const message = formatSignalMessage(signal, validatedFields.data.currencyPair, validatedFields.data.timeframe, marketData.source);
        try {
            await sendTelegramMessage(message);
        } catch (telegramError) {
            console.error("Failed to send Telegram message:", telegramError);
            // Non-fatal, don't block the UI for this
        }
    }

    const response: GenerateSignalSuccess = { signal, source: marketData.source };
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


const backtestSchema = z.object({
  currencyPair: z.string(),
  timeframe: z.string(),
  accountBalance: z.coerce.number(),
  riskPercentage: z.coerce.number(),
});


export async function runBacktestAction(formData: FormData): Promise<{ data?: BacktestResults, error?: string }> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = backtestSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { error: "Invalid backtest parameters." };
    }

    const { currencyPair, timeframe, accountBalance, riskPercentage } = validatedFields.data;

    try {
        const historicalData = await getHistoricalData(currencyPair, timeframe, 50);

        if (historicalData.length < 50) { // Not enough data to be meaningful
            return { error: "Not enough historical data available to run a meaningful backtest. Try a different timeframe." };
        }

        let wins = 0;
        let losses = 0;
        let totalWinAmount = 0;
        let totalLossAmount = 0;
        let activeTrade: { signal: TradeSignalOutput, type: 'Buy' | 'Sell' } | null = null;
        
        for (let i = 1; i < historicalData.length; i++) {
            const currentCandle = historicalData[i];
            const previousCandle = historicalData[i - 1];

            // 1. Check if an active trade should be closed
            if (activeTrade) {
                let tradeClosed = false;
                if (activeTrade.type === 'Buy') {
                    if (currentCandle.low <= activeTrade.signal.stopLoss) {
                        // Trade lost
                        losses++;
                        const lossAmount = (activeTrade.signal.entry - activeTrade.signal.stopLoss) * 100000 * activeTrade.signal.lotSize; // Simplified pip calculation
                        totalLossAmount += lossAmount;
                        tradeClosed = true;
                    } else if (currentCandle.high >= activeTrade.signal.takeProfit) {
                        // Trade won
                        wins++;
                        const winAmount = (activeTrade.signal.takeProfit - activeTrade.signal.entry) * 100000 * activeTrade.signal.lotSize;
                        totalWinAmount += winAmount;
                        tradeClosed = true;
                    }
                } else { // Sell trade
                    if (currentCandle.high >= activeTrade.signal.stopLoss) {
                        // Trade lost
                        losses++;
                        const lossAmount = (activeTrade.signal.stopLoss - activeTrade.signal.entry) * 100000 * activeTrade.signal.lotSize;
                        totalLossAmount += lossAmount;
                        tradeClosed = true;
                    } else if (currentCandle.low <= activeTrade.signal.takeProfit) {
                        // Trade won
                        wins++;
                        const winAmount = (activeTrade.signal.entry - activeTrade.signal.takeProfit) * 100000 * activeTrade.signal.lotSize;
                        totalWinAmount += winAmount;
                        tradeClosed = true;
                    }
                }
                if (tradeClosed) {
                    activeTrade = null;
                }
            }

            // 2. Check if a new trade should be opened (only if no trade is active)
            if (!activeTrade) {
                 const marketDataForSignal: HistoricalDataPoint = {
                    ...previousCandle,
                    currentPrice: previousCandle.currentPrice, // Use previous close as current price for signal
                };
                
                const signal = await generateTradeSignal({
                    currencyPair,
                    timeframe,
                    accountBalance,
                    riskPercentage,
                    marketData: marketDataForSignal
                });

                if (signal.signal === 'Buy' || signal.signal === 'Sell') {
                    activeTrade = { signal, type: signal.signal };
                }
            }
        }
        
        const totalTrades = wins + losses;
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const netProfit = totalWinAmount - totalLossAmount;
        
        const results: BacktestResults = {
            currencyPair,
            timeframe,
            totalTrades,
            wins,
            losses,
            winRate,
            netProfit,
            avgWin: wins > 0 ? totalWinAmount / wins : 0,
            avgLoss: losses > 0 ? totalLossAmount / losses : 0,
            barsAnalyzed: historicalData.length
        };

        return { data: results };

    } catch (error) {
        console.error("Backtest failed:", error);
        let errorMessage = "An unknown error occurred during the backtest.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { error: `Failed to run backtest: ${errorMessage}` };
    }
}
