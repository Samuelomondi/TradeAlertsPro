
import { TradeSignalOutput } from "@/ai/flows/signal-generation-gen-ai";
import type { MarketDataSource } from "@/services/market-data";
import type { StrategyId } from "./constants";

export type TradeSignal = TradeSignalOutput & {
    strategy: StrategyId;
};

export type TradeStatus = 'open' | 'won' | 'lost';

export type TradeHistoryEntry = {
    id: string;
    timestamp: string;
    currencyPair: string;
    timeframe: string;
    signal: TradeSignal;
    status: TradeStatus;
    source: MarketDataSource;
    rrr: string;
};

