
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
import { KeyRound, Waves } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
  geminiApiKey: z.string().min(1, 'Gemini API Key is required.'),
  twelveDataApiKey: z.string().min(1, 'Twelve Data API Key is required.'),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
});

export default function Setup() {
  const { settings, setSettings } = useSettings();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
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
            <Waves className="w-10 h-10 text-primary" />
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
                        <Input
                          type="password"
                          placeholder="Enter your Google AI Studio API Key"
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="Enter your Twelve Data API Key"
                          {...field}
                        />
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
                        <Input
                          type="password"
                          placeholder="Needed for Telegram notifications"
                          {...field}
                        />
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
                        <Input
                          placeholder="Needed for Telegram notifications"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
