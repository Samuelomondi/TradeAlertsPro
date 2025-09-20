
"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Check, X, RotateCcw, CheckCircle, XCircle, Trash2, TriangleAlert, Pause, FileDown, XSquare, TrendingUp, ArrowRightLeft, Maximize } from "lucide-react";
import type { TradeHistoryEntry, TradeStatus } from "@/lib/types";
import { cn, formatDateOnly, formatTimeOnly } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CURRENCY_PAIRS, STRATEGIES, type StrategyId } from '@/lib/constants';

type TradeHistoryProps = {
  history: TradeHistoryEntry[];
  updateTradeStatus: (id: string, status: TradeStatus) => void;
  clearHistory: () => void;
  deleteTrade: (id: string) => void;
};

const statusConfig = {
    open: { variant: "secondary", label: "Open" },
    won: { variant: "default", className: "bg-green-600 hover:bg-green-700", label: "Won"},
    lost: { variant: "destructive", label: "Lost" },
};

export default function TradeHistory({ history, updateTradeStatus, clearHistory, deleteTrade }: TradeHistoryProps) {
  const [pairFilter, setPairFilter] = useState<string | 'all'>('all');
  const [strategyFilter, setStrategyFilter] = useState<StrategyId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TradeStatus | 'all'>('all');

  const filteredHistory = useMemo(() => {
      return history.filter(trade => {
          const pairMatch = pairFilter === 'all' || trade.currencyPair === pairFilter;
          const strategyMatch = strategyFilter === 'all' || trade.signal.strategy === strategyFilter;
          const statusMatch = statusFilter === 'all' || trade.status === statusFilter;
          return pairMatch && strategyMatch && statusMatch;
      });
  }, [history, pairFilter, strategyFilter, statusFilter]);

  const clearFilters = () => {
    setPairFilter('all');
    setStrategyFilter('all');
    setStatusFilter('all');
  };

  const exportToCsv = () => {
    const headers = [
      'ID', 'Date', 'Time', 'Currency Pair', 'Timeframe', 'Strategy', 'Signal', 
      'Entry', 'Stop Loss', 'Take Profit', 'Lot Size', 'RRR', 'Status', 'Data Source', 
      'MACD Confirmed', 'Bollinger Confirmed'
    ];
    
    const rows = filteredHistory.map(trade => [
      trade.id,
      formatDateOnly(new Date(trade.id)),
      formatTimeOnly(new Date(trade.id)),
      trade.currencyPair,
      trade.timeframe,
      trade.signal.strategy,
      trade.signal.signal,
      trade.signal.entry.toFixed(5),
      trade.signal.stopLoss.toFixed(5),
      trade.signal.takeProfit.toFixed(5),
      trade.signal.lotSize.toFixed(2),
      trade.rrr,
      trade.status,
      trade.source,
      trade.signal.macdConfirmation,
      trade.signal.bollingerConfirmation
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURI([headers.join(','), ...rows].join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'trade_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Card>
      <CardHeader>
        <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription className="space-y-1 mt-2">
                <div>A log of all generated trade signals. Mark trades as won or lost to track performance.</div>
                 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="font-semibold">Strategy:</span>
                    <div className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5"/> Trend Following</div>
                    <div className="flex items-center gap-1"><ArrowRightLeft className="w-3.5 h-3.5"/> Mean Reversion</div>
                    <div className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5"/> Breakout</div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="font-semibold">Toolkit:</span>
                    <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Confirmed</div>
                    <div className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-red-500" /> Not Confirmed</div>
                    <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-blue-500" /> Live Data</div>
                    <div className="flex items-center gap-1"><TriangleAlert className="w-3.5 h-3.5 text-yellow-500" /> Mock Data</div>
                </div>
            </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 sm:mt-0">
            <div className="flex flex-wrap items-center gap-2">
                 <Select value={pairFilter} onValueChange={setPairFilter}>
                    <SelectTrigger className="w-full sm:w-[150px] h-9">
                        <SelectValue placeholder="Filter by Pair" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Pairs</SelectItem>
                        {CURRENCY_PAIRS.map(pair => <SelectItem key={pair} value={pair}>{pair}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={strategyFilter} onValueChange={(value) => setStrategyFilter(value as StrategyId | 'all')}>
                    <SelectTrigger className="w-full sm:w-[180px] h-9">
                        <SelectValue placeholder="Filter by Strategy" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Strategies</SelectItem>
                        {STRATEGIES.map(strategy => (
                            <SelectItem key={strategy.id} value={strategy.id}>
                                <div className="flex items-center gap-2">
                                    <strategy.icon className="w-4 h-4" />
                                    {strategy.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TradeStatus | 'all')}>
                    <SelectTrigger className="w-full sm:w-[150px] h-9">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9" disabled={pairFilter === 'all' && strategyFilter === 'all' && statusFilter === 'all'}>
                    <XSquare className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={exportToCsv} disabled={filteredHistory.length === 0} className="w-full">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={history.length === 0} className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all of your trade history from your browser's local storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <ScrollArea className="w-full whitespace-nowrap">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Entry</TableHead>
                    <TableHead>SL</TableHead>
                    <TableHead>TP</TableHead>
                    <TableHead>Lot Size</TableHead>
                    <TableHead>RRR</TableHead>
                    <TableHead>Toolkit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right min-w-[150px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredHistory.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={12} className="text-center h-24">
                         {history.length > 0 ? 'No trades match the current filters.' : 'No trade signals generated yet.'}
                        </TableCell>
                    </TableRow>
                    ) : (
                    filteredHistory.map((trade) => {
                        const statusBadge = statusConfig[trade.status];
                        const strategy = STRATEGIES.find(s => s.id === trade.signal.strategy);
                        const StrategyIcon = strategy?.icon || Pause;
                        const SignalIcon = trade.signal.signal === 'Buy' ? ArrowUp : trade.signal.signal === 'Sell' ? ArrowDown : Pause;
                        const signalColor = trade.signal.signal === 'Buy' ? 'text-green-600' : 'text-red-600';

                        return (
                            <TableRow key={trade.id}>
                            <TableCell>
                                <div>{formatDateOnly(new Date(trade.id))}</div>
                                <div className="text-xs text-muted-foreground">{formatTimeOnly(new Date(trade.id))}</div>
                            </TableCell>
                            <TableCell>{trade.currencyPair}<br/><span className="text-xs text-muted-foreground">{trade.timeframe}</span></TableCell>
                            <TableCell>
                                {strategy && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center justify-center">
                                                <StrategyIcon className="h-5 w-5" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{strategy.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className={cn('flex items-center gap-2', signalColor)}>
                                    <SignalIcon className="h-4 w-4" />
                                    {trade.signal.signal}
                                </div>
                            </TableCell>
                            <TableCell>{trade.signal.entry.toFixed(5)}</TableCell>
                            <TableCell>{trade.signal.stopLoss.toFixed(5)}</TableCell>
                            <TableCell>{trade.signal.takeProfit.toFixed(5)}</TableCell>
                            <TableCell>{trade.signal.lotSize.toFixed(2)}</TableCell>
                            <TableCell>{trade.rrr}</TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                                <ConfirmationItem label="MACD" confirmed={trade.signal.macdConfirmation} />
                                <ConfirmationItem label="Bollinger Bands" confirmed={trade.signal.bollingerConfirmation} />
                                <DataSourceItem source={trade.source} />
                            </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusBadge.variant as any} className={cn(statusBadge.className)}>{statusBadge.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:bg-green-100 hover:text-green-600" title="Mark as Won" onClick={() => updateTradeStatus(trade.id, 'won')}><Check /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-100 hover:text-red-600" title="Mark as Lost" onClick={() => updateTradeStatus(trade.id, 'lost')}><X /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:bg-gray-100 hover:text-gray-600" title="Reset to Open" onClick={() => updateTradeStatus(trade.id, 'open')}><RotateCcw /></Button>
                                    <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:bg-destructive/10 hover:text-destructive" title="Delete Trade"><Trash2 /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this trade from your history.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteTrade(trade.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                            </TableRow>
                        )
                    })
                    )}
                </TableBody>
                </Table>
            </ScrollArea>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

const ConfirmationItem = ({ label, confirmed }: { label: string; confirmed: boolean }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs">
                {confirmed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <p>{label} {confirmed ? 'Confirmed' : 'Not Confirmed'}</p>
        </TooltipContent>
    </Tooltip>
);

const DataSourceItem = ({ source }: { source?: 'live' | 'mock' }) => {
    if (!source) return null;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
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
