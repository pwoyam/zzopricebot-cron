const BASE = 'https://24tala.ir/api_v1.php';
const TIMEOUT_MS = 15_000;

async function callApi(r) {
  const token = process.env.TALA24_TOKEN;
  if (!token) throw new Error('TALA24_TOKEN is not set');

  const url = `${BASE}?r=${encodeURIComponent(r)}`;
  const res = await fetch(url, {
    headers: {
      'X-Api-Token': token,
      Accept: 'application/json',
      'User-Agent': 'zzopricebot/1.0',
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`24tala ${r}: HTTP ${res.status}`);
  const json = await res.json();
  if (!json?.ok) {
    throw new Error(`24tala ${r}: ${json?.message ?? 'not ok'} (${json?.error_code ?? '?'})`);
  }
  return json.data;
}

export async function fetchGold() {
  const data = await callApi('gold/current');
  return {
    ts: data.ts,
    current: data.current,                // تومان
    yesterdayClose: data.yesterday?.close,
    todayClose: data.today?.close,
  };
}

export async function fetchFx() {
  const data = await callApi('fx');
  return { items: data.items ?? [], ts: data.items?.[0]?.ts };
}

export async function fetchMetals() {
  const data = await callApi('metals');
  return { items: data.items ?? [], ts: data.items?.[0]?.ts };
}

export async function fetchCrypto() {
  const data = await callApi('crypto');
  return { items: data.items ?? [], ts: data.items?.[0]?.ts };
}
