

'use server';
/**
 * @fileOverview Generates trade signals using a logic-based function based on a currency pair and timeframe.
 *
 * - generateTradeSignal - A function that generates a trade signal.
 * - TradeSignalInput - The input type for the generateTradeSignal function.
 * - TradeSignalOutput - The return type for the generateTradeSignal function.
 */
import {LatestIndicators, LatestIndicatorsSchema} from '@/services/market-data';
import {z} from 'genkit';
import { StrategyId } from '@/lib/constants';

const TradeSignalInputSchema = z.object({
  currencyPair: z.string().describe('The currency pair to analyze (e.g., EUR/USD).'),
  timeframe: z.string().describe('The timeframe for analysis (e.g., 1H, 4H, 1D).'),
  strategy: z.custom<StrategyId>().describe('The trading strategy to use.'),
  accountBalance: z.number().describe('The account balance for risk calculation.'),
  riskPercentage: z.number().describe('The risk percentage for lot size calculation.'),
  marketData: LatestIndicatorsSchema,
});

export type TradeSignalInput = z.infer<typeof TradeSignalInputSchema>;

const TradeSignalOutputSchema = z.object({
  trend: z.string().describe('The identified trend (e.g., Bullish, Bearish, Neutral).'),
  signal: z.string().describe('The trade signal (e.g., Buy, Sell, Hold).'),
  strategy: z.custom<StrategyId>().describe('The trading strategy used.'),
  entry: z.number().describe('The recommended entry price.'),
  stopLoss: z.number().describe('The recommended stop loss price.'),
  takeProfit: z.number().describe('The recommended take profit price.'),
  lotSize: z.number().describe('The calculated lot size for the trade.'),
  macdConfirmation: z.boolean().describe('Whether MACD conditions confirm the signal.'),
  bollingerConfirmation: z.boolean().describe('Whether Bollinger Band conditions confirm the signal.'),
});

export type TradeSignalOutput = z.infer<typeof TradeSignalOutputSchema>;

/**
 * Generates a trade signal based on deterministic technical analysis rules.
 * @param input The trade signal input containing market data and risk parameters.
 * @returns A promise that resolves to the generated trade signal.
 */
export async function generateTradeSignal(input: TradeSignalInput): Promise<TradeSignalOutput> {
  const { marketData, accountBalance, riskPercentage, currencyPair, strategy } = input;
  const { currentPrice, ema20, ema50, rsi, atr, macdHistogram, bollingerUpper, bollingerLower } = marketData;

  // 1. Determine Trend
  let trend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
  if (ema20 > ema50) {
    trend = 'Bullish';
  } else if (ema20 < ema50) {
    trend = 'Bearish';
  }

  // 2. Determine Signal based on Strategy
  let signal: 'Buy' | 'Sell' | 'Hold' = 'Hold';
  switch (strategy) {
      case 'trend':
        if (trend === 'Bullish' && rsi < 70) signal = 'Buy';
        else if (trend === 'Bearish' && rsi > 30) signal = 'Sell';
        break;
      case 'reversion':
        if (trend === 'Bullish' && rsi < 30) signal = 'Buy'; // Oversold in uptrend
        else if (trend === 'Bearish' && rsi > 70) signal = 'Sell'; // Overbought in downtrend
        break;
      case 'breakout':
         if (currentPrice > bollingerUpper) signal = 'Buy';
         else if (currentPrice < bollingerLower) signal = 'Sell';
         break;
  }

  // 3. Calculate Entry, Stop Loss, and Take Profit
  const entry = currentPrice;
  let stopLoss = entry;
  let takeProfit = entry;
  const riskRewardRatio = 1.5;
  const atrMultiplier = 1.5;

  if (signal === 'Buy') {
    stopLoss = entry - (atr * atrMultiplier);
    takeProfit = entry + (entry - stopLoss) * riskRewardRatio;
  } else if (signal === 'Sell') {
    stopLoss = entry + (atr * atrMultiplier);
    takeProfit = entry - (stopLoss - entry) * riskRewardRatio;
  }

  // 4. Calculate Lot Size
  let lotSize = 0;
  const riskAmount = accountBalance * (riskPercentage / 100);
  const stopLossPips = Math.abs(entry - stopLoss) * (currencyPair.includes('JPY') ? 100 : 10000);
  
  if (stopLossPips > 0) {
    const pipValue = 10; // Assume $10 per standard lot
    lotSize = riskAmount / (stopLossPips * pipValue);
  }
  
  lotSize = Math.max(0.01, Math.min(lotSize, 100));
  if (signal === 'Hold') {
      lotSize = 0;
  }

  // 5. Determine Confirmations
  const macdConfirmation = (signal === 'Buy' && macdHistogram > 0) || (signal === 'Sell' && macdHistogram < 0);
  const bollingerConfirmation = (signal === 'Buy' && currentPrice < ema20) || (signal === 'Sell' && currentPrice > ema20);


  return {
    trend,
    signal,
    strategy,
    entry,
    stopLoss,
    takeProfit,
    lotSize,
    macdConfirmation,
    bollingerConfirmation,
  };
}
