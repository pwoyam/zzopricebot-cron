import { fetchJson, HttpError } from '../http.js';

const BASE = 'https://api.oanor.com/irr-api/v1';

function indexBySymbol(list, what) {
  if (!Array.isArray(list)) {
    throw new Error(`oanor: unexpected response shape (${what})`);
  }
  const map = new Map();
  for (const row of list) {
    if (row && typeof row.symbol === 'string' && typeof row.close === 'number') {
      map.set(row.symbol, row);
    }
  }
  return map;
}

export function parseMarket(goldBody, currenciesBody) {
  for (const body of [goldBody, currenciesBody]) {
    if (body?.success === false) {
      throw new Error(`oanor: ${body.message ?? 'request unsuccessful'}`);
    }
  }
  return {
    gold: indexBySymbol(goldBody?.data?.gold, 'gold'),
    currencies: indexBySymbol(currenciesBody?.data?.currencies, 'currencies'),
  };
}

function explain(err) {
  if (!(err instanceof HttpError)) return err;
  const reasons = {
    401: 'API key missing or invalid',
    402: 'active subscription required',
    429: 'rate limit or monthly quota reached',
    502: 'upstream did not respond',
  };
  return new Error(`oanor: ${reasons[err.status] ?? `HTTP ${err.status}`}`);
}

export async function fetchMarket(apiKey) {
  const headers = { 'x-oanor-key': apiKey };
  try {
    // پشت‌سر‌هم و نه هم‌زمان: سقف پلن رایگان ۲ درخواست در ثانیه است.
    const gold = await fetchJson(`${BASE}/gold`, { headers, timeoutMs: 20000 });
    const currencies = await fetchJson(`${BASE}/currencies`, { headers, timeoutMs: 20000 });
    return parseMarket(gold, currencies);
  } catch (err) {
    throw explain(err);
  }
}
