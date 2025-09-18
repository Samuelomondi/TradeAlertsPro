
"use client";

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
import { ArrowUp, ArrowDown, Check, X, RotateCcw, CheckCircle, XCircle, Trash2, TriangleAlert } from "lucide-react";
import type { TradeHistoryEntry, TradeStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>A log of all generated trade signals. Mark trades as won or lost to track performance.</CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={history.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
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
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Pair</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>SL</TableHead>
                <TableHead>TP</TableHead>
                <TableHead>Lot Size</TableHead>
                <TableHead>RRR</TableHead>
                <TableHead>Confirmations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {history.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={11} className="text-center h-24">
                    No trade signals generated yet.
                    </TableCell>
                </TableRow>
                ) : (
                history.map((trade) => {
                    const config = statusConfig[trade.status];
                    return (
                        <TableRow key={trade.id}>
                        <TableCell className="text-xs">{trade.timestamp}</TableCell>
                        <TableCell>{trade.currencyPair}<br/><span className="text-xs text-muted-foreground">{trade.timeframe}</span></TableCell>
                        <TableCell>
                            <div className={`flex items-center gap-2 ${trade.signal.signal === 'Buy' ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.signal.signal === 'Buy' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
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
                            <ConfirmationItem label="BB" confirmed={trade.signal.bollingerConfirmation} />
                            <DataSourceItem source={trade.source} />
                        </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={config.variant as any} className={cn(config.className)}>{config.label}</Badge>
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
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

const ConfirmationItem = ({ label, confirmed }: { label: string; confirmed: boolean }) => (
    <Tooltip>
        <TooltipTrigger>
            <div className="flex items-center gap-1 text-xs" title={`${label} Confirmation`}>
                {confirmed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span className="font-medium sr-only">{label}</span>
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
