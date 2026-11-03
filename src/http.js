const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class HttpError extends Error {
  constructor(host, status) {
    super(`HTTP ${status} from ${host}`);
    this.status = status;
  }
}

// هدرها (مثل کلید API) هرگز چاپ نمی‌شوند؛ فقط نام میزبان و کد وضعیت در خطا می‌آید.
export async function fetchJson(url, { headers = {}, attempts = 3, timeoutMs = 15000 } = {}) {
  const host = new URL(url).host;
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'zzopricebot/1.0', ...headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) throw new HttpError(host, res.status);
      return await res.json();
    } catch (err) {
      lastError = err;
      // خطای ۴xx با تکرار درست نمی‌شود (مثل کلید اشتباه یا اتمام سهمیه).
      const retryable = !(err instanceof HttpError) || err.status >= 500;
      if (!retryable || i === attempts) break;
      await sleep(2000 * i);
    }
  }
  if (lastError instanceof HttpError) throw lastError;
  throw new Error(`Request to ${host} failed: ${lastError.name}`);
}
