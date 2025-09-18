import { config } from 'dotenv';
config();

import '@/ai/flows/signal-generation-gen-ai.ts';
import '@/ai/flows/economic-news-flow.ts';
import '@/ai/flows/news-sentiment-flow.ts';
