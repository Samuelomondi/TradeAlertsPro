import {z} from 'zod';

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
  // =================================================================
  // TODO: Add your live market data API fetching logic here.
  //
  // 1. Use your API key and an external API (like Alpha Vantage, Twelve Data, etc.)
  //    to fetch the latest price and technical indicator values.
  // 2. Replace the mock data below with the data from your API response.
  //
  // Example using fetch:
  // const apiKey = 'YOUR_API_KEY';
  // const url = `https://api.your-provider.com/...?pair=${currencyPair}&timeframe=${timeframe}&apikey=${apiKey}`;
  // const response = await fetch(url);
  // const data = await response.json();
  // return { ... };
  // =================================================================

  // For now, return mock data.
  // This simulates a real API call for demonstration purposes.
  console.log(
    `Simulating market data fetch for ${currencyPair} on timeframe ${timeframe}`
  );
  return generateMockMarketData(currencyPair);
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
