
// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow that analyzes recent news
 * for a given currency pair to determine the market sentiment.
 *
 * @example
 * // Example usage:
 * const sentiment = await getNewsSentiment({ currencyPair: 'EUR/USD' });
 * console.log(sentiment.sentiment);
 *
 * @param input - The currency pair to analyze.
 * @returns The determined sentiment and a summary.
 */

import {ai, configureGenkit} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const NewsSentimentInputSchema = z.object({
  currencyPair: z
    .string()
    .describe('The currency pair to analyze (e.g., EUR/USD).'),
  geminiApiKey: z.string().min(1, 'A Gemini API Key is required'),
});
export type NewsSentimentInput = z.infer<typeof NewsSentimentInputSchema>;

const NewsSentimentOutputSchema = z.object({
  sentiment: z
    .enum(['Positive', 'Neutral', 'Negative'])
    .describe('The overall sentiment based on the news.'),
  summary: z
    .string()
    .describe(
      'A brief, 1-2 sentence summary of the key news drivers affecting the sentiment.'
    ),
});
export type NewsSentimentOutput = z.infer<typeof NewsSentimentOutputSchema>;

export async function getNewsSentiment(
  input: NewsSentimentInput
): Promise<NewsSentimentOutput> {
  return getNewsSentimentFlow(input);
}

const getNewsSentimentPrompt = ai.definePrompt({
  name: 'getNewsSentimentPrompt',
  input: {schema: NewsSentimentInputSchema.omit({geminiApiKey: true})},
  output: {schema: NewsSentimentOutputSchema},
  model: googleAI.model('gemini-2.5-flash'),
  prompt: `You are a financial analyst specializing in forex markets. Your task is to analyze the most recent news and events related to the currency pair: {{{currencyPair}}}.

  Based on your analysis of very recent news headlines, economic data releases, and central bank statements, determine the overall market sentiment for this pair.

  1.  **Sentiment**: Is the current sentiment Positive (the base currency is likely to strengthen), Negative (the base currency is likely to weaken), or Neutral?
  2.  **Summary**: Provide a concise, one-to-two-sentence summary explaining the key reasons for your sentiment analysis. For example, mention if a recent data release was stronger/weaker than expected or if a central bank official made hawkish/dovish comments.

  Respond with JSON.
  `,
});

const getNewsSentimentFlow = ai.defineFlow(
  {
    name: 'getNewsSentimentFlow',
    inputSchema: NewsSentimentInputSchema,
    outputSchema: NewsSentimentOutputSchema,
  },
  async input => {
    const ai = configureGenkit(input.geminiApiKey);
    const {output} = await getNewsSentimentPrompt(input);
    return output!;
  }
);
