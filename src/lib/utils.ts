
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

// Overlap logic for Market Hours and Signal Generation
interface Market {
  name: 'Sydney' | 'London' | 'New York' | 'Tokyo';
  openUtc: number;
  closeUtc: number;
}

export interface Overlap {
  id: 'SYD-TKY' | 'LDN-NYK' | 'LDN-TKY';
  name: string;
  startUtc: number;
  endUtc: number;
}

export const markets: Market[] = [
  { name: 'Sydney', openUtc: 22, closeUtc: 6 },
  { name: 'London', openUtc: 8, closeUtc: 16 },
  { name: 'New York', openUtc: 13, closeUtc: 21 },
  { name: 'Tokyo', openUtc: 0, closeUtc: 8 },
];

export const overlaps: Overlap[] = [
    { id: 'LDN-TKY', name: 'London/Tokyo', startUtc: 8, endUtc: 9 },
    { id: 'SYD-TKY', name: 'Sydney/Tokyo', startUtc: 0, endUtc: 6 },
    { id: 'LDN-NYK', name: 'London/New York', startUtc: 13, endUtc: 16 },
];

export const pairOverlapMap: Record<string, Overlap['id'][]> = {
    'EUR/USD': ['LDN-NYK'], 'GBP/USD': ['LDN-NYK'],
    'USD/CHF': ['LDN-NYK'],
    'USD/JPY': ['LDN-NYK', 'LDN-TKY'],
    'AUD/USD': ['SYD-TKY'], 'NZD/USD': ['SYD-TKY'],
    'USD/CAD': ['LDN-NYK'],
    'EUR/JPY': ['LDN-TKY'], 'GBP/JPY': ['LDN-TKY'],
};

export function getMarketStatus(market: Market, now: Date) {
    const currentUtcDay = now.getUTCDay();
    const currentUtcHour = now.getUTCHours();
    
    if (currentUtcDay === 6 || (currentUtcDay === 5 && currentUtcHour >= 21) || (currentUtcDay === 0 && currentUtcHour < 21)) {
        return false;
    }

    if (market.openUtc < market.closeUtc) {
        return currentUtcHour >= market.openUtc && currentUtcHour < market.closeUtc;
    } else {
        return currentUtcHour >= market.openUtc || currentUtcHour < market.closeUtc;
    }
}

export function getOverlapStatus(overlap: Overlap, now: Date) {
    const currentUtcDay = now.getUTCDay();
    const currentUtcHour = now.getUTCHours();
    
    if (currentUtcDay === 6 || currentUtcDay === 0) return false;
    if (currentUtcDay === 5 && currentUtcHour >= overlap.endUtc) return false;

    return currentUtcHour >= overlap.startUtc && currentUtcHour < overlap.endUtc;
}
