
'use client';

import { useState, useEffect } from 'react';
import Dashboard from "@/components/dashboard";
import { SettingsProvider, useSettings } from '@/components/settings-provider';
import Setup from '@/components/setup';
import { Skeleton } from '@/components/ui/skeleton';

function App() {
  const { settings, loaded } = useSettings();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !loaded) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-4xl p-8 space-y-8">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    );
  }

  const isConfigured = settings.geminiApiKey && settings.twelveDataApiKey;

  return isConfigured ? <Dashboard /> : <Setup />;
}

export default function Home() {
  return (
    <main>
        <SettingsProvider>
            <App />
        </SettingsProvider>
    </main>
  );
}
