const timeFormat = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function formatUsd(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatChange(change) {
  if (change === null || change === undefined) return '';
  const arrow = change >= 0 ? '🟢' : '🔴';
  const sign = change > 0 ? '+' : '';
  return ` ${arrow} ${sign}${change.toFixed(2)}%`;
}

export function buildMessage(prices, now = new Date()) {
  const lines = prices.map(
    (p) => `${p.symbol} ${escapeHtml(p.name)}: <b>${formatUsd(p.usd)}</b>${formatChange(p.change24h)}`,
  );
  return [
    '📊 <b>قیمت‌های لحظه‌ای</b>',
    '',
    ...lines,
    '',
    `🕐 ${timeFormat.format(now)} (به وقت تهران)`,
  ].join('\n');
}
