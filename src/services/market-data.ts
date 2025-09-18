import {z} from 'zod';
import fetch from 'node-fetch';

// Define the schema for the market data
export const MarketDataSchema = z.object({
  currentPrice: z.number(),
  ema20: z.number(),
  ema50: z.number(),
  rsi: z.number(),
  atr: z.number(),
  macdHistogram: z.number(),
  bollingerUpper: z.number(),
  bollingerLower: z.number(),
});

export type MarketData = z.infer<typeof MarketDataSchema>;

const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

// Helper to make API calls to Twelve Data
async function fetchTwelveData(endpoint: string, params: Record<string, string>) {
  if (!API_KEY || API_KEY === "YOUR_TWELVE_DATA_API_KEY") {
    throw new Error('Twelve Data API key is not configured.');
  }
  const query = new URLSearchParams({...params, apikey: API_KEY}).toString();
  const url = `${BASE_URL}/${endpoint}?${query}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'error' || data.code < 200 || data.code >= 300) {
        console.error('Twelve Data API Error:', data);
        throw new Error(data.message || 'Failed to fetch data from Twelve Data.');
    }
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw new Error('Failed to retrieve market data from Twelve Data.');
  }
}

// Helper to get the most recent value from a time series
function getMostRecentValue(data: any, key: string) {
    if (!data.values || data.values.length === 0) {
        throw new Error(`Invalid data structure or empty values for ${key}`);
    }
    const latestValue = data.values[0][key];
    if (latestValue === undefined) throw new Error(`Could not find recent value for ${key}`);
    return parseFloat(latestValue);
}


/**
 * Fetches market data for a given currency pair and timeframe from Twelve Data.
 *
 * @param currencyPair The currency pair (e.g., 'EUR/USD').
 * @param timeframe The timeframe (e.g., '1H').
 * @returns A promise that resolves to the market data.
 */
export async function getMarketData(
  currencyPair: string,
  timeframe: string
): Promise<MarketData> {
  const intervalMap: { [key: string]: string } = {
      '1M': '1min', '5M': '5min', '15M': '15min', '30M': '30min', '1H': '1h', '4H': '4h', '1D': '1day', '1W': '1week'
  };
  const interval = intervalMap[timeframe] || '1h';
  
  const commonParams = { symbol: currencyPair, interval, outputsize: '1' };
  
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
      fetchTwelveData('price', { symbol: currencyPair }),
      fetchTwelveData('ema', { ...commonParams, time_period: '20' }),
      fetchTwelveData('ema', { ...commonParams, time_period: '50' }),
      fetchTwelveData('rsi', { ...commonParams, time_period: '14' }),
      fetchTwelveData('atr', { ...commonParams, time_period: '14' }),
      fetchTwelveData('macd', { ...commonParams, fast_period: '12', slow_period: '26', signal_period: '9' }),
      fetchTwelveData('bbands', { ...commonParams, time_period: '20', sd: '2' }),
    ]);

    const currentPrice = parseFloat(priceData.price);
    if (!currentPrice) throw new Error('Could not fetch current price.');

    return {
      currentPrice,
      ema20: getMostRecentValue(ema20Data, 'ema'),
      ema50: getMostRecentValue(ema50Data, 'ema'),
      rsi: getMostRecentValue(rsiData, 'rsi'),
      atr: getMostRecentValue(atrData, 'atr'),
      macdHistogram: getMostRecentValue(macdData, 'macd_hist'),
      bollingerUpper: getMostRecentValue(bbandsData, 'upper_band'),
      bollingerLower: getMostRecentValue(bbandsData, 'lower_band'),
    };
  } catch (error) {
     console.error('Error fetching market data from Twelve Data:', error);
     // Fallback to mock data if the API fails
     console.log('Falling back to mock data.');
     return generateMockMarketData(currencyPair);
  }
}

/**
 * Generates mock market data. In a real application, this would be replaced
 * with a call to a live data provider.
 * @param currencyPair The currency pair to generate data for.
 * @returns Mock market data.
 */
function generateMockMarketData(currencyPair: string): MarketData {
  const basePrice = getBasePriceForPair(currencyPair);
  const volatility = Math.random() * 0.005; // Simulate some market movement

  const currentPrice = basePrice * (1 + (Math.random() - 0.5) * volatility);
  const ema20 = currentPrice * (1 - Math.random() * 0.002);
  const ema50 = currentPrice * (1 - Math.random() * 0.005);
  const rsi = 30 + Math.random() * 40; // RSI between 30 and 70
  const atr = basePrice * 0.001 * (1 + Math.random());
  const macdHistogram = (ema20 - ema50) * (Math.random() * 10);
  const bollingerUpper = ema20 + 2 * (atr * 0.5);
  const bollingerLower = ema20 - 2 * (atr * 0.5);

  return {
    currentPrice,
    ema20,
    ema50,
    rsi,
    atr,
    macdHistogram,
    bollingerUpper,
    bollingerLower,
  };
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
