export type CoinMarket = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
};

const COINS = [
  "bitcoin",
  "ethereum",
  "solana",
  "binancecoin",
  "ripple",
  "cardano",
  "dogecoin",
  "avalanche-2",
];

export async function fetchCoinMarkets(): Promise<CoinMarket[]> {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(
    ","
  )}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch market data");
  return res.json();
}
