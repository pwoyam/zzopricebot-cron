import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMessage } from '../src/format.js';
import { fixtureMarket } from '../fixtures/load.js';

const now = new Date('2026-11-03T12:00:00Z');
const crypto = [{ symbol: '₿', name: 'بیت‌کوین', usd: 76967, change24h: 1.234 }];

test('orders sections: gold, dollar, other currencies, crypto', () => {
  const text = buildMessage({ market: fixtureMarket(), crypto }, now);
  const at = (s) => text.indexOf(s);
  assert.ok(at('🥇') !== -1);
  assert.ok(at('🥇') < at('💵'));
  assert.ok(at('💵') < at('💱'));
  assert.ok(at('💱') < at('🪙'));
});

test('formats toman, ounce in USD and signed change', () => {
  const text = buildMessage({ market: fixtureMarket(), crypto }, now);
  assert.match(text, /سکه امامی: <b>179,480,000 تومان<\/b> 🟢 \+0\.01%/);
  assert.match(text, /طلای ۱۸ عیار \(هر گرم\): <b>17,924,900 تومان<\/b> 🔴 -0\.06%/);
  assert.match(text, /اونس جهانی طلا: <b>\$4,260\.40<\/b> 🔴 -4\.43%/);
  assert.match(text, /دلار آمریکا: <b>175,805 تومان<\/b> 🟢 \+1\.83%/);
  assert.match(text, /<b>\$76,967<\/b> 🟢 \+1\.23%/);
});

test('omits the change when the source has none', () => {
  const text = buildMessage({ market: fixtureMarket(), crypto }, now);
  const line = text.split('\n').find((l) => l.includes('ربع'));
  assert.ok(line);
  assert.doesNotMatch(line, /🟢|🔴/);
});

test('skips configured symbols that are missing from the response', () => {
  const usd = { symbol: 'usd', unit: 'IRR', close: 1758050, close_toman: 175805, change_pct: 1.83, date_jalali: '1405/03/20' };
  const market = { gold: new Map(), currencies: new Map([['usd', usd]]) };
  const text = buildMessage({ market, crypto: null }, now);
  assert.match(text, /دلار آمریکا/);
  assert.doesNotMatch(text, /🥇/);
  assert.doesNotMatch(text, /💱/);
});

test('works without a crypto section and shows the market date', () => {
  const text = buildMessage({ market: fixtureMarket(), crypto: null }, now);
  assert.doesNotMatch(text, /🪙/);
  assert.match(text, /📅 .*1405\/03\/20/);
});
