import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMessage } from '../src/format.js';

const TS = 1793704920;
const GOLD   = { ts: TS, current: 25612910, yesterdayClose: 25774500, todayClose: 25625100 };
const FX     = { ts: TS, items: [
  { code: 'USD', name: 'دلار آمریکا', buy: 272150, sell: 274900, ts: TS },
  { code: 'EUR', name: 'یورو',       buy: 304200, sell: 307300, ts: TS },
  { code: 'GBP', name: 'پوند انگلیس', buy: 359500, sell: 365000, ts: TS },
]};
const METALS = { ts: TS, items: [
  { code: 'geram18',    name: 'گرم طلای ۱۸ عیار',   price: 25612910, change_pct: 0.63,   ts: TS },
  { code: 'abshode',    name: 'طلای آبشده (مثقال)', price: 110950000, change_pct: 0.63,  ts: TS },
  { code: 'seke_emami', name: 'سکه امامی',          price: 262500000, change_pct: 0.38,  ts: TS },
  { code: 'ounce',      name: 'انس جهانی طلا',      price: 3907.9,    change_pct: null,  ts: TS },
]};
const CRYPTO = { ts: TS, items: [
  { code: 'BTC',  name: 'بیت‌کوین', latest: 210569989750, dayChange: -0.9,  ts: TS },
  { code: 'ETH',  name: 'اتریوم',   latest: 6203626280,   dayChange: -0.74, ts: TS },
  { code: 'USDT', name: 'تتر',      latest: 2735590,      dayChange: -0.05, ts: TS },
]};

const build = () => buildMessage({ gold: GOLD, fx: FX, metals: METALS, crypto: CRYPTO });

test('all four sections render', () => {
  const out = build();
  assert.match(out, /🥇.*طلا و سکه/);
  assert.match(out, /💵.*دلار/);
  assert.match(out, /💱.*ارزهای مهم/);
  assert.match(out, /🪙.*ارز دیجیتال/);
});

test('toman prices use thousand separators', () => {
  assert.match(build(), /سکه امامی: <b>262,500,000 تومان<\/b>/);
});

test('crypto in USD uses the USD sell rate', () => {
  assert.match(build(), /بیت‌کوین: <b>\$76,\d{3}<\/b>/);
});

test('USDT is shown in toman', () => {
  assert.match(build(), /تتر: <b>273,559 تومان<\/b>/);
});

test('ounces are in USD with one decimal', () => {
  assert.match(build(), /انس جهانی طلا: <b>\$3,907\.9<\/b>/);
});

test('positive change shows green up arrow', () => {
  assert.match(build(), /گرم طلای ۱۸ عیار:.*🟢 \+0\.63%/);
});

test('negative change shows red down arrow', () => {
  assert.match(build(), /بیت‌کوین:.*🔴 -0\.90%/);
});

test('missing crypto section is omitted', () => {
  const out = buildMessage({ gold: GOLD, fx: FX, metals: METALS, crypto: { items: [], ts: null } });
  assert.doesNotMatch(out, /🪙/);
});

test('escapes HTML in names', () => {
  const evil = { ...FX, items: [{ code: 'USD', name: '<script>x</script>', buy: 1, sell: 2, ts: TS }] };
  const out = buildMessage({ gold: GOLD, fx: evil, metals: { items: [], ts: null }, crypto: { items: [], ts: null } });
  assert.doesNotMatch(out, /<script>/);
  assert.match(out, /&lt;script&gt;/);
});

test('footer shows jalali time and tehran label', () => {
  const out = build();
  assert.match(out, /🕐/);
  assert.match(out, /به وقت تهران/);
});
