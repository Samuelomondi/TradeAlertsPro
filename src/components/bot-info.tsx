
'use client';

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
import { KeyRound, Info } from 'lucide-react';

const formSchema = z.object({
  geminiApiKey: z.string().min(1, 'Gemini API Key is required.'),
  twelveDataApiKey: z.string().min(1, 'Twelve Data API Key is required.'),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
});

export default function BotInfo() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSettings(values as AppSettings);
    toast({
      title: 'Settings Saved',
      description: 'Your API keys have been updated.',
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Manage the API keys required for the application to function.
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

            <div className="space-y-4">
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
                            type="password"
                            placeholder="Enter your Gemini API Key"
                            className="pl-8"
                            {...field}
                        />
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
                            type="password"
                            placeholder="Enter your Twelve Data API Key"
                            className="pl-8"
                            {...field}
                        />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="telegramBotToken"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Telegram Bot Token (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="password"
                            placeholder="Optional: For Telegram notifications"
                            className="pl-8"
                            {...field}
                        />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="telegramChatId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Telegram Chat ID (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Optional: For Telegram notifications"
                            className="pl-8"
                            {...field}
                        />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save Settings</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
