
import {z} from 'zod';
import fetch from 'node-fetch';

// Schema for a single data point in the time series
export const MarketDataPointSchema = z.object({
    time: z.string(),
    price: z.number(),
    ema20: z.number().optional(),
    ema50: z.number().optional(),
});

// Schema for the entire time series
export const MarketDataSeriesSchema = z.array(MarketDataPointSchema);

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


export type MarketDataPoint = z.infer<typeof MarketDataPointSchema>;
export type MarketDataSeries = z.infer<typeof MarketDataSeriesSchema>;
export type LatestIndicators = z.infer<typeof LatestIndicatorsSchema>;
export type MarketDataSource = 'live' | 'mock';

export type MarketDataResponse = {
    latest: LatestIndicators,
    series: MarketDataSeries,
    source: MarketDataSource
};

const API_KEY = process.env.TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';
const SERIES_OUTPUT_SIZE = 50;


// Helper to make API calls to Twelve Data
async function fetchTwelveData(endpoint: string, params: Record<string, string>) {
  if (!API_KEY || API_KEY === "YOUR_TWELVE_DATA_API_KEY") {
    throw new Error('Twelve Data API key is not configured.');
  }
  const query = new URLSearchParams({...params, apikey: API_KEY}).toString();
  const url = `${BASE_URL}/${endpoint}?${query}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Twelve Data API Error (${response.status}): ${errorText}`);
        throw new Error(`Failed to fetch data from Twelve Data. Status: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'error' || data.code < 200 || data.code >= 300) {
        console.error('Twelve Data API Error:', data);
        throw new Error(data.message || 'Failed to fetch data from Twelve Data.');
    }
    return data;
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    if (error instanceof Error) {
        throw new Error(`Failed to retrieve market data from Twelve Data: ${error.message}`);
    }
    throw new Error('An unknown error occurred while fetching from Twelve Data.');
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
      fetchTwelveData('time_series', { ...commonParams, outputsize: String(SERIES_OUTPUT_SIZE) }),
      fetchTwelveData('ema', { ...commonParams, time_period: '20', outputsize: String(SERIES_OUTPUT_SIZE) }),
      fetchTwelveData('ema', { ...commonParams, time_period: '50', outputsize: String(SERIES_OUTPUT_SIZE) }),
      fetchTwelveData('rsi', { ...commonParams, outputsize: '1', time_period: '14' }),
      fetchTwelveData('atr', { ...commonParams, outputsize: '1', time_period: '14' }),
      fetchTwelveData('macd', { ...commonParams, outputsize: '1', fast_period: '12', slow_period: '26', signal_period: '9' }),
      fetchTwelveData('bbands', { ...commonParams, outputsize: '1', time_period: '20', sd: '2' }),
    ]);

    if (!priceData.values || priceData.values.length === 0) {
        throw new Error('Time series data is empty.');
    }
    
    const latest: LatestIndicators = {
        currentPrice: parseFloat(priceData.values[0].close),
        ema20: getMostRecentValue(ema20Data, 'ema'),
        ema50: getMostRecentValue(ema50Data, 'ema'),
        rsi: getMostRecentValue(rsiData, 'rsi'),
        atr: getMostRecentValue(atrData, 'atr'),
        macdHistogram: getMostRecentValue(macdData, 'macd_hist'),
        bollingerUpper: getMostRecentValue(bbandsData, 'upper_band'),
        bollingerLower: getMostRecentValue(bbandsData, 'lower_band'),
    };
    
    // Create a map for quick lookups
    const ema20Map = new Map(ema20Data.values.map((v: any) => [v.datetime, parseFloat(v.ema)]));
    const ema50Map = new Map(ema50Data.values.map((v: any) => [v.datetime, parseFloat(v.ema)]));

    // Combine data, reversing price data to be chronological
    const series: MarketDataSeries = priceData.values.reverse().map((v: any) => ({
        time: v.datetime,
        price: parseFloat(v.close),
        ema20: ema20Map.get(v.datetime),
        ema50: ema50Map.get(v.datetime),
    }));

    return { latest, series, source: 'live' };
  } catch (error) {
     console.error('Error fetching market data from Twelve Data:', error);
     console.log('Falling back to mock data.');
     const { latest, series } = generateMockMarketData(currencyPair);
     return { latest, series, source: 'mock' };
  }
}

/**
 * Generates mock market data.
 * @param currencyPair The currency pair to generate data for.
 * @returns Mock market data including latest values and a time series.
 */
function generateMockMarketData(currencyPair: string): { latest: LatestIndicators, series: MarketDataSeries } {
    const basePrice = getBasePriceForPair(currencyPair);
    let currentPrice = basePrice * (1 + (Math.random() - 0.5) * 0.05); // Start at a slight offset
    const series: MarketDataSeries = [];
    const volatility = 0.005; // Increased volatility factor

    // Generate a plausible time series
    for (let i = 0; i < SERIES_OUTPUT_SIZE; i++) {
        const time = new Date(Date.now() - (SERIES_OUTPUT_SIZE - i) * 60 * 60 * 1000).toISOString();
        // Create a more noticeable random walk
        const movement = (Math.random() - 0.49) * volatility;
        currentPrice *= (1 + movement);
        
        series.push({
            time,
            price: currentPrice,
            ema20: currentPrice * (1 - Math.random() * 0.002),
            ema50: currentPrice * (1 - Math.random() * 0.005),
        });
    }

    const latestPoint = series[series.length - 1];

    const latest: LatestIndicators = {
        currentPrice: latestPoint.price,
        ema20: latestPoint.ema20!,
        ema50: latestPoint.ema50!,
        rsi: 30 + Math.random() * 40,
        atr: basePrice * 0.001 * (1 + Math.random()),
        macdHistogram: (latestPoint.ema20! - latestPoint.ema50!) * (Math.random() * 10),
        bollingerUpper: latestPoint.ema20! + 2 * (basePrice * 0.001),
        bollingerLower: latestPoint.ema20! - 2 * (basePrice * 0.001),
    };

    return { latest, series };
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
