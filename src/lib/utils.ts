import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TradeSignal } from "./types";
import type { MarketDataSource } from "@/services/market-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
    return date.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

export function formatDateOnly(date: Date) {
    return date.toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    });
}

export function formatTimeOnly(date: Date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}


export function formatSignalMessage(signal: TradeSignal, currencyPair: string, timeframe: string, source: MarketDataSource): string {
    const rrr = signal.entry !== signal.stopLoss ? Math.abs((signal.takeProfit - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(2) : 'N/A';
    const sourceIndicator = source === 'live' ? '✅ Live' : '⚠️ Mock';
    const signalEmoji = signal.signal === 'Buy' ? '📈' : '📉';

    return `
*New Signal: ${currencyPair} (${timeframe})*
*Strategy:* ${signal.strategy}
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

/**
 * Checks if the global forex market is open.
 * The market is considered open from Sunday 21:00 UTC to Friday 21:00 UTC.
 * @returns {boolean} True if the market is open, false otherwise.
 */
export function isMarketOpen(): boolean {
    const now = new Date();
    const currentUtcDay = now.getUTCDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    const currentUtcHour = now.getUTCHours();

    // Market is closed on Saturday.
    if (currentUtcDay === 6) {
        return false;
    }
    // Market is closed on Friday after 21:00 UTC.
    if (currentUtcDay === 5 && currentUtcHour >= 21) {
        return false;
    }
    // Market is closed on Sunday before 21:00 UTC.
    if (currentUtcDay === 0 && currentUtcHour < 21) {
        return false;
    }
    // Otherwise, the market is open.
    return true;
}
    
