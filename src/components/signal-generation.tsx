
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateSignalAction } from "@/app/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, ArrowUp, ArrowDown, TriangleAlert, History, Minus, Pause, TrendingUp, ArrowRightLeft, Maximize } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CURRENCY_PAIRS, TIMEFRAMES, STRATEGIES, StrategyId } from "@/lib/constants";
import type { TradeSignal, TradeHistoryEntry, TradeStatus } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import type { MarketDataSource, MarketDataSeries } from "@/services/market-data";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import MarketChart from "./market-chart";
import { Separator } from "./ui/separator";
import { useSettings } from "./settings-provider";


const formSchema = z.object({
  currencyPair: z.string().min(1, "Currency pair is required."),
  timeframe: z.string().min(1, "Timeframe is required."),
  strategy: z.custom<StrategyId>(),
});

type FormValues = z.infer<typeof formSchema>;

type SignalGenerationProps = {
  addTradeToHistory: (entry: TradeHistoryEntry) => void;
  updateTradeStatus: (id: string, status: TradeStatus) => void;
  accountBalance: number;
  riskPercentage: number;
  history: TradeHistoryEntry[];
};

type StoredSignal = {
    signal: TradeSignal;
    source: MarketDataSource;
    series: MarketDataSeries[];
    inputs: FormValues;
    timestamp: string;
};

const LAST_SIGNAL_STORAGE_KEY = 'lastGeneratedSignal';

const statusCycle: TradeStatus[] = ['open', 'won', 'lost'];

