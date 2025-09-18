"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Percent } from 'lucide-react';

const formSchema = z.object({
  accountBalance: z.coerce.number().positive("Account balance must be positive."),
  riskPercentage: z.coerce.number().min(0.1, "Risk must be at least 0.1%").max(100, "Risk cannot exceed 100%."),
  stopLossPips: z.coerce.number().positive("Stop loss pips must be positive."),
  pipValue: z.coerce.number().positive("Pip value must be positive."),
});

export default function RiskCalculator() {
  const [lotSize, setLotSize] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountBalance: 10000,
      riskPercentage: 1,
      stopLossPips: 25,
      pipValue: 10,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const riskAmount = values.accountBalance * (values.riskPercentage / 100);
    const stopLossValue = values.stopLossPips * values.pipValue;
    const calculatedLotSize = riskAmount / stopLossValue;
    setLotSize(calculatedLotSize);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk & Lot Size Calculator</CardTitle>
        <CardDescription>Calculate your trade size based on your risk tolerance.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accountBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Balance</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="e.g., 10000" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Percentage</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="e.g., 1" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stopLossPips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss (pips)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pipValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pip Value (per lot)</FormLabel>
                     <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" placeholder="e.g., 10" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button type="submit">Calculate Lot Size</Button>
            {lotSize !== null && (
              <div className="w-full p-4 bg-secondary rounded-lg animate-in fade-in-50">
                <h3 className="text-lg font-semibold">Calculated Lot Size</h3>
                <p className="text-3xl font-bold text-primary">{lotSize.toFixed(2)} lots</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Amount at risk: ${((form.getValues('accountBalance') * form.getValues('riskPercentage')) / 100).toFixed(2)}
                </p>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
