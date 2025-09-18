"use server";

import { z } from "zod";
import { generateTradeSignal } from "@/ai/flows/signal-generation-gen-ai";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatSignalMessage } from "@/lib/utils";
import { getMarketData } from "@/services/market-data";

const signalSchema = z.object({
  currencyPair: z.string(),
  timeframe: z.string(),
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
    const { data: marketData, source } = await getMarketData(
      validatedFields.data.currencyPair,
      validatedFields.data.timeframe
    );
    const signal = await generateTradeSignal({ ...validatedFields.data, marketData });
    
    if (signal) {
        const message = formatSignalMessage(signal, validatedFields.data.currencyPair, validatedFields.data.timeframe, source);
        try {
            await sendTelegramMessage(message);
        } catch (telegramError) {
            console.error("Failed to send Telegram message:", telegramError);
            // Non-fatal, we can still return the signal to the UI
        }
    }

    return { data: signal, source };
  } catch (error) {
    console.error("Error generating trade signal:", error);
    return {
      error: "Failed to generate trade signal. Please try again.",
    };
  }
}