export default function SignalGeneration({ addTradeToHistory, accountBalance, riskPercentage, history, updateTradeStatus }: SignalGenerationProps) {
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSignal, setGeneratedSignal] = useState<TradeSignal | null>(null);
  const [dataSource, setDataSource] = useState<MarketDataSource | null>(null);
  const [chartSeries, setChartSeries] = useState<MarketDataSeries[]>([]);
  const [lastInputs, setLastInputs] = useState<FormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationTimestamp, setGenerationTimestamp] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedSignal = localStorage.getItem(LAST_SIGNAL_STORAGE_KEY);
      if (savedSignal) {
        const { signal, source, series, inputs, timestamp } = JSON.parse(savedSignal) as StoredSignal;
        setGeneratedSignal(signal);
        setDataSource(source);
        setChartSeries(series || []);
        setLastInputs(inputs);
        setGenerationTimestamp(timestamp);
      }
    } catch (error) {
      console.error("Failed to parse last signal from localStorage", error);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currencyPair: "USD/CAD",
      timeframe: "1H",
      strategy: "trend",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedSignal(null);
    setDataSource(null);
    setChartSeries([]);
    setLastInputs(null);
    setError(null);
    setGenerationTimestamp(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("accountBalance", String(accountBalance));
    formData.append("riskPercentage", String(riskPercentage));

    // Pass API keys and settings
    formData.append("geminiApiKey", settings.geminiApiKey || '');
    formData.append("twelveDataApiKey", settings.twelveDataApiKey || '');
    if (settings.telegramChatId) {
        formData.append("telegramChatId", settings.telegramChatId);
    }


    const result = await generateSignalAction(formData);
    setIsLoading(false);

    if (result.error) {
        setError(result.error);
        toast({
            variant: "destructive",
            title: "Error Generating Signal",
            description: result.error,
        });
    } else if (result.data) {
        const signal = result.data.signal;
        const timestamp = new Date().toISOString();

        setGeneratedSignal(signal);
        setDataSource(result.data.source);
        setChartSeries(result.data.series);
        setLastInputs(values);
        setGenerationTimestamp(timestamp);
        
        const toastDescription = `A new ${signal.signal} signal for ${values.currencyPair} has been generated.`;

        toast({
            title: "Signal Generated",
            description: toastDescription,
        });
        
        const rrr = signal.entry !== signal.stopLoss ? Math.abs((signal.takeProfit - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(2) : 'N/A';

        const historyEntry: TradeHistoryEntry = {
            id: timestamp,
            timestamp: timestamp,
            currencyPair: values.currencyPair,
            timeframe: values.timeframe,
            signal: signal,
            status: 'open',
            source: result.data.source,
            rrr: rrr,
        };
        addTradeToHistory(historyEntry);

        try {
            const storedSignal: StoredSignal = { signal, source: result.data.source, series: result.data.series || [], inputs: values, timestamp };
            localStorage.setItem(LAST_SIGNAL_STORAGE_KEY, JSON.stringify(storedSignal));
        } catch (storageError) {
            console.error("Failed to save last signal to localStorage", storageError);
        }
    }
  }

  const showResults = generatedSignal && lastInputs && generationTimestamp;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Generate Trade Signal</CardTitle>
                <CardDescription>
                    Select a pair and timeframe to generate a signal with live market data.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="currencyPair"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Currency Pair</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a pair" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {CURRENCY_PAIRS.map((pair) => (
                                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="timeframe"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Timeframe</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a timeframe" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {TIMEFRAMES.map((tf) => (
                                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="strategy"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Strategy</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a strategy" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {STRATEGIES.map((strategy) => (
                                    <SelectItem key={strategy.id} value={strategy.id}>
                                       <div className="flex items-center gap-2">
                                            <strategy.icon className="w-4 h-4" />
                                            <span>{strategy.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Signal
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
            <RecentTradesCard history={history} updateTradeStatus={updateTradeStatus} />
        </div>
        <div className="h-full">
            {isLoading && (
                <Card className="flex items-center justify-center p-10 h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-lg">Generating...</p>
                </Card>
            )}
            
            {error && !isLoading && (
                <div className="h-full flex items-center justify-center p-4">
                    <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>An Error Occurred</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {showResults && !isLoading && !error &&(
                <div className="animate-in fade-in-50 duration-500 h-full">
                    <GeneratedSignalCard 
                        signal={generatedSignal} 
                        inputs={lastInputs} 
                        dataSource={dataSource}
                        chartSeries={chartSeries || []}
                        timestamp={generationTimestamp}
                        history={history}
                        updateTradeStatus={updateTradeStatus}
                    />
                </div>
            )}
        </div>
    </div>
  );
}

const statusConfig: { [key in TradeStatus]: { variant: "secondary" | "default" | "destructive", label: string, className?: string } } = {
    open: { variant: "secondary", label: "Open" },
    won: { variant: "default", className: "bg-green-600 hover:bg-green-700 text-white", label: "Won" },
    lost: { variant: "destructive", label: "Lost" },
};

const signalStyles = {
    Buy: {
        card: "border-green-500",
        title: "text-green-600",
        icon: ArrowUp
    },
    Sell: {
        card: "border-red-500",
        title: "text-red-600",
        icon: ArrowDown
    },
    Hold: {
        card: "border-blue-500",
        title: "text-blue-600",
        icon: Pause
    }
}

const GeneratedSignalCard = ({ signal, inputs, dataSource, chartSeries, timestamp, history, updateTradeStatus }: { 
    signal: TradeSignal, 
    inputs: FormValues, 
    dataSource: MarketDataSource | null, 
    chartSeries: MarketDataSeries[],
    timestamp: string,
    history: TradeHistoryEntry[],
    updateTradeStatus: (id: string, status: TradeStatus) => void;
}) => {
    const rrr = signal.entry !== signal.stopLoss ? Math.abs((signal.takeProfit - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(2) : 'N/A';
    
    const currentTrade = history.find(trade => trade.id === timestamp);
    const currentStatus = currentTrade?.status || 'open';
    const config = statusConfig[currentStatus];

    const handleStatusClick = () => {
        const currentIndex = statusCycle.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statusCycle.length;
        const nextStatus = statusCycle[nextIndex];
        updateTradeStatus(timestamp, nextStatus);
    };

    const styles = signalStyles[signal.signal as keyof typeof signalStyles] || signalStyles.Hold;
    const Icon = styles.icon;
    const strategy = STRATEGIES.find(s => s.id === signal.strategy);
    const StrategyIcon = strategy?.icon || Pause;
    
    return (
        <Card className={cn(
            "border-2 h-full flex flex-col",
            styles.card
        )}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{inputs.currencyPair} Signal</span>
                    <span className={cn(
                        "text-2xl font-bold flex items-center gap-2",
                        styles.title
                    )}>
                        <Icon />
                        {signal.signal}
                    </span>
                </CardTitle>
                <div className="flex justify-between items-center">
                    <CardDescription>{`Generated at ${formatDate(new Date(timestamp))}`}</CardDescription>
                    <div className="flex items-center gap-2">
                        {dataSource && (
                            <span className={cn(
                                "text-xs font-semibold px-2 py-1 rounded-full",
                                dataSource === 'live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            )}>
                                Data: {dataSource.toUpperCase()}
                            </span>
                        )}
                         <Badge 
                            variant={config.variant} 
                            className={cn(config.className, "cursor-pointer")}
                            onClick={handleStatusClick}
                            title={`Click to change status (currently ${currentStatus})`}
                        >
                            {config.label}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {chartSeries.length > 0 && <div className="flex-1"><MarketChart data={chartSeries} /></div>}
                
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-primary font-semibold">Lot Size</p>
                    <p className="text-3xl font-bold text-primary">{signal.lotSize.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoItem label="Timeframe" value={inputs.timeframe} />
                    <div className="flex items-center gap-2">
                        <InfoItem label="Strategy" value={strategy?.name || "N/A"} />
                        <StrategyIcon className="w-4 h-4" />
                    </div>
                    <InfoItem label="Entry" value={signal.entry.toFixed(5)} />
                    <InfoItem label="Stop Loss (SL)" value={signal.stopLoss.toFixed(5)} />
                    <InfoItem label="Take Profit (TP)" value={signal.takeProfit.toFixed(5)} />
                    <InfoItem label="Risk/Reward Ratio" value={rrr} />
                    <div className="col-span-2">
                        <h4 className="font-semibold mb-2">Confirmations</h4>
                        <div className="flex items-center gap-4">
                            <ConfirmationItem label="MACD" confirmed={signal.macdConfirmation} />
                            <ConfirmationItem label="Bollinger" confirmed={signal.bollingerConfirmation} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const RecentTradesCard = ({ history, updateTradeStatus }: { history: TradeHistoryEntry[], updateTradeStatus: (id: string, status: TradeStatus) => void; }) => {
    const recentTrades = history.slice(1, 4);
    
    const handleStatusClick = (trade: TradeHistoryEntry) => {
        const currentIndex = statusCycle.indexOf(trade.status);
        const nextIndex = (currentIndex + 1) % statusCycle.length;
        const nextStatus = statusCycle[nextIndex];
        updateTradeStatus(trade.id, nextStatus);
    };

    const signalIcon = (signal: string) => {
        if (signal === 'Buy') return <ArrowUp className="w-5 h-5 text-green-500" />;
        if (signal === 'Sell') return <ArrowDown className="w-5 h-5 text-red-500" />;
        return <Pause className="w-5 h-5 text-blue-500" />;
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    <span>Recent Trades</span>
                </CardTitle>
                <CardDescription>A quick look at your last three signals.</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                {recentTrades.length > 0 ? (
                    <div className="space-y-3">
                        {recentTrades.map((trade) => {
                             const config = statusConfig[trade.status];
                             const strategy = STRATEGIES.find(s => s.id === trade.signal.strategy);
                             const StrategyIcon = strategy?.icon || Pause;
                             return (
                                <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {signalIcon(trade.signal.signal)}
                                        <div>
                                            <p className="font-semibold">{trade.currencyPair} <span className="font-normal text-muted-foreground">({trade.timeframe})</span></p>
                                            <p className="text-xs text-muted-foreground">{formatDate(new Date(trade.timestamp))}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs">
                                             <Tooltip>
                                                <TooltipTrigger><StrategyIcon className="w-4 h-4" /></TooltipTrigger>
                                                <TooltipContent><p>{strategy?.name}</p></TooltipContent>
                                            </Tooltip>
                                            <ConfirmationItem confirmed={trade.signal.macdConfirmation} />
                                            <ConfirmationItem confirmed={trade.signal.bollingerConfirmation} />
                                            <DataSourceItem source={trade.source} />
                                        </div>
                                        <Badge 
                                            variant={config.variant} 
                                            className={cn(config.className, "cursor-pointer")}
                                            onClick={() => handleStatusClick(trade)}
                                            title={`Click to change status (currently ${trade.status})`}
                                        >
                                            {config.label}
                                        </Badge>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                        <Minus className="w-8 h-8 mb-2" />
                        <p className="text-sm">No prior trades to show.</p>
                    </div>
                )}
                </TooltipProvider>
            </CardContent>
        </Card>
    )
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
    </div>
);

const ConfirmationItem = ({ label, confirmed }: { label?: string; confirmed: boolean }) => (
     <Tooltip>
        <TooltipTrigger asChild>
             <div className="flex items-center gap-1">
                {label && <span className="text-muted-foreground font-medium">{label}</span>}
                {confirmed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <p>{label || 'Confirmation'}{' '}{confirmed ? 'Confirmed' : 'Not Confirmed'}</p>
        </TooltipContent>
    </Tooltip>
);

const DataSourceItem = ({ source }: { source?: 'live' | 'mock' }) => {
    if (!source) return null;

    return (
        <Tooltip>
            <TooltipTrigger>
                <div>
                    {source === 'live' ? <CheckCircle className="w-4 h-4 text-blue-500" /> : <TriangleAlert className="w-4 h-4 text-yellow-500" />}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Data Source: {source.toUpperCase()}</p>
            </TooltipContent>
        </Tooltip>
    );
};
