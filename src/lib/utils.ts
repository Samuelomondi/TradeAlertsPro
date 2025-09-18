import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TradeSignal } from "./types";

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
        timeZone: 'UTC'
    }) + ' UTC';
}

export function formatSignalMessage(signal: TradeSignal, currencyPair: string, timeframe: string): string {
    const rrr = signal.entry !== signal.stopLoss ? Math.abs((signal.takeProfit - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(2) : 'N/A';

    return `
*${currencyPair}*
*Timeframe:* ${timeframe}
*Generated:* ${formatDate(new Date())}
*Trend:* ${signal.trend}
*Signal:* ${signal.signal === 'Buy' ? '📈' : '📉'} ${signal.signal}
*Entry:* ${signal.entry.toFixed(4)}
*SL:* ${signal.stopLoss.toFixed(4)} | *TP:* ${signal.takeProfit.toFixed(4)}
*RRR:* ${rrr}
*Confirmations:* MACD ${signal.macdConfirmation ? '✅' : '❌'}, Bollinger ${signal.bollingerConfirmation ? '✅' : '❌'}
    `.trim();
}