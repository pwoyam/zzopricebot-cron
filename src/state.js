import { readFile, writeFile } from 'node:fs/promises';

const STATE_FILE = new URL('../state.json', import.meta.url);

export async function loadState() {
  try {
    return JSON.parse(await readFile(STATE_FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return { chatId: null, messageId: null };
    throw err;
  }
}

export async function saveState(state) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}
