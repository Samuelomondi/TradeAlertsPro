"use server";

import { z } from "zod";
import { generateTradeSignal } from "@/ai/flows/signal-generation-gen-ai";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatSignalMessage } from "@/lib/utils";

const signalSchema = z.object({
  currencyPair: z.string(),
  timeframe: z.string(),
  currentPrice: z.coerce.number(),
  ema20: z.coerce.number(),
  ema50: z.coerce.number(),
  rsi14: z.coerce.number(),
  atr14: z.coerce.number(),
  macdHistogram: z.coerce.number(),
  bollingerUpper: z.coerce.number(),
  bollingerLower: z.coerce.number(),
});

export async function generateSignalAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  const validatedFields = signalSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: "Invalid input data.",
      fields: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const signal = await generateTradeSignal(validatedFields.data);
    
    if (signal) {
        const message = formatSignalMessage(signal, validatedFields.data.currencyPair, validatedFields.data.timeframe, validatedFields.data.rsi14);
        try {
            await sendTelegramMessage(message);
        } catch (telegramError) {
            console.error("Failed to send Telegram message:", telegramError);
            // Non-fatal, we can still return the signal to the UI
        }
    }

    return { data: signal };
  } catch (error) {
    console.error("Error generating trade signal:", error);
    return {
      error: "Failed to generate trade signal. Please try again.",
    };
  }
}
