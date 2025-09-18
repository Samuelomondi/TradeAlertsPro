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
import { KeyRound, Bell, Send, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  geminiApiKey: z.string().min(1, 'Gemini API Key is required.'),
  twelveDataApiKey: z.string().min(1, 'Twelve Data API Key is required.'),
  telegramChatId: z.string().optional(),
});

const CustomIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <path d="M3 3v18h18" />
        <path d="M7 12l5-5 5 5" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))"/>
        <path d="M7 16l5-5 5 5" fill="hsl(var(--primary) / 0.5)" stroke="hsl(var(--primary))"/>
    </svg>
);


export default function Setup() {
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
      title: 'Configuration Saved',
      description:
        'Your API keys have been saved. The application will now load.',
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <CustomIcon className="w-10 h-10 text-primary" />
          </div>
          <CardTitle>Welcome to TradeAlert</CardTitle>
          <CardDescription>
            To get started, please provide the required API keys below.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <KeyRound className="h-4 w-4" />
                <AlertTitle>API Key Storage</AlertTitle>
                <AlertDescription>
                  Your keys are stored only in your browser's local storage and
                  are required for the app to function. They are not shared with
                  any third-party servers except for their respective services.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="geminiApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gemini API Key (Required)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input
                            type={showGeminiKey ? 'text' : 'password'}
                            placeholder="Enter your Google AI Studio API Key"
                            className="pr-10"
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
                            <Input
                            type={showTwelveDataKey ? 'text' : 'password'}
                            placeholder="Enter your Twelve Data API Key"
                            className="pr-10"
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
                    <AlertTitle>Telegram Notifications (Optional)</AlertTitle>
                    <AlertDescription>
                        To receive private notifications, first <a href="https://t.me/vibecodefxbot" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-primary">start a chat with the bot</a>, then find your Chat ID (e.g. from UserInfoBot) and enter it below.
                    </AlertDescription>
                     <FormField
                        control={form.control}
                        name="telegramChatId"
                        render={({ field }) => (
                            <FormItem className="mt-4">
                            <FormLabel>Telegram Chat ID</FormLabel>
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
              <Button type="submit" className="w-full">
                Save and Continue
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
