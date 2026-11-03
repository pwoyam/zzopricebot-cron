import { fixtureMarket } from '../fixtures/load.js';
import { buildMessage } from '../src/format.js';

const crypto = [
  { symbol: '₿', name: 'بیت‌کوین', usd: 76933, change24h: -1.31 },
  { symbol: 'Ξ', name: 'اتریوم', usd: 2263, change24h: -1.03 },
];

console.log('--- پیش‌نمایش آفلاین (داده‌ی نمونه، نه قیمت واقعی) ---\n');
console.log(buildMessage({ market: fixtureMarket(), crypto }));
