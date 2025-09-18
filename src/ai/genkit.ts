
import {genkit, Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Base initialization without plugins for global use (e.g., definePrompt).
export const ai = genkit();

/**
 * Reconfigures and returns a new Genkit instance with the Google AI plugin
 * initialized with the provided API key.
 *
 * @param apiKey The Google AI API key.
 * @returns A configured Genkit instance.
 */
export function configureGenkit(apiKey: string): Genkit {
    return genkit({
        plugins: [googleAI({
            apiVersion: 'v1beta',
            apiKey: apiKey
        })],
        model: 'googleai/gemini-2.5-flash',
    });
}
