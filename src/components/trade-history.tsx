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
import { ArrowUp, ArrowDown, Check, X, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import type { TradeHistoryEntry, TradeStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type TradeHistoryProps = {
  history: TradeHistoryEntry[];
  updateTradeStatus: (id: string, status: TradeStatus) => void;
};

const statusConfig = {
    open: { variant: "secondary", label: "Open" },
    won: { variant: "default", className: "bg-green-600 hover:bg-green-700", label: "Won"},
    lost: { variant: "destructive", label: "Lost" },
};


export default function TradeHistory({ history, updateTradeStatus }: TradeHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
        <CardDescription>A log of all generated trade signals. Mark trades as won or lost to track performance.</CardDescription>
      </CardHeader>
      <CardContent>
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
              <TableHead>Confirmations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center h-24">
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ConfirmationItem label="MACD" confirmed={trade.signal.macdConfirmation} />
                        <ConfirmationItem label="BB" confirmed={trade.signal.bollingerConfirmation} />
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
                        </div>
                    </TableCell>
                    </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const ConfirmationItem = ({ label, confirmed }: { label: string; confirmed: boolean }) => (
    <div className="flex items-center gap-1 text-xs" title={`${label} Confirmation`}>
        {confirmed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
        <span className="font-medium sr-only">{label}</span>
    </div>
);