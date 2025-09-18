'use server';
/**
 * @fileOverview Generates trade signals using a GenAI model based on a currency pair and timeframe.
 *
 * - generateTradeSignal - A function that generates a trade signal.
 * - TradeSignalInput - The input type for the generateTradeSignal function.
 * - TradeSignalOutput - The return type for the generateTradeSignal function.
 */

import {ai} from '@/ai/genkit';
import {MarketData, MarketDataSchema} from '@/services/market-data';
import {z} from 'genkit';

const TradeSignalInputSchema = z.object({
  currencyPair: z.string().describe('The currency pair to analyze (e.g., EUR/USD).'),
  timeframe: z.string().describe('The timeframe for analysis (e.g., 1H, 4H, 1D).'),
  marketData: MarketDataSchema,
});

export type TradeSignalInput = z.infer<typeof TradeSignalInputSchema>;

const TradeSignalOutputSchema = z.object({
  trend: z.string().describe('The identified trend (e.g., Bullish, Bearish, Neutral).'),
  signal: z.string().describe('The trade signal (e.g., Buy, Sell, Hold).'),
  entry: z.number().describe('The recommended entry price.'),
  stopLoss: z.number().describe('The recommended stop loss price.'),
  takeProfit: z.number().describe('The recommended take profit price.'),
  macdConfirmation: z.boolean().describe('Whether MACD conditions confirm the signal.'),
  bollingerConfirmation: z.boolean().describe('Whether Bollinger Band conditions confirm the signal.'),
});

export type TradeSignalOutput = z.infer<typeof TradeSignalOutputSchema>;

export async function generateTradeSignal(input: TradeSignalInput): Promise<TradeSignalOutput> {
  return generateTradeSignalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tradeSignalPrompt',
  input: {schema: z.intersection(TradeSignalInputSchema.omit({marketData: true}), MarketDataSchema)},
  output: {schema: TradeSignalOutputSchema},
  prompt: `You are an expert trading signal generator.
Analyze the provided technical indicator values for the given currency pair and timeframe to create a trade signal.

Currency Pair: {{{currencyPair}}}
Timeframe: {{{timeframe}}}

Technical Indicators:
- Current Price: {{{currentPrice}}}
- EMA (20): {{{ema20}}}
- EMA (50): {{{ema50}}}
- RSI (14): {{{rsi}}}
- ATR (14): {{{atr}}}
- MACD Histogram: {{{macdHistogram}}}
- Bollinger Upper Band: {{{bollingerUpper}}}
- Bollinger Lower Band: {{{bollingerLower}}}

Your analysis should consider the following:
- Trend: Determine the trend based on EMA crossovers (20 above 50 is bullish, 20 below 50 is bearish).
- RSI:  Over 70 is overbought, below 30 is oversold.
- MACD: Use the MACD Histogram to confirm the signal. (Positive values indicate bullish momentum, negative values indicate bearish momentum.)
- Bollinger Bands: Use Bollinger Bands to confirm potential overbought or oversold conditions.

Based on this analysis, provide:
- Trend (Bullish, Bearish, or Neutral)
- Signal (Buy, Sell, or Hold)
- Entry Price
- Stop Loss Price
- Take Profit Price
- macdConfirmation (true/false): meets predefined conditions
- bollingerConfirmation (true/false): meets predefined conditions`,
});

const generateTradeSignalFlow = ai.defineFlow(
  {
    name: 'generateTradeSignalFlow',
    inputSchema: TradeSignalInputSchema,
    outputSchema: TradeSignalOutputSchema,
  },
  async input => {
    // Market data is now passed into the flow
    const combinedInput = {
      ...input,
      ...input.marketData,
    };

    // Combine input and market data to call the prompt
    const {output} = await prompt(combinedInput);
    return output!;
  }
);
