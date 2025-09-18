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

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Helper to make API calls to Alpha Vantage
async function fetchAlphaVantageData(params: Record<string, string>) {
  if (!API_KEY) {
    throw new Error('Alpha Vantage API key is not configured.');
  }
  const query = new URLSearchParams({...params, apikey: API_KEY}).toString();
  const url = `${BASE_URL}?${query}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data['Note'] || data['Error Message']) {
        // This handles API call limits or other errors
        console.error('Alpha Vantage API Error:', data);
        throw new Error('Failed to fetch data from Alpha Vantage. The free API has a limit of 25 requests per day.');
    }
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw new Error('Failed to retrieve market data.');
  }
}

// Helper to get the most recent value from a time series
function getMostRecentValue(data: any, key: string) {
    const seriesKey = Object.keys(data).find(k => k.startsWith('Technical Analysis:'));
    if (!seriesKey) throw new Error(`Invalid data structure for ${key}`);

    const series = data[seriesKey];
    const latestDate = Object.keys(series).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
    const value = series[latestDate]?.[key];

    if (value === undefined) throw new Error(`Could not find recent value for ${key}`);
    return parseFloat(value);
}


/**
 * Fetches market data for a given currency pair and timeframe.
 *
 * @param currencyPair The currency pair (e.g., 'EUR/USD').
 * @param timeframe The timeframe (e.g., '1H').
 * @returns A promise that resolves to the market data.
 */
export async function getMarketData(
  currencyPair: string,
  timeframe: string
): Promise<MarketData> {
  const [from_symbol, to_symbol] = currencyPair.split('/');
  const intervalMap: { [key: string]: string } = {
      '1M': '1min', '5M': '5min', '15M': '15min', '30M': '30min', '1H': '60min', '1D': 'daily', '1W': 'weekly'
  };
  const interval = intervalMap[timeframe] || '60min';
  
  const commonParams = { from_symbol, to_symbol, interval, time_period: '14', series_type: 'close' };
  
  try {
    const [
      quoteData,
      ema20Data,
      ema50Data,
      rsiData,
      atrData,
      macdData,
      bbandsData
    ] = await Promise.all([
      fetchAlphaVantageData({ function: 'CURRENCY_EXCHANGE_RATE', from_currency: from_symbol, to_currency: to_symbol }),
      fetchAlphaVantageData({ ...commonParams, function: 'EMA', time_period: '20' }),
      fetchAlphaVantageData({ ...commonParams, function: 'EMA', time_period: '50' }),
      fetchAlphaVantageData({ ...commonParams, function: 'RSI' }),
      fetchAlphaVantageData({ ...commonParams, function: 'ATR' }),
      fetchAlphaVantageData({ ...commonParams, function: 'MACD', fastperiod: '12', slowperiod: '26', signalperiod: '9' }),
      fetchAlphaVantageData({ ...commonParams, function: 'BBANDS', nbdevup: '2', nbdevdn: '2' }),
    ]);

    const currentPrice = parseFloat(quoteData['Realtime Currency Exchange Rate']['5. Exchange Rate']);
    if (!currentPrice) throw new Error('Could not fetch current price.');

    return {
      currentPrice,
      ema20: getMostRecentValue(ema20Data, 'EMA'),
      ema50: getMostRecentValue(ema50Data, 'EMA'),
      rsi: getMostRecentValue(rsiData, 'RSI'),
      atr: getMostRecentValue(atrData, 'ATR'),
      macdHistogram: getMostRecentValue(macdData, 'MACD_Hist'),
      bollingerUpper: getMostRecentValue(bbandsData, 'Real Upper Band'),
      bollingerLower: getMostRecentValue(bbandsData, 'Real Lower Band'),
    };
  } catch (error) {
     console.error('Error fetching market data from Alpha Vantage:', error);
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
