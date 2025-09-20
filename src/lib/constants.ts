import { TrendingUp, ArrowRightLeft, Maximize } from 'lucide-react';

export const CURRENCY_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'USD/CHF', 'AUD/USD', 'NZD/USD'];
export const TIMEFRAMES = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'];

export type StrategyId = 'trend' | 'reversion' | 'breakout';

export const STRATEGIES = [
    { id: 'trend', name: 'Trend Following', icon: TrendingUp },
    { id: 'reversion', name: 'Mean Reversion', icon: ArrowRightLeft },
    { id: 'breakout', name: 'Breakout', icon: Maximize },
];
