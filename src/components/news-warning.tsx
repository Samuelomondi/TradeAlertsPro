import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export default function NewsWarning() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>News & Volatility Warning</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>High-Impact News Advisory</AlertTitle>
          <AlertDescription>
            Major economic data releases can cause extreme market volatility, slippage, and wider spreads. Trading during these periods carries significantly higher risk. Always check an economic calendar before placing trades. This bot does not account for news events.
          </AlertDescription>
        </Alert>

        <div className="mt-6">
            <h3 className="font-semibold mb-2">Key Upcoming Events (Example)</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
                <li><span className="font-semibold">US Non-Farm Payroll:</span> Friday, 08:30 EST</li>
                <li><span className="font-semibold">ECB Interest Rate Decision:</span> Thursday, 14:00 CET</li>
                <li><span className="font-semibold">BoJ Policy Statement:</span> Tuesday, 23:50 JST</li>
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
