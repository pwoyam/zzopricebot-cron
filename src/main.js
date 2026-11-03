import { ASSETS } from './config.js';
import { fetchCryptoPrices } from './sources/crypto.js';
import { buildMessage } from './format.js';
import { sendMessage, editMessage, TelegramError } from './telegram.js';
import { loadState, saveState } from './state.js';

const dryRun = process.env.DRY_RUN === '1';
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHANNEL_ID;

async function main() {
  const prices = await fetchCryptoPrices(ASSETS);
  const text = buildMessage(prices);

  if (dryRun) {
    console.log(text);
    return;
  }
  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set');
  }

  const state = await loadState();

  if (state.messageId && state.chatId === chatId) {
    try {
      await editMessage(token, chatId, state.messageId, text);
      console.log('Message updated.');
      return;
    } catch (err) {
      if (err instanceof TelegramError && /message is not modified/i.test(err.description)) {
        console.log('Message unchanged.');
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
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
