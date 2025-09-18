
import { TradeSignalOutput } from "@/ai/flows/signal-generation-gen-ai";

export type TradeSignal = TradeSignalOutput;

export type TradeStatus = 'open' | 'won' | 'lost';

export type TradeHistoryEntry = {
    id: string;
    timestamp: string;
    currencyPair: string;
    timeframe: string;
    signal: TradeSignal;
    status: TradeStatus;
};

export type BacktestResults = {
    currencyPair: string;
    timeframe: string;
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    netProfit: number;
    avgWin: number;
    avgLoss: number;
    barsAnalyzed: number;
};
