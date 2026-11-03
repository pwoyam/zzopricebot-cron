export class TelegramError extends Error {
  constructor(method, description, code) {
    super(`Telegram ${method} failed: ${description}`);
    this.description = description;
    this.code = code;
  }
}

// توکن داخل URL است؛ پس هیچ‌وقت URL یا خطای خام شبکه را چاپ نمی‌کنیم.
async function call(token, method, params) {
  let res;
  try {
    res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    throw new Error(`Telegram ${method} network error: ${err.name}`);
  }

  const data = await res.json().catch(() => null);

  if (!data?.ok) {
    throw new TelegramError(
      method,
      data?.description ?? `HTTP ${res.status}`,
      data?.error_code ?? res.status,
    );
  }

  return data.result;
}

export const sendMessage = (token, chatId, text) =>
  call(token, 'sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });

export const editMessage = (token, chatId, messageId, text) =>
  call(token, 'editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
  });

export const pinMessage = (token, chatId, messageId) =>
  call(token, 'pinChatMessage', {
    chat_id: chatId,
    message_id: messageId,
  });
