import { MAX_STALE_HOURS } from './config.js';
import { fetchGold, fetchFx, fetchMetals, fetchCrypto } from './sources/tala24.js';
import { buildMessage } from './format.js';
import { sendMessage } from './telegram.js';

const dryRun = process.env.DRY_RUN === '1';
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHANNEL_ID;

function assertFresh(ts, label) {
  if (!ts) throw new Error(`${label}: no timestamp in response`);
  const ageHours = (Date.now() / 1000 - ts) / 3600;
  if (ageHours > MAX_STALE_HOURS) {
    throw new Error(
      `${label}: stale data (${ageHours.toFixed(1)}h old, limit ${MAX_STALE_HOURS}h)`,
    );
  }
}

async function main() {
  if (!process.env.TALA24_TOKEN) {
    throw new Error('TALA24_TOKEN must be set');
  }
  if (!dryRun && (!token || !chatId)) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set');
  }

  const [gold, fx, metals, crypto] = await Promise.all([
    fetchGold(),
    fetchFx(),
    fetchMetals(),
    fetchCrypto(),
  ]);

  assertFresh(gold.ts, 'gold');
  assertFresh(fx.ts, 'fx');
  assertFresh(metals.ts, 'metals');
  assertFresh(crypto.ts, 'crypto');

  const text = buildMessage({ gold, fx, metals, crypto });

  if (dryRun) {
    console.log(text);
    return;
  }

  const sent = await sendMessage(token, chatId, text);
  console.log(`New message sent: id=${sent.message_id}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
