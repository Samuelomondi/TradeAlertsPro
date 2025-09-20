
'use client';

import { SettingsProvider } from '@/components/settings-provider';
import Dashboard from '@/components/dashboard';

export default function Home() {
  return (
    <main>
        <SettingsProvider>
            <Dashboard />
        </SettingsProvider>
    </main>
  );
}
