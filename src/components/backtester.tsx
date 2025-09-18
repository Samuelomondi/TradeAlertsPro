
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, TriangleAlert, CheckCircle, XCircle, Percent, DollarSign, BarChart } from "lucide-react";
import { CURRENCY_PAIRS, TIMEFRAMES } from "@/lib/constants";
import { runBacktestAction } from "@/app/actions";
import type { BacktestResults } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { cn } from "@/lib/utils";


const formSchema = z.object({
  currencyPair: z.string().min(1, "Currency pair is required."),
  timeframe: z.string().min(1, "Timeframe is required."),
});

type BacktesterProps = {
  accountBalance: number;
  riskPercentage: number;
};

export default function Backtester({ accountBalance, riskPercentage }: BacktesterProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<BacktestResults | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currencyPair: "EUR/USD",
            timeframe: "1H",
        },
    });
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setResults(null);
        setError(null);

        const formData = new FormData();
        formData.append("currencyPair", values.currencyPair);
        formData.append("timeframe", values.timeframe);
        formData.append("accountBalance", String(accountBalance));
        formData.append("riskPercentage", String(riskPercentage));

        const response = await runBacktestAction(formData);

        setIsLoading(false);

        if (response.error) {
            setError(response.error);
            toast({
                variant: "destructive",
                title: "Backtest Failed",
                description: response.error,
            });
        } else if (response.data) {
            setResults(response.data);
            toast({
                title: "Backtest Complete",
                description: `Analyzed ${response.data.totalTrades} trades for ${values.currencyPair}.`,
            });
        }
    }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Strategy Backtester</CardTitle>
                    <CardDescription>
                        Test the built-in trading strategy against historical market data.
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
                                                <SelectTrigger><SelectValue placeholder="Select a pair" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{CURRENCY_PAIRS.map((pair) => (<SelectItem key={pair} value={pair}>{pair}</SelectItem>))}</SelectContent>
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
                                                <SelectTrigger><SelectValue placeholder="Select a timeframe" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{TIMEFRAMES.map((tf) => (<SelectItem key={tf} value={tf}>{tf}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                             <p className="text-xs text-muted-foreground pt-2">
                                The backtest will run on the last 500 data points for the selected timeframe. It uses the current risk settings from the Risk Calculator.
                            </p>
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Run Backtest
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        <div className="h-full">
            {isLoading && (
                <Card className="flex items-center justify-center p-10 h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-lg">Running Simulation...</p>
                </Card>
            )}
            
            {error && !isLoading && (
                 <div className="h-full flex items-center justify-center p-4">
                    <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>An Error Occurred</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {results && !isLoading && !error && (
                 <div className="animate-in fade-in-50 duration-500 h-full">
                    <ResultsCard results={results} />
                </div>
            )}
        </div>
    </div>
  );
}


const ResultsCard = ({ results }: { results: BacktestResults }) => {
    const isProfitable = results.netProfit > 0;
    return (
        <Card className={cn("border-2 h-full", isProfitable ? "border-green-500" : "border-red-500")}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Backtest Results</span>
                    <span className={cn( "text-2xl font-bold flex items-center gap-2", isProfitable ? "text-green-600" : "text-red-600")}>
                        {isProfitable ? 'Profitable' : 'Not Profitable'}
                    </span>
                </CardTitle>
                <CardDescription>
                    Results for {results.currencyPair} on the {results.timeframe} timeframe over {results.barsAnalyzed} bars.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className={cn(
                    "p-4 rounded-lg text-center",
                    isProfitable ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                )}>
                    <p className={cn("text-sm font-semibold", isProfitable ? "text-green-700" : "text-red-700")}>Net Profit</p>
                    <p className={cn("text-3xl font-bold", isProfitable ? "text-green-600" : "text-red-600")}>${results.netProfit.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoItem icon={BarChart} label="Total Trades" value={String(results.totalTrades)} />
                    <InfoItem icon={Percent} label="Win Rate" value={`${results.winRate.toFixed(1)}%`} />
                    <InfoItem icon={CheckCircle} label="Trades Won" value={String(results.wins)} />
                    <InfoItem icon={XCircle} label="Trades Lost" value={String(results.losses)} />
                    <InfoItem icon={DollarSign} label="Average Win" value={`$${results.avgWin.toFixed(2)}`} />
                    <InfoItem icon={DollarSign} label="Average Loss" value={`$${results.avgLoss.toFixed(2)}`} />
                </div>
            </CardContent>
        </Card>
    );
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string; value: string }) => (
    <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);
