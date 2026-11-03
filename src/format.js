import { GOLD_ROWS, DOLLAR_ROWS, CURRENCY_ROWS } from './config.js';

const dateTime = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const integer = new Intl.NumberFormat('en-US');

const formatUsd = (value, digits) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

function formatChange(change) {
  if (typeof change !== 'number' || !Number.isFinite(change)) return '';
  const arrow = change >= 0 ? '🟢' : '🔴';
  const sign = change > 0 ? '+' : '';
  return ` ${arrow} ${sign}${change.toFixed(2)}%`;
}

// قیمت‌های ریالی به تومان نمایش داده می‌شوند؛ اونس جهانی به دلار.
function priceText(row) {
  if (row.unit === 'USD') return formatUsd(row.close, 2);
  const toman =
    typeof row.close_toman === 'number'
      ? row.close_toman
      : row.unit === 'IRR'
        ? Math.round(row.close / 10)
        : null;
  return toman === null ? null : `${integer.format(toman)} تومان`;
}

function section(title, defs, bySymbol) {
  const lines = [];
  for (const [symbol, label] of defs) {
    const row = bySymbol.get(symbol);
    const price = row ? priceText(row) : null;
    if (price) lines.push(`${label}: <b>${price}</b>${formatChange(row.change_pct)}`);
  }
  return lines.length ? [title, ...lines, ''] : [];
}

function cryptoSection(crypto) {
  if (!crypto?.length) return [];
  const lines = crypto.map(
    (p) =>
      `${p.symbol} ${p.name}: <b>${formatUsd(p.usd, p.usd >= 1000 ? 0 : 2)}</b>${formatChange(p.change24h)}`,
  );
  return ['🪙 <b>ارز دیجیتال</b>', ...lines, ''];
}

export function buildMessage({ market, crypto }, now = new Date()) {
  const marketDate = [...market.gold.values(), ...market.currencies.values()]
    .map((row) => row.date_jalali)
    .find(Boolean);

  const lines = [
    '📊 <b>قیمت‌های بازار آزاد</b>',
    '',
    ...section('🥇 <b>طلا و سکه</b>', GOLD_ROWS, market.gold),
    ...section('💵 <b>دلار</b>', DOLLAR_ROWS, market.currencies),
    ...section('💱 <b>ارزهای مهم</b>', CURRENCY_ROWS, market.currencies),
    ...cryptoSection(crypto),
    `🕐 ${dateTime.format(now)} (به وقت تهران)`,
  ];
  if (marketDate) lines.push(`📅 تاریخ داده‌ی بازار: ${marketDate}`);
  return lines.join('\n');
}
