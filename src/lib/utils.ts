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
    const sourceIndicator = source === 'live' ? '✅' : '⚠️';

    return `
*${currencyPair}* (${timeframe})
*Signal:* ${signal.signal === 'Buy' ? '📈' : '📉'} ${signal.signal}
*Lot Size:* ${signal.lotSize.toFixed(2)}
*Entry:* ${signal.entry.toFixed(5)}
*SL:* ${signal.stopLoss.toFixed(5)}
*TP:* ${signal.takeProfit.toFixed(5)}
*RRR:* ${rrr}
---
*Trend:* ${signal.trend}
*Confirmations:* MACD ${signal.macdConfirmation ? '✅' : '❌'}, Bollinger ${signal.bollingerConfirmation ? '✅' : '❌'}
*Data Source:* ${source.toUpperCase()} ${sourceIndicator}
*Generated:* ${formatDate(new Date())}
    `.trim().replace(/---/g, '----------------------------------------');
}
