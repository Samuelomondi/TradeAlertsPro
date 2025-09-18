
"use client";

import React, { useState } from "react";
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
import { Loader2, CheckCircle, XCircle, ArrowUp, ArrowDown, TriangleAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CURRENCY_PAIRS, TIMEFRAMES } from "@/lib/constants";
import type { TradeSignal, TradeHistoryEntry } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import type { MarketDataSource } from "@/services/market-data";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  currencyPair: z.string().min(1, "Currency pair is required."),
  timeframe: z.string().min(1, "Timeframe is required."),
});

type SignalGenerationProps = {
  addTradeToHistory: (entry: TradeHistoryEntry) => void;
  accountBalance: number;
  riskPercentage: number;
};

export default function SignalGeneration({ addTradeToHistory, accountBalance, riskPercentage }: SignalGenerationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSignal, setGeneratedSignal] = useState<TradeSignal | null>(null);
  const [dataSource, setDataSource] = useState<MarketDataSource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currencyPair: "USD/CAD",
      timeframe: "1H",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedSignal(null);
    setDataSource(null);
    setError(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("accountBalance", String(accountBalance));
    formData.append("riskPercentage", String(riskPercentage));


    const result = await generateSignalAction(formData);
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else if (result.data) {
        setGeneratedSignal(result.data.signal);
        setDataSource(result.data.source);
        
        const toastDescription = `A new ${result.data.signal.signal} signal for ${values.currencyPair} has been generated and sent.`;

        toast({
            title: "Signal Generated",
            description: toastDescription,
        });
        
        const historyEntry: TradeHistoryEntry = {
            id: new Date().toISOString(),
            timestamp: formatDate(new Date()),
            currencyPair: values.currencyPair,
            timeframe: values.timeframe,
            signal: result.data.signal,
            status: 'open',
        };
        addTradeToHistory(historyEntry);
    }
  }

  const showResults = generatedSignal;

  return (
    <div className="space-y-8 max-w-md mx-auto">
        <Card>
            <CardHeader>
            <CardTitle>Generate Trade Signal</CardTitle>
            <CardDescription>
                Select a pair and timeframe. Live market data will be fetched and a signal will be generated.
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

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Signal
                </Button>
                </form>
            </Form>
            </CardContent>
        </Card>

        {isLoading && (
            <Card className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-lg">Generating...</p>
            </Card>
        )}
        
        {error && (
            <div className="h-full flex items-center justify-center p-4">
                <Alert variant="destructive">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Data Fetching Failed</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        )}

        {showResults && (
            <div className="animate-in fade-in-50 duration-500">
                <GeneratedSignalCard signal={generatedSignal} inputs={form.getValues()} dataSource={dataSource} />
            </div>
        )}
    </div>
  );
}

const GeneratedSignalCard = ({ signal, inputs, dataSource }: { signal: TradeSignal, inputs: z.infer<typeof formSchema>, dataSource: MarketDataSource | null }) => {
    const rrr = signal.entry !== signal.stopLoss ? Math.abs((signal.takeProfit - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(2) : 'N/A';
    
    return (
        <Card className={cn(
            "border-2",
            signal.signal === 'Buy' ? "border-green-500" : "border-red-500"
        )}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{inputs.currencyPair} Signal</span>
                    <span className={cn(
                        "text-2xl font-bold flex items-center gap-2",
                        signal.signal === 'Buy' ? "text-green-600" : "text-red-600"
                    )}>
                        {signal.signal === 'Buy' ? <ArrowUp /> : <ArrowDown /> }
                        {signal.signal}
                    </span>
                </CardTitle>
                <div className="flex justify-between items-baseline">
                    <CardDescription>{`Generated at ${formatDate(new Date())}`}</CardDescription>
                    {dataSource && (
                        <span className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full",
                            dataSource === 'live' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        )}>
                            Data: {dataSource.toUpperCase()}
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-sm text-primary font-semibold">Lot Size</p>
                    <p className="text-3xl font-bold text-primary">{signal.lotSize.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoItem label="Timeframe" value={inputs.timeframe} />
                    <InfoItem label="Trend" value={signal.trend} />
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

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
    </div>
);

const ConfirmationItem = ({ label, confirmed }: { label: string; confirmed: boolean }) => (
    <div className="flex items-center gap-2 text-sm">
        {confirmed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
        <span className="font-medium">{label}</span>
    </div>
);
