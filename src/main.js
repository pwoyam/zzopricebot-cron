import { CRYPTO } from './config.js';
import { fetchMarket } from './sources/oanor.js';
import { fetchCryptoPrices } from './sources/crypto.js';
import { buildMessage } from './format.js';
import { sendMessage, editMessage, pinMessage, TelegramError } from './telegram.js';
import { loadState, saveState } from './state.js';

const dryRun = process.env.DRY_RUN === '1';
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHANNEL_ID;
const oanorKey = process.env.OANOR_API_KEY;

async function safePin(token, chatId, messageId) {
  try {
    await pinMessage(token, chatId, messageId);
    console.log('Message pinned.');
  } catch (err) {
    // Pin شدن شکست بخورد، نباید کل آپدیت قیمت خراب شود.
    console.warn(`Pin failed: ${err.message}`);
  }
}

async function main() {
  if (!oanorKey) throw new Error('OANOR_API_KEY must be set');

  if (!dryRun && (!token || !chatId)) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set');
  }

  // منبع اصلی ضروری است: اگر خطا بدهد، پیام قبلی کانال دست‌نخورده می‌ماند.
  const market = await fetchMarket(oanorKey);

  // ارز دیجیتال اختیاری است: اگر نیامد، فقط همان بخش حذف می‌شود.
  let crypto = null;
  try {
    crypto = await fetchCryptoPrices(CRYPTO);
  } catch (err) {
    console.warn(`Crypto section skipped: ${err.message}`);
  }

  const text = buildMessage({ market, crypto });

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
        await safePin(token, chatId, state.messageId);
        return;
      }

      if (err instanceof TelegramError && /message to edit not found|MESSAGE_ID_INVALID/i.test(err.description)) {
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
