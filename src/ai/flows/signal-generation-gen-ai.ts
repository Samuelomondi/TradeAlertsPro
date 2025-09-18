

'use server';
/**
 * @fileOverview Generates trade signals using a GenAI model based on a currency pair and timeframe.
 *
 * - generateTradeSignal - A function that generates a trade signal.
 * - TradeSignalInput - The input type for the generateTradeSignal function.
 * - TradeSignalOutput - The return type for the generateTradeSignal function.
 */

import {ai} from '@/ai/genkit';
import {LatestIndicators, LatestIndicatorsSchema} from '@/services/market-data';
import {z} from 'genkit';

const TradeSignalInputSchema = z.object({
  currencyPair: z.string().describe('The currency pair to analyze (e.g., EUR/USD).'),
  timeframe: z.string().describe('The timeframe for analysis (e.g., 1H, 4H, 1D).'),
  accountBalance: z.number().describe('The account balance for risk calculation.'),
  riskPercentage: z.number().describe('The risk percentage for lot size calculation.'),
  marketData: LatestIndicatorsSchema,
});

export type TradeSignalInput = z.infer<typeof TradeSignalInputSchema>;

const TradeSignalOutputSchema = z.object({
  trend: z.string().describe('The identified trend (e.g., Bullish, Bearish, Neutral).'),
  signal: z.string().describe('The trade signal (e.g., Buy, Sell, Hold).'),
  entry: z.number().describe('The recommended entry price.'),
  stopLoss: z.number().describe('The recommended stop loss price.'),
  takeProfit: z.number().describe('The recommended take profit price.'),
  lotSize: z.number().describe('The calculated lot size for the trade.'),
  macdConfirmation: z.boolean().describe('Whether MACD conditions confirm the signal.'),
  bollingerConfirmation: z.boolean().describe('Whether Bollinger Band conditions confirm the signal.'),
});

export type TradeSignalOutput = z.infer<typeof TradeSignalOutputSchema>;

export async function generateTradeSignal(input: TradeSignalInput): Promise<TradeSignalOutput> {
  return generateTradeSignalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tradeSignalPrompt',
  input: {schema: TradeSignalInputSchema},
  output: {schema: TradeSignalOutputSchema},
  prompt: `You are an expert trading signal generator.
Analyze the provided technical indicator values for the given currency pair and timeframe to create a trade signal.

Currency Pair: {{{currencyPair}}}
Timeframe: {{{timeframe}}}
Account Balance: {{{accountBalance}}}
Risk Percentage: {{{riskPercentage}}}

Technical Indicators:
- Current Price: {{{marketData.currentPrice}}}
- EMA (20): {{{marketData.ema20}}}
- EMA (50): {{{marketData.ema50}}}
- RSI (14): {{{marketData.rsi}}}
- ATR (14): {{{marketData.atr}}}
- MACD Histogram: {{{marketData.macdHistogram}}}
- Bollinger Upper Band: {{{marketData.bollingerUpper}}}
- Bollinger Lower Band: {{{marketData.bollingerLower}}}

Your analysis should consider the following:
- Trend: Determine the trend based on EMA crossovers (20 above 50 is bullish, 20 below 50 is bearish).
- RSI:  Over 70 is overbought, below 30 is oversold.

Based on this analysis, provide:
- Trend (Bullish, Bearish, or Neutral)
- Signal (Buy, Sell, or Hold)
- Entry Price (Based on current price and trend)
- Stop Loss Price (Use ATR to set a logical stop loss)
- Take Profit Price (Aim for at least a 1.5:1 risk/reward ratio)

Also, provide boolean confirmations for MACD and Bollinger Bands:
- macdConfirmation: Set to true if the MACD Histogram supports your signal (e.g., positive for a Buy, negative for a Sell).
- bollingerConfirmation: Set to true if the price location relative to the bands supports your signal (e.g., near the lower band for a Buy, near the upper band for a Sell).

Finally, calculate the lot size for the trade. Assume a standard pip value of $10 per lot.
The formula is: Lot Size = (Account Balance * (Risk Percentage / 100)) / (Stop Loss in Pips * Pip Value)
Stop Loss in Pips = abs(Entry Price - Stop Loss Price) * 10000 (for most pairs).
`,
});

const generateTradeSignalFlow = ai.defineFlow(
  {
    name: 'generateTradeSignalFlow',
    inputSchema: TradeSignalInputSchema,
    outputSchema: TradeSignalOutputSchema,
  },
  async input => {
    // Generate the core trade signal first
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate trade signal.");
    }
    return output;
  }
);
