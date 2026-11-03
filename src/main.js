import { MAX_STALE_HOURS } from './config.js';
import { fetchGold, fetchFx, fetchMetals, fetchCrypto } from './sources/tala24.js';
import { buildMessage } from './format.js';
import { sendMessage, editMessage, pinMessage, TelegramError } from './telegram.js';
import { loadState, saveState } from './state.js';

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

async function safePin(token, chatId, messageId) {
  try {
    await pinMessage(token, chatId, messageId);
    console.log('Message pinned.');
  } catch (err) {
    console.warn(`Pin failed: ${err.message}`);
  }
}

async function main() {
  if (!process.env.TALA24_TOKEN) {
    throw new Error('TALA24_TOKEN must be set');
  }
  if (!dryRun && (!token || !chatId)) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set');
  }

  // همه‌ی چهار بخش ضروری هستند: اگر یکی بیاید یا کهنه باشد، پست نمی‌کنیم.
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

  const state = await loadState();

  if (state.messageId && state.chatId === chatId) {
    try {
      await editMessage(token, chatId, state.messageId, text);
      console.log('Message updated.');
      await safePin(token, chatId, state.messageId);
      return;
    } catch (err) {
      if (err instanceof TelegramError && /message is not modified/i.test(err.description)) {
        console.log('Message unchanged.');
        return;
      }
      if (
        err instanceof TelegramError &&
        /message to edit not found|MESSAGE_ID_INVALID/i.test(err.description)
      ) {
        console.warn('Old message is gone; sending a new one.');
      } else {
        throw err;
      }
    }
  }

  const sent = await sendMessage(token, chatId, text);
  await saveState({ chatId, messageId: sent.message_id });
  console.log('New message sent.');
  await safePin(token, chatId, sent.message_id);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
