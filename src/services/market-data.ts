
import {z} from 'zod';
import fetch from 'node-fetch';

// Schema for the latest indicator values used by the AI
export const LatestIndicatorsSchema = z.object({
  currentPrice: z.number(),
  ema20: z.number(),
  ema50: z.number(),
  rsi: z.number(),
  atr: z.number(),
  macdHistogram: z.number(),
  bollingerUpper: z.number(),
  bollingerLower: z.number(),
});


export type LatestIndicators = z.infer<typeof LatestIndicatorsSchema>;
export type MarketDataSource = 'live' | 'mock';

export type MarketDataResponse = {
    latest: LatestIndicators,
    source: MarketDataSource
};

const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';


// Helper to make API calls to Twelve Data
async function fetchTwelveData(endpoint: string, params: Record<string, string>) {
  const query = new URLSearchParams({...params, apikey: API_KEY!}).toString();
  const url = `${BASE_URL}/${endpoint}?${query}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Twelve Data API Error (${response.status}) for ${endpoint}: ${errorText}`);
        throw new Error(`API returned status ${response.status} for ${endpoint}`);
    }
    const data = await response.json();
    if (data.status === 'error' || data.code < 200 || data.code >= 300) {
        console.error(`Twelve Data API Error for ${endpoint}:`, data);
        throw new Error(data.message || `Failed to fetch ${endpoint}`);
    }
    return data;
  } catch (error) {
    console.error(`Network or fetch error for ${url}:`, error);
    if (error instanceof Error) {
        throw new Error(`Failed to retrieve ${endpoint} from Twelve Data: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while fetching ${endpoint}.`);
  }
}

// Helper to get the most recent value from a time series
function getMostRecentValue(data: any, key: string) {
    if (!data.values || data.values.length === 0) {
        throw new Error(`Invalid data structure or empty values for ${key}`);
    }
    const latestValue = data.values[0][key];
    if (latestValue === undefined || latestValue === null) throw new Error(`Could not find recent value for ${key}`);
    return parseFloat(latestValue);
}

/**
 * Fetches market data for a given currency pair and timeframe from Twelve Data.
 *
 * @param currencyPair The currency pair (e.g., 'EUR/USD').
 * @param timeframe The timeframe (e.g., '1H').
 * @returns A promise that resolves to the market data and its source.
 */
export async function getMarketData(
  currencyPair: string,
  timeframe: string
): Promise<MarketDataResponse> {
  // Clear check for API key before making any calls.
  if (!API_KEY || API_KEY === "YOUR_TWELVE_DATA_API_KEY") {
    console.warn('Twelve Data API key is not configured. Falling back to mock data.');
    const { latest } = generateMockMarketData(currencyPair);
    return { latest, source: 'mock' };
  }

  const intervalMap: { [key: string]: string } = {
      '1M': '1min', '5M': '5min', '15M': '15min', '30M': '30min', '1H': '1h', '4H': '4h', '1D': '1day', '1W': '1week'
  };
  const interval = intervalMap[timeframe] || '1h';
  
  const commonParams = { symbol: currencyPair, interval, dp: '5', timezone: 'UTC' };
  
  try {
    const [
      priceData,
      ema20Data,
      ema50Data,
      rsiData,
      atrData,
      macdData,
      bbandsData
    ] = await Promise.all([
      fetchTwelveData('price', { ...commonParams }),
      fetchTwelveData('ema', { ...commonParams, time_period: '20', outputsize: '1' }),
      fetchTwelveData('ema', { ...commonParams, time_period: '50', outputsize: '1' }),
      fetchTwelveData('rsi', { ...commonParams, outputsize: '1', time_period: '14' }),
      fetchTwelveData('atr', { ...commonParams, outputsize: '1', time_period: '14' }),
      fetchTwelveData('macd', { ...commonParams, outputsize: '1', fast_period: '12', slow_period: '26', signal_period: '9' }),
      fetchTwelveData('bbands', { ...commonParams, outputsize: '1', time_period: '20', sd: '2' }),
    ]);

    const latest: LatestIndicators = {
        currentPrice: parseFloat(priceData.price),
        ema20: getMostRecentValue(ema20Data, 'ema'),
        ema50: getMostRecentValue(ema50Data, 'ema'),
        rsi: getMostRecentValue(rsiData, 'rsi'),
        atr: getMostRecentValue(atrData, 'atr'),
        macdHistogram: getMostRecentValue(macdData, 'macd_hist'),
        bollingerUpper: getMostRecentValue(bbandsData, 'upper_band'),
        bollingerLower: getMostRecentValue(bbandsData, 'lower_band'),
    };

    return { latest, source: 'live' };
  } catch (error) {
     console.error('Error fetching one or more market data indicators from Twelve Data:', error);
     console.log('Falling back to mock data for signal generation.');
     const { latest } = generateMockMarketData(currencyPair);
     return { latest, source: 'mock' };
  }
}

/**
 * Generates mock market data.
 * @param currencyPair The currency pair to generate data for.
 * @returns Mock market data including latest values and a time series.
 */
function generateMockMarketData(currencyPair: string): { latest: LatestIndicators } {
    const basePrice = getBasePriceForPair(currencyPair);
    let currentPrice = basePrice * (1 + (Math.random() - 0.5) * 0.05); // Start at a slight offset
    const ema20 = currentPrice * (1 - Math.random() * 0.002);
    const ema50 = currentPrice * (1 - Math.random() * 0.005);


    const latest: LatestIndicators = {
        currentPrice: currentPrice,
        ema20: ema20,
        ema50: ema50,
        rsi: 30 + Math.random() * 40,
        atr: basePrice * 0.001 * (1 + Math.random()),
        macdHistogram: (ema20 - ema50) * (Math.random() * 10),
        bollingerUpper: ema20 + 2 * (basePrice * 0.001),
        bollingerLower: ema20 - 2 * (basePrice * 0.001),
    };

    return { latest };
}


function getBasePriceForPair(pair: string): number {
  switch (pair) {
    case 'EUR/USD':
      return 1.08;
    case 'GBP/USD':
      return 1.27;
    case 'USD/JPY':
      return 157.0;
    case 'USD/CAD':
      return 1.36;
    default:
      return 1.2;
  }
}
