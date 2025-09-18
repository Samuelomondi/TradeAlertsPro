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
import { ArrowUp, ArrowDown } from "lucide-react";
import type { TradeHistoryEntry } from "@/lib/types";

type TradeHistoryProps = {
  history: TradeHistoryEntry[];
};

export default function TradeHistory({ history }: TradeHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
        <CardDescription>A log of all generated trade signals.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Pair</TableHead>
              <TableHead>Timeframe</TableHead>
              <TableHead>Signal</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>SL</TableHead>
              <TableHead>TP</TableHead>
              <TableHead>Lot Size</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center h-24">
                  No trade signals generated yet.
                </TableCell>
              </TableRow>
            ) : (
              history.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell>{trade.timestamp}</TableCell>
                  <TableCell>{trade.currencyPair}</TableCell>
                  <TableCell>{trade.timeframe}</TableCell>
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
                    <Badge variant={trade.status === 'open' ? 'secondary' : 'default'}>{trade.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
