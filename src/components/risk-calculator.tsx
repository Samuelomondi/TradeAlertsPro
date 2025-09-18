
"use client";

import React from 'react';
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
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  accountBalance: z.coerce.number().positive("Account balance must be positive."),
  riskPercentage: z.coerce.number().min(0.1, "Risk must be at least 0.1%").max(100, "Risk cannot exceed 100%."),
});

type RiskCalculatorProps = {
    accountBalance: number;
    riskPercentage: number;
    setAccountBalance: (value: number) => void;
    setRiskPercentage: (value: number) => void;
};

export default function RiskCalculator({ accountBalance, riskPercentage, setAccountBalance, setRiskPercentage }: RiskCalculatorProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountBalance,
      riskPercentage,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setAccountBalance(values.accountBalance);
    setRiskPercentage(values.riskPercentage);
    toast({
      title: "Settings Saved",
      description: "Your new risk parameters have been applied.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Settings</CardTitle>
        <CardDescription>Set your account balance and risk percentage for all generated signals.</CardDescription>
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
                        <Input type="number" placeholder="e.g., 1000" className="pl-8" {...field} />
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
                        <Input type="number" placeholder="e.g., 1" className="pl-8" step="0.1" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <p className="text-xs text-muted-foreground pt-4">
              These values will be used to automatically calculate the lot size for each new trade signal generated. The calculation will use the stop loss from the generated signal.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Settings</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
