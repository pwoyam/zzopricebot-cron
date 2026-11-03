import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMessage } from '../src/format.js';

const now = new Date('2026-11-03T12:00:00Z');

test('formats prices with signed 24h change', () => {
  const text = buildMessage(
    [
      { symbol: '₿', name: 'بیت‌کوین', usd: 76967, change24h: 1.234 },
      { symbol: 'Ξ', name: 'اتریوم', usd: 2345.6, change24h: -0.5 },
    ],
    now,
  );
  assert.match(text, /<b>\$76,967<\/b> 🟢 \+1\.23%/);
  assert.match(text, /<b>\$2,346<\/b> 🔴 -0\.50%/);
});

test('omits the change when it is unknown', () => {
  const text = buildMessage([{ symbol: '₿', name: 'x', usd: 100, change24h: null }], now);
  assert.doesNotMatch(text, /🟢|🔴/);
});

test('escapes HTML in names', () => {
  const text = buildMessage([{ symbol: '₿', name: 'a<b>&', usd: 1, change24h: null }], now);
  assert.match(text, /a&lt;b&gt;&amp;/);
});
