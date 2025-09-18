"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, BrainCircuit, LineChart, Send } from "lucide-react";
import { getSystemStatus, type SystemStatus } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function BotInfo() {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      const systemStatus = await getSystemStatus();
      setStatus(systemStatus);
    }
    fetchStatus();
  }, []);

  const infoItems = status ? [
    { icon: BrainCircuit, label: "Generative AI (Gemini)", value: status.gemini },
    { icon: LineChart, label: "Market Data (Twelve Data)", value: status.twelveData },
    { icon: Send, label: "Notifications (Telegram)", value: status.telegram },
  ] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Status of the core services required for the application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status ? (
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-3/4" />
            </div>
        ) : (
            infoItems.map((item, index) => (
              <div key={index} className="flex items-center">
                <item.icon className={`w-6 h-6 mr-4 text-primary`} />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <div className="flex items-center gap-2">
                    {item.value === 'Configured' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    <p className={`font-semibold ${item.value === 'Configured' ? 'text-green-600' : 'text-red-600'}`}>{item.value}</p>
                  </div>
                </div>
              </div>
            ))
        )}
        <p className="text-xs text-muted-foreground pt-4">
          This panel checks if the necessary API keys are present in your environment configuration. Without these, the application may not function correctly.
        </p>
      </CardContent>
    </Card>
  );
}
