import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rss, Server, User, KeyRound } from "lucide-react";

export default function BotInfo() {
  const infoItems = [
    { icon: Rss, label: "Bot Status", value: "Connected & Monitoring", color: "text-green-500" },
    { icon: Server, label: "Server", value: process.env.MT_SERVER || 'N/A' },
    { icon: User, label: "Login", value: process.env.MT_LOGIN || 'N/A' },
    { icon: KeyRound, label: "Password", value: process.env.MT_PASSWORD || 'N/A' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot Information</CardTitle>
        <CardDescription>Details and credentials for the trading environment.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <item.icon className={`w-6 h-6 mr-4 text-primary`} />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className={`font-semibold ${item.color || ''}`}>{item.value}</p>
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-4">
          Note: Credentials are for display purposes and are managed via environment variables. This application does not directly connect to the trading server.
        </p>
      </CardContent>
    </Card>
  );
}
