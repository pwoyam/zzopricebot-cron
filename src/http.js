const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchJson(url, { attempts = 3, timeoutMs = 15000 } = {}) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'zzopricebot/1.0' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      if (i < attempts) await sleep(2000 * i);
    }
  }
  throw new Error(`Request failed after ${attempts} attempts (${new URL(url).host}): ${lastError.message}`);
}
