
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
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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

const geminiSchema = z.object({ geminiApiKey: z.string().min(1, 'Gemini API Key is required.') });
const twelveDataSchema = z.object({ twelveDataApiKey: z.string().min(1, 'Twelve Data API Key is required.') });
const telegramSchema = z.object({ telegramChatId: z.string().optional() });
const balanceSchema = z.object({ accountBalance: z.coerce.number().positive("Account balance must be positive.") });
const riskSchema = z.object({ riskPercentage: z.coerce.number().min(0.1, "Risk must be at least 0.1%").max(100, "Cannot exceed 100%.") });

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

  const handleSave = (values: Partial<AppSettings> | { accountBalance: number } | { riskPercentage: number }) => {
    if ('accountBalance' in values) {
      setAccountBalance(values.accountBalance);
    } else if ('riskPercentage' in values) {
      setRiskPercentage(values.riskPercentage);
    } else {
      setSettings(values as AppSettings);
    }
    
    toast({
      title: 'Setting Saved',
      description: 'Your setting has been successfully updated.',
    });
  };

  const isGeminiConfigured = !!settings.geminiApiKey;
  const isTwelveDataConfigured = !!settings.twelveDataApiKey;
  const isTelegramConfigured = !!settings.telegramChatId;
  const isBalanceConfigured = accountBalance > 0;
  const isRiskConfigured = riskPercentage > 0;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Manage API keys, Telegram notifications, and risk parameters all in one place.
        </CardDescription>
      </CardHeader>
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
              fieldName="geminiApiKey"
              dialogTitle="Edit Gemini API Key"
              dialogDescription="Enter your Google AI Studio API Key."
              inputType={showGeminiKey ? 'text' : 'password'}
              inputIcon={<KeyRound />}
              toggleVisibility={() => setShowGeminiKey(!showGeminiKey)}
              showVisibilityToggle={true}
              isVisible={showGeminiKey}
              iconInside={true}
              schema={geminiSchema}
              defaultValue={settings.geminiApiKey || ''}
              onSave={handleSave}
            />
             <StatusItem
              label="Twelve Data API"
              description="Provides market data for signal generation."
              isConfigured={isTwelveDataConfigured}
              fieldName="twelveDataApiKey"
              dialogTitle="Edit Twelve Data API Key"
              dialogDescription="Enter your Twelve Data API Key."
              inputType={showTwelveDataKey ? 'text' : 'password'}
              inputIcon={<KeyRound />}
              toggleVisibility={() => setShowTwelveDataKey(!showTwelveDataKey)}
              showVisibilityToggle={true}
              isVisible={showTwelveDataKey}
              iconInside={true}
              schema={twelveDataSchema}
              defaultValue={settings.twelveDataApiKey || ''}
              onSave={handleSave}
            />
            <StatusItem
              label="Telegram Notifications"
              description="Sends private trade signals to your chat."
              isConfigured={isTelegramConfigured}
              fieldName="telegramChatId"
              dialogTitle="Edit Telegram Chat ID"
              dialogDescription={<TelegramHowTo />}
              inputIcon={<Send />}
              iconInside={true}
              schema={telegramSchema}
              defaultValue={settings.telegramChatId || ''}
              onSave={handleSave}
            />
          </div>
        </div>

        <Separator />
        
        <div>
            <h3 className="mb-4 text-lg font-medium">Risk Management</h3>
            <div className="space-y-2">
                <StatusItem
                    label="Account Balance"
                    description={`Current: $${accountBalance.toLocaleString()}`}
                    isConfigured={isBalanceConfigured}
                    fieldName="accountBalance"
                    dialogTitle="Edit Account Balance"
                    dialogDescription="Set your total account balance for risk calculations."
                    inputType="number"
                    inputIcon={<DollarSign />}
                    iconInside={true}
                    schema={balanceSchema}
                    defaultValue={accountBalance}
                    onSave={handleSave}
                />
                <StatusItem
                    label="Risk Per Trade"
                    description={`Current: ${riskPercentage}%`}
                    isConfigured={isRiskConfigured}
                    fieldName="riskPercentage"
                    dialogTitle="Edit Risk Per Trade"
                    dialogDescription="Set the percentage of your balance to risk on a single trade."
                    inputType="number"
                    inputProps={{ step: "0.1" }}
                    inputIcon={<Percent />}
                    iconInside={true}
                    schema={riskSchema}
                    defaultValue={riskPercentage}
                    onSave={handleSave}
                />
            </div>
             <p className="text-xs text-muted-foreground pt-4">
                These values are used to automatically calculate the lot size for each new trade signal, based on the signal's stop loss.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}

const StatusItem = ({ label, description, isConfigured, fieldName, dialogTitle, dialogDescription, inputType = 'text', inputIcon, toggleVisibility, showVisibilityToggle, isVisible, inputProps, iconInside = false, schema, defaultValue, onSave }: any) => {
    const [open, setOpen] = useState(false);
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { [fieldName]: defaultValue },
    });
    
    const onSubmit = (values: any) => {
        onSave(values);
        setOpen(false); // Close dialog on successful save
    };
    
    // Reset form when dialog opens
    React.useEffect(() => {
        if (open) {
            form.reset({ [fieldName]: defaultValue });
        }
    }, [open, defaultValue, fieldName, form]);

    return (
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="flex items-center gap-3">
                 <div className={cn("flex-shrink-0 flex items-center gap-2 text-sm font-semibold", isConfigured ? "text-green-600" : "text-destructive")}>
                    {isConfigured ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div className="space-y-0.5">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <div className="text-sm text-muted-foreground">{dialogDescription}</div>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} id={`form-${fieldName}`}>
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
                                                className="pl-10 pr-10"
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
                        </form>
                    </Form>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" form={`form-${fieldName}`}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

const TelegramHowTo = () => (
    <div className="space-y-3 text-left">
        <p>Follow these steps to get your personal Chat ID for notifications:</p>
        <ol className="list-decimal list-inside space-y-2">
            <li>
                Start a chat with the TradeAlert bot:
                <a 
                    href="https://t.me/vibecodefxbot" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1 text-primary underline"
                >
                    @vibecodefxbot <Send className="w-3 h-3" />
                </a>
            </li>
            <li>
                From another bot like <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-primary underline">@userinfobot</a>, get your user ID.
            </li>
            <li>Copy your ID and paste it into the input field below.</li>
        </ol>
    </div>
);
    
