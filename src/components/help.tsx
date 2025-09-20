
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const faqItems = [
  {
    question: "What API keys do I need and why?",
    answer: "You need two primary API keys: a Gemini API Key (for Google AI Studio) to power AI features like news sentiment analysis, and a Twelve Data API Key to fetch live market data for signal generation. A Telegram Chat ID is optional if you wish to receive trade signals as notifications.",
  },
  {
    question: "Are my API keys secure?",
    answer: "Yes. Your API keys are stored exclusively in your browser's local storage. They are never sent to our servers. They are only used to make direct calls from your browser (or our server-side functions) to the respective API providers (Google AI and Twelve Data).",
  },
  {
    question: "How are trade signals generated?",
    answer: "Signals are generated using deterministic technical analysis rules, not AI. The system analyzes a combination of technical indicators: EMA (20/50) for trend direction, RSI (14) for momentum, and ATR (14) for volatility. The chosen strategy (Trend, Reversion, Breakout) determines the specific entry conditions.",
  },
  {
    question: "What do the different strategies mean?",
    answer: "Each strategy uses a different logic to find trading opportunities: \n- **Trend Following:** Aims to trade in the direction of the main trend, buying in an uptrend or selling in a downtrend. \n- **Mean Reversion:** Assumes that prices will revert to their average. It looks for oversold conditions in an uptrend (a buying opportunity) or overbought conditions in a downtrend (a selling opportunity). \n- **Breakout:** Triggers a trade when the price breaks above or below a key level, in this case, the Bollinger Bands, anticipating a strong move in that direction.",
  },
    {
    question: "What do the confirmations (MACD, Bollinger) mean?",
    answer: "Confirmations provide a secondary check on the signal's strength. A green check (✅) means the indicator supports the signal's direction (e.g., bullish MACD on a 'Buy' signal). A red cross (❌) indicates a divergence that might suggest a weaker signal.",
  },
  {
    question: "Why does the app use mock data sometimes?",
    answer: "The forex market is closed on weekends (from Friday evening to Sunday evening UTC). When the market is closed, the application automatically switches to using mock data. This allows you to continue practicing and generating signals without needing a live connection. The 'Market Status' indicator on the signal card will always tell you which data source is being used.",
  },
    {
    question: "What is the 'Optimal Conditions' indicator?",
    answer: "This indicator on the signal generation card tells you if the most relevant market session overlap for your selected currency pair is currently active. Overlaps, like the London/New York session, typically have the highest trading volume and volatility, which can be optimal for trading. A green 'Optimal' status means the session is active.",
  },
   {
    question: "How does the News & Sentiment page work?",
    answer: "This page uses AI (Gemini) for two purposes: 1) To generate a list of upcoming high-impact economic events that could cause market volatility. 2) To analyze recent news headlines for a specific currency pair and provide a 'Positive', 'Negative', or 'Neutral' sentiment score, helping you gauge the current market mood.",
  },
  {
    question: "How do I use the Trade History and Performance sections?",
    answer: "The history page logs every signal you generate. You can click the status badge ('Open', 'Won', 'Lost') on this page to cycle through and mark the outcome of your trades. The Performance dashboard automatically calculates your total trades, wins, losses, and win rate based on the statuses you've set in the history.",
  },
  {
    question: "Does the application execute trades automatically?",
    answer: "No. This is purely a signal generation and analysis tool. It provides trade ideas and relevant market context. You are always responsible for deciding whether to take a trade and for manually executing it on your own trading platform.",
  },
];

export default function Help() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help &amp; FAQ</CardTitle>
        <CardDescription>Find answers to common questions about the TradeAlert application.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
