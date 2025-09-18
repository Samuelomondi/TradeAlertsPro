// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow that uses an LLM to confirm or deny a trade signal
 * based on MACD and Bollinger Bands, providing a quick assessment of signal validity.
 *
 * @example
 * // Example usage:
 * const confirmation = await confirmTradeSignal({
 *   macdCondition: 'MACD is bullish',
 *   bollingerCondition: 'Price is near the lower Bollinger Band',
 * });
 *
 * @param input - The input for the trade signal confirmation.
 * @returns The trade signal confirmation result.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfirmTradeSignalInputSchema = z.object({
  macdCondition: z.string().describe('The condition of the MACD indicator.'),
  bollingerCondition: z.string().describe('The condition of the Bollinger Bands.'),
});
export type ConfirmTradeSignalInput = z.infer<typeof ConfirmTradeSignalInputSchema>;

const ConfirmTradeSignalOutputSchema = z.object({
  macdConfirmation: z.boolean().describe('Whether the MACD condition confirms the trade signal.'),
  bollingerConfirmation: z.boolean().describe('Whether the Bollinger Bands condition confirms the trade signal.'),
});
export type ConfirmTradeSignalOutput = z.infer<typeof ConfirmTradeSignalOutputSchema>;

export async function confirmTradeSignal(input: ConfirmTradeSignalInput): Promise<ConfirmTradeSignalOutput> {
  return confirmTradeSignalFlow(input);
}

const confirmTradeSignalPrompt = ai.definePrompt({
  name: 'confirmTradeSignalPrompt',
  input: {schema: ConfirmTradeSignalInputSchema},
  output: {schema: ConfirmTradeSignalOutputSchema},
  prompt: `You are a financial analyst who confirms or denies trade signals based on technical indicators.

  Given the following conditions for MACD and Bollinger Bands, determine whether each indicator confirms the trade signal.

  Respond with JSON.  For each indicator, set the confirmation field to true if the indicator confirms the signal, and false if it does not.

  MACD Condition: {{{macdCondition}}}
  Bollinger Bands Condition: {{{bollingerCondition}}}
  `,
});

const confirmTradeSignalFlow = ai.defineFlow(
  {
    name: 'confirmTradeSignalFlow',
    inputSchema: ConfirmTradeSignalInputSchema,
    outputSchema: ConfirmTradeSignalOutputSchema,
  },
  async input => {
    const {output} = await confirmTradeSignalPrompt(input);
    return output!;
  }
);
