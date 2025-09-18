
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

export const MarketDataSeriesSchema = z.object({
    time: z.string(),
    price: z.number(),
    ema20: z.number().optional(),
    ema50: z.number().optional(),
});


export type LatestIndicators = z.infer<typeof LatestIndicatorsSchema>;
export type MarketDataSeries = z.infer<typeof MarketDataSeriesSchema>;
export type MarketDataSource = 'live' | 'mock';

export type MarketDataResponse = {
    latest: LatestIndicators,
    series: MarketDataSeries[],
    source: MarketDataSource
};

const BASE_URL = 'https://api.twelvedata.com';


// Helper to make API calls to Twelve Data
async function fetchTwelveData(endpoint: string, params: Record<string, string>, apiKey: string) {
  if (!apiKey || apiKey.startsWith("YOUR_")) {
      throw new Error(`Twelve Data API key is not configured.`);
  }

  const query = new URLSearchParams({...params, apikey: apiKey }).toString();
  const url = `${BASE_URL}/${endpoint}?${query}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Twelve Data API Error (${response.status}) for ${endpoint}: ${errorText}`);
        throw new Error(`API returned status ${response.status} for ${endpoint}. Response: ${errorText}`);
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
 * @param apiKey The Twelve Data API key.
 * @returns A promise that resolves to the market data and its source.
 */
export async function getMarketData(
  currencyPair: string,
  timeframe: string,
  apiKey?: string
): Promise<MarketDataResponse> {
  // Clear check for API key before making any calls.
  if (!apiKey || apiKey.startsWith("YOUR_")) {
    console.warn('Twelve Data API key is not configured. Falling back to mock data.');
    const { latest, series } = generateMockMarketData(currencyPair);
    return { latest, series, source: 'mock' };
  }

  const intervalMap: { [key: string]: string } = {
      '1M': '1min', '5M': '5min', '15M': '15min', '30M': '30min', '1H': '1h', '4H': '4h', '1D': '1day', '1W': '1week'
  };
  const interval = intervalMap[timeframe] || '1h';
  const outputsize = '50';
  
  const commonParams = { symbol: currencyPair, interval, dp: '5', timezone: 'UTC', outputsize };
  
  try {
    const [
      priceData,
      ema20Data,
      ema50Data,
      rsiData,
      atrData,
      macdData,
      bbandsData,
      timeSeriesData
    ] = await Promise.all([
      fetchTwelveData('price', { ...commonParams }, apiKey),
      fetchTwelveData('ema', { ...commonParams, time_period: '20' }, apiKey),
      fetchTwelveData('ema', { ...commonParams, time_period: '50' }, apiKey),
      fetchTwelveData('rsi', { ...commonParams, time_period: '14' }, apiKey),
      fetchTwelveData('atr', { ...commonParams, time_period: '14' }, apiKey),
      fetchTwelveData('macd', { ...commonParams, fast_period: '12', slow_period: '26', signal_period: '9' }, apiKey),
      fetchTwelveData('bbands', { ...commonParams, time_period: '20', sd: '2' }, apiKey),
      fetchTwelveData('time_series', {...commonParams, outputsize}, apiKey)
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
    
    const series: MarketDataSeries[] = timeSeriesData.values.map((d: any, i: number) => {
        const ema20Value = ema20Data.values.find((e: any) => e.datetime === d.datetime);
        const ema50Value = ema50Data.values.find((e: any) => e.datetime === d.datetime);
        return {
            time: d.datetime,
            price: parseFloat(d.close),
            ema20: ema20Value ? parseFloat(ema20Value.ema) : undefined,
            ema50: ema50Value ? parseFloat(ema50Value.ema) : undefined,
        };
    });

    return { latest, series, source: 'live' };
  } catch (error) {
     console.error('Error fetching one or more market data indicators from Twelve Data:', error);
     console.log('Falling back to mock data for signal generation.');
     const { latest, series } = generateMockMarketData(currencyPair);
     return { latest, series, source: 'mock' };
  }
}

/**
 * Generates mock market data.
 * @param currencyPair The currency pair to generate data for.
 * @returns Mock market data including latest values and a time series.
 */
function generateMockMarketData(currencyPair: string): { latest: LatestIndicators, series: MarketDataSeries[] } {
    const basePrice = getBasePriceForPair(currencyPair);
    
    const series: MarketDataSeries[] = [];
    let currentPrice = basePrice * (1 + (Math.random() - 0.5) * 0.05); // Start at a slight offset

    for (let i = 0; i < 50; i++) {
        const time = new Date(Date.now() - i * 60 * 60 * 1000).toISOString(); // Go back `i` hours
        const price = currentPrice * (1 + (Math.random() - 0.5) * 0.005);
        series.push({
            time,
            price: price,
            ema20: price * (1 - Math.random() * 0.002),
            ema50: price * (1 - Math.random() * 0.005),
        });
        currentPrice = price;
    }


    const latest: LatestIndicators = {
        currentPrice: series[0].price,
        ema20: series[0].ema20!,
        ema50: series[0].ema50!,
        rsi: 30 + Math.random() * 40,
        atr: basePrice * 0.001 * (1 + Math.random()),
        macdHistogram: (series[0].ema20! - series[0].ema50!) * (Math.random() * 10),
        bollingerUpper: series[0].ema20! + 2 * (basePrice * 0.001),
        bollingerLower: series[0].ema20! - 2 * (basePrice * 0.001),
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
    case 'USD/CHF':
      return 0.91;
    case 'AUD/USD':
      return 0.66;
    case 'NZD/USD':
      return 0.61;
    default:
      return 1.2;
  }
}
