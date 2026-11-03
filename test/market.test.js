import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMarket } from '../src/sources/oanor.js';

const row = (symbol, close) => ({ symbol, close });

test('indexes rows by symbol', () => {
  const market = parseMarket(
    { data: { gold: [row('gram_18k', 1)] } },
    { data: { currencies: [row('usd', 2)] } },
  );
  assert.equal(market.gold.get('gram_18k').close, 1);
  assert.equal(market.currencies.get('usd').close, 2);
});

test('rejects an unexpected response shape', () => {
  assert.throws(
    () => parseMarket({ data: {} }, { data: { currencies: [] } }),
    /unexpected response shape/,
  );
});

test('rejects an unsuccessful response', () => {
  assert.throws(
    () => parseMarket({ success: false, message: 'nope' }, { data: { currencies: [] } }),
    /nope/,
  );
});
