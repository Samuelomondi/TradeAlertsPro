
'use client';

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
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettings, type AppSettings } from './settings-provider';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { KeyRound, Info, Bell, Send, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  geminiApiKey: z.string().min(1, 'Gemini API Key is required.'),
  twelveDataApiKey: z.string().min(1, 'Twelve Data API Key is required.'),
  telegramChatId: z.string().optional(),
});

export default function BotInfo() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showTwelveDataKey, setShowTwelveDataKey] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        geminiApiKey: settings.geminiApiKey || '',
        twelveDataApiKey: settings.twelveDataApiKey || '',
        telegramChatId: settings.telegramChatId || '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSettings(values as AppSettings);
    toast({
      title: 'Settings Saved',
      description: 'Your API keys have been updated.',
    });
  }

  const isGeminiConfigured = !!settings.geminiApiKey;
  const isTwelveDataConfigured = !!settings.twelveDataApiKey;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Manage the API keys and settings required for the application to function.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Client-Side Storage</AlertTitle>
              <AlertDescription>
                Your API keys are stored securely in your browser's local
                storage. They are not sent to any server other than the respective
                API providers when you use the app's features.
              </AlertDescription>
            </Alert>
            
            <div>
              <h3 className="mb-4 text-lg font-medium">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Gemini API</p>
                    <p className="text-xs text-muted-foreground">Powers AI-based features like news analysis.</p>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm font-semibold", isGeminiConfigured ? "text-green-600" : "text-red-600")}>
                      {isGeminiConfigured ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      {isGeminiConfigured ? 'Configured' : 'Missing Key'}
                  </div>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Twelve Data API</p>
                    <p className="text-xs text-muted-foreground">Provides market data for signal generation.</p>
                  </div>
                  <div className={cn("flex items-center gap-2 text-sm font-semibold", isTwelveDataConfigured ? "text-green-600" : "text-red-600")}>
                      {isTwelveDataConfigured ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      {isTwelveDataConfigured ? 'Configured' : 'Missing Key'}
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <h3 className="text-lg font-medium">API Keys</h3>
                <FormField
                control={form.control}
                name="geminiApiKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Gemini API Key (Required)</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type={showGeminiKey ? 'text' : 'password'}
                            placeholder="Enter your Gemini API Key"
                            className="pl-8 pr-10"
                            {...field}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowGeminiKey(!showGeminiKey)}
                        >
                            {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="twelveDataApiKey"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Twelve Data API Key (Required)</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type={showTwelveDataKey ? 'text' : 'password'}
                            placeholder="Enter your Twelve Data API Key"
                            className="pl-8 pr-10"
                            {...field}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowTwelveDataKey(!showTwelveDataKey)}
                        >
                            {showTwelveDataKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <Alert className="mt-6">
                <Bell className="h-4 w-4" />
                <AlertTitle>Telegram Notifications</AlertTitle>
                <AlertDescription>
                   To receive private signals, first <a href="https://t.me/vibecodefxbot" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-primary">click here to start a chat with the bot</a>. Then, enter your personal Chat ID below. This is optional.
                </AlertDescription>
                <FormField
                control={form.control}
                name="telegramChatId"
                render={({ field }) => (
                    <FormItem className="mt-4">
                    <FormLabel>Telegram Chat ID (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Enter your Telegram Chat ID"
                            className="pl-8"
                            {...field}
                        />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </Alert>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Settings</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    