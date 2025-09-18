// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow that uses a generative AI model
 * to produce a list of upcoming high-impact economic news events.
 *
 * @example
 * // Example usage:
 * const news = await getEconomicNews();
 * console.log(news.events);
 *
 * @returns A list of key economic events.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EconomicEventSchema = z.object({
  name: z.string().describe('The name of the economic event (e.g., US Non-Farm Payroll).'),
  time: z.string().describe('The scheduled time of the event, including timezone (e.g., Friday, 08:30 EST).'),
});
export type EconomicEvent = z.infer<typeof EconomicEventSchema>;


const EconomicNewsOutputSchema = z.object({
  events: z.array(EconomicEventSchema).describe('A list of 3-5 key upcoming economic events.'),
});
export type EconomicNewsOutput = z.infer<typeof EconomicNewsOutputSchema>;

export async function getEconomicNews(): Promise<EconomicNewsOutput> {
  return getEconomicNewsFlow();
}

const getEconomicNewsPrompt = ai.definePrompt({
  name: 'getEconomicNewsPrompt',
  output: {schema: EconomicNewsOutputSchema},
  prompt: `You are a financial market analyst. Your task is to provide a list of 3 to 5 major, high-impact economic news events that are scheduled for the upcoming week.

  Focus on events that are known to cause significant volatility in the forex markets, such as interest rate decisions from major central banks (FOMC, ECB, BoJ), inflation reports (CPI), and employment data (NFP).

  For each event, provide the name and the scheduled time, including the day and timezone.
  `,
});

const getEconomicNewsFlow = ai.defineFlow(
  {
    name: 'getEconomicNewsFlow',
    outputSchema: EconomicNewsOutputSchema,
  },
  async () => {
    const {output} = await getEconomicNewsPrompt();
    return output!;
  }
);
