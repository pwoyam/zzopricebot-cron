import { fetchJson } from '../http.js';

export async function fetchCryptoPrices(assets) {
  const ids = assets.map((a) => a.id).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  const data = await fetchJson(url);

  return assets.map((asset) => {
    const row = data[asset.id];
    if (!row || typeof row.usd !== 'number') {
      throw new Error(`CoinGecko: no price for ${asset.id}`);
    }
    return {
      ...asset,
      usd: row.usd,
      change24h: typeof row.usd_24h_change === 'number' ? row.usd_24h_change : null,
    };
  });
}
