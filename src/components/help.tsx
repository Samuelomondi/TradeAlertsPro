
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const faqItems = [
  {
    question: "How are trade signals generated?",
    answer: "Trade signals are generated using a GenAI model that analyzes a combination of technical indicators: EMA (20/50) for trend, RSI (14) for momentum, and ATR (14) for volatility. MACD and Bollinger Bands are used as additional confirmations to filter the signals.",
  },
  {
    question: "What do the confirmations (MACD, Bollinger) mean?",
    answer: "A green checkmark (✅) means the indicator's condition aligns with and supports the generated trade signal (e.g., bullish MACD on a 'Buy' signal). A red cross (❌) indicates a divergence that might suggest a weaker or less reliable signal.",
  },
  {
    question: "How does the Risk Calculator work?",
    answer: "The calculator determines the appropriate lot size for a trade. It uses your account balance, desired risk percentage, and the stop loss distance in pips to calculate a position size that ensures you only risk the percentage you've specified.",
  },
  {
    question: "Does the bot execute trades automatically?",
    answer: "No, this is a signal-providing bot only. It generates and sends trade ideas to your Telegram. You are responsible for reviewing the signal and manually executing the trade in your own trading platform.",
  },
    {
    question: "What do I do if I receive a signal?",
    answer: "1. Review the signal details. 2. Perform your own analysis to confirm if you agree with the trade idea. 3. Use the Risk Calculator to determine your position size. 4. Manually place the trade on your trading platform. Never trade a signal blindly.",
  },
];

export default function Help() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Help & FAQ</CardTitle>
        <CardDescription>Find answers to common questions about the TradeAlert bot.</CardDescription>
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
