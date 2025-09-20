
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
import { KeyRound, Info, Send, Eye, EyeOff, CheckCircle, XCircle, Pencil, DollarSign, Percent } from 'lucide-react';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';


const formSchema = z.object({
  geminiApiKey: z.string().min(1, 'Gemini API Key is required.'),
  twelveDataApiKey: z.string().min(1, 'Twelve Data API Key is required.'),
  telegramChatId: z.string().optional(),
  accountBalance: z.coerce.number().positive("Account balance must be positive."),
  riskPercentage: z.coerce.number().min(0.1, "Risk must be at least 0.1%").max(100, "Cannot exceed 100%."),
});

type AppSettingsProps = {
    accountBalance: number;
    riskPercentage: number;
    setAccountBalance: (value: number) => void;
    setRiskPercentage: (value: number) => void;
};


export default function AppSettings({ accountBalance, riskPercentage, setAccountBalance, setRiskPercentage }: AppSettingsProps) {
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
        accountBalance: accountBalance,
        riskPercentage: riskPercentage,
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    const { accountBalance, riskPercentage, ...apiSettings } = values;
    setSettings(apiSettings as AppSettings);
    setAccountBalance(accountBalance);
    setRiskPercentage(riskPercentage);
    
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been successfully updated.',
    });
  }

  const isGeminiConfigured = !!form.watch('geminiApiKey');
  const isTwelveDataConfigured = !!form.watch('twelveDataApiKey');
  const isTelegramConfigured = !!form.watch('telegramChatId');
  const isBalanceConfigured = form.watch('accountBalance') > 0;
  const isRiskConfigured = form.watch('riskPercentage') > 0;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Manage API keys, Telegram notifications, and risk parameters all in one place.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Client-Side Storage</AlertTitle>
              <AlertDescription>
                Your API keys and settings are stored securely in your browser's local
                storage. They are not sent to any server other than the respective
                API providers.
              </AlertDescription>
            </Alert>
            
            <div>
              <h3 className="mb-4 text-lg font-medium">System Status & Configuration</h3>
              <div className="space-y-2">
                <StatusItem
                  label="Gemini API"
                  description="Powers AI-based features like news analysis."
                  isConfigured={isGeminiConfigured}
                  form={form}
                  fieldName="geminiApiKey"
                  dialogTitle="Edit Gemini API Key"
                  dialogDescription="Enter your Google AI Studio API Key."
                  inputType={showGeminiKey ? 'text' : 'password'}
                  inputIcon={<KeyRound />}
                  toggleVisibility={() => setShowGeminiKey(!showGeminiKey)}
                  showVisibilityToggle={true}
                  isVisible={showGeminiKey}
                  iconInside={true}
                />
                 <StatusItem
                  label="Twelve Data API"
                  description="Provides market data for signal generation."
                  isConfigured={isTwelveDataConfigured}
                  form={form}
                  fieldName="twelveDataApiKey"
                  dialogTitle="Edit Twelve Data API Key"
                  dialogDescription="Enter your Twelve Data API Key."
                  inputType={showTwelveDataKey ? 'text' : 'password'}
                  inputIcon={<KeyRound />}
                  toggleVisibility={() => setShowTwelveDataKey(!showTwelveDataKey)}
                  showVisibilityToggle={true}
                  isVisible={showTwelveDataKey}
                  iconInside={true}
                />
                <StatusItem
                  label="Telegram Notifications"
                  description="Sends private trade signals to your chat."
                  isConfigured={isTelegramConfigured}
                  form={form}
                  fieldName="telegramChatId"
                  dialogTitle="Edit Telegram Chat ID"
                  dialogDescription="Enter your personal Telegram Chat ID to receive notifications."
                  inputIcon={<Send />}
                  iconInside={true}
                />
              </div>
            </div>

            <Separator />
            
            <div>
                <h3 className="mb-4 text-lg font-medium">Risk Management</h3>
                <div className="space-y-2">
                    <StatusItem
                        label="Account Balance"
                        description={`Current: $${form.watch('accountBalance').toLocaleString()}`}
                        isConfigured={isBalanceConfigured}
                        form={form}
                        fieldName="accountBalance"
                        dialogTitle="Edit Account Balance"
                        dialogDescription="Set your total account balance for risk calculations."
                        inputType="number"
                        inputIcon={<DollarSign />}
                        iconInside={true}
                    />
                    <StatusItem
                        label="Risk Per Trade"
                        description={`Current: ${form.watch('riskPercentage')}%`}
                        isConfigured={isRiskConfigured}
                        form={form}
                        fieldName="riskPercentage"
                        dialogTitle="Edit Risk Per Trade"
                        dialogDescription="Set the percentage of your balance to risk on a single trade."
                        inputType="number"
                        inputProps={{ step: "0.1" }}
                        inputIcon={<Percent />}
                        iconInside={true}
                    />
                </div>
                 <p className="text-xs text-muted-foreground pt-4">
                    These values are used to automatically calculate the lot size for each new trade signal, based on the signal's stop loss.
                </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Save All Settings</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

const StatusItem = ({ label, description, isConfigured, form, fieldName, dialogTitle, dialogDescription, inputType = 'text', inputIcon, toggleVisibility, showVisibilityToggle, isVisible, inputProps, iconInside = false }: any) => {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="flex items-center gap-3">
                 <div className={cn("flex-shrink-0 flex items-center gap-2 text-sm font-semibold", isConfigured ? "text-green-600" : "text-red-600")}>
                    {isConfigured ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div className="space-y-0.5">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <p className="text-sm text-muted-foreground">{dialogDescription}</p>
                    </DialogHeader>
                    <FormField
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
                                        {inputIcon}
                                    </div>
                                    <Input
                                        type={inputType}
                                        placeholder={`Enter ${label}`}
                                        className="pl-8 pr-10"
                                        {...field}
                                        {...inputProps}
                                    />
                                    {showVisibilityToggle && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                                            onClick={toggleVisibility}
                                        >
                                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button">Done</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
