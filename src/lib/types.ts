import { TradeSignalOutput } from "@/ai/flows/signal-generation-gen-ai";

export type TradeSignal = TradeSignalOutput;

export type TradeHistoryEntry = {
    id: string;
    timestamp: string;
    currencyPair: string;
    timeframe: string;
    signal: TradeSignal;
    status: 'open' | 'closed';
};
