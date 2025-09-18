import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TradeSignal } from "./types";
import type { MarketDataSource } from "@/services/market-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
}

export function formatSignalMessage(signal: TradeSignal, currencyPair: string, timeframe: string, source: MarketDataSource): string {
    const rrr = signal.entry !== signal.stopLoss ? Math.abs((signal.takeProfit - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(2) : 'N/A';
    const sourceIndicator = source === 'live' ? '✅ Live' : '⚠️ Mock';
    const signalEmoji = signal.signal === 'Buy' ? '📈' : '📉';

    return `
*New Signal: ${currencyPair} (${timeframe})*
*Direction:* ${signal.signal} ${signalEmoji}
----------------------------------------
- *Entry:* \`${signal.entry.toFixed(5)}\`
- *Stop Loss:* \`${signal.stopLoss.toFixed(5)}\`
- *Take Profit:* \`${signal.takeProfit.toFixed(5)}\`
----------------------------------------
*Risk/Reward Ratio:* ${rrr}
*Lot Size:* ${signal.lotSize.toFixed(2)}
----------------------------------------
*Analysis:*
- *Trend:* ${signal.trend}
- *MACD:* ${signal.macdConfirmation ? 'Confirmed ✅' : 'Divergent ❌'}
- *Bollinger:* ${signal.bollingerConfirmation ? 'Confirmed ✅' : 'Divergent ❌'}
- *Data:* ${sourceIndicator}

*Generated: ${formatDate(new Date())}*
    `.trim();
}
