import {
  TZ, METAL_GOLD, METAL_COINS, METAL_OUNCE,
  FX_MAIN, FX_OTHERS, CRYPTO_CODES,
} from './config.js';

const HTML_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>]/g, (c) => HTML_ESC[c]);
}

function fmtInt(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}
function fmtToman(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  return fmtInt(n) + ' تومان';
}
function fmtUsd(n, digits = 0) {
  if (n == null || !Number.isFinite(n)) return '—';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
function fmtChange(pct) {
  if (pct == null || !Number.isFinite(pct) || pct === 0) return '';
  const arrow = pct > 0 ? '🟢' : '🔴';
  const sign  = pct > 0 ? '+' : '';
  return ` ${arrow} ${sign}${pct.toFixed(2)}%`;
}
const rial2toman = (n) => (Number.isFinite(n) ? n / 10 : null);
function rial2usd(rial, usdToman) {
  if (!Number.isFinite(rial) || !Number.isFinite(usdToman) || usdToman === 0) return null;
  return rial / 10 / usdToman;
}
function fmtJalali(ts) {
  if (!ts) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      timeZone: TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(ts * 1000));
  } catch {
    return new Date(ts * 1000).toISOString();
  }
}

const CRYPTO_ICON = { BTC: '₿', ETH: 'Ξ', USDT: '💵' };

export function buildMessage({ gold, fx, metals, crypto }) {
  const metalsByCode = new Map((metals?.items ?? []).map((i) => [i.code, i]));
  const fxByCode     = new Map((fx?.items     ?? []).map((i) => [i.code, i]));
  const cryptoByCode = new Map((crypto?.items ?? []).map((i) => [i.code, i]));

  const lines = ['📊 <b>قیمت‌های بازار</b>'];

  // 🥇 طلا و سکه
  const metalRows = [...METAL_GOLD, ...METAL_COINS].map((c) => metalsByCode.get(c)).filter(Boolean);
  const ounce = metalsByCode.get(METAL_OUNCE);
  if (metalRows.length || ounce) {
    lines.push('', '🥇 <b>طلا و سکه</b>');
    for (const m of metalRows) {
      lines.push(`${escapeHtml(m.name)}: <b>${fmtToman(m.price)}</b>${fmtChange(m.change_pct)}`);
    }
    if (ounce) {
      lines.push(`${escapeHtml(ounce.name)}: <b>${fmtUsd(ounce.price, 1)}</b>${fmtChange(ounce.change_pct)}`);
    }
  }

  // 💵 دلار
  const usd = fxByCode.get(FX_MAIN);
  if (usd) {
    lines.push('', '💵 <b>دلار</b>');
    lines.push(`${escapeHtml(usd.name)}: <b>${fmtToman(usd.sell)}</b>`);
  }

  // 💱 بقیه ارزها
  const otherFx = FX_OTHERS.map((c) => fxByCode.get(c)).filter(Boolean);
  if (otherFx.length) {
    lines.push('', '💱 <b>ارزهای مهم</b>');
    for (const f of otherFx) {
      lines.push(`${escapeHtml(f.name)}: <b>${fmtToman(f.sell)}</b>`);
    }
  }

  // 🪙 کریپتو
  const cryptoRows = CRYPTO_CODES.map((c) => cryptoByCode.get(c)).filter(Boolean);
  if (cryptoRows.length) {
    lines.push('', '🪙 <b>ارز دیجیتال</b>');
    const usdSellToman = usd?.sell;
    for (const c of cryptoRows) {
      const icon = CRYPTO_ICON[c.code] ?? '•';
      let display;
      if (c.code === 'USDT') {
        display = fmtToman(rial2toman(c.latest));
      } else {
        const usdVal = rial2usd(c.latest, usdSellToman);
        display = usdVal != null ? fmtUsd(usdVal, 0) : '—';
      }
      lines.push(`${icon} ${escapeHtml(c.name)}: <b>${display}</b>${fmtChange(c.dayChange)}`);
    }
  }

  // 🕐 فوتر
  const ts = gold?.ts ?? fx?.ts ?? metals?.ts ?? crypto?.ts;
  const jalali = fmtJalali(ts);
  if (jalali) lines.push('', `🕐 ${jalali} (به وقت تهران)`);

  return lines.join('\n');
}
