// ارز دیجیتال (شناسه‌ها از CoinGecko)
export const CRYPTO = [
  { id: 'bitcoin', symbol: '₿', name: 'بیت‌کوین' },
  { id: 'ethereum', symbol: 'Ξ', name: 'اتریوم' },
];

// ترتیب نمایش همین ترتیب است. نمادها از oanor (GET /v1/symbols).
export const GOLD_ROWS = [
  ['coin_emami', 'سکه امامی'],
  ['coin_bahar', 'سکه بهار آزادی'],
  ['half_coin', 'نیم‌سکه'],
  ['quarter_coin', 'ربع‌سکه'],
  ['gerami_coin', 'سکه گرمی'],
  ['gram_18k', 'طلای ۱۸ عیار (هر گرم)'],
  ['gram_24k', 'طلای ۲۴ عیار (هر گرم)'],
  ['mesghal', 'مثقال طلا'],
  ['ounce', 'اونس جهانی طلا'],
];

export const DOLLAR_ROWS = [['usd', 'دلار آمریکا']];

// برای نمایش ارز بیشتر، نماد را از این لیست به CURRENCY_ROWS اضافه کنید:
// chf (فرانک سوئیس)، aud (دلار استرالیا)، jpy (ین، ۱۰۰ واحد)، rub (روبل)
export const CURRENCY_ROWS = [
  ['eur', 'یورو'],
  ['gbp', 'پوند انگلیس'],
  ['aed', 'درهم امارات'],
  ['try', 'لیر ترکیه'],
  ['cny', 'یوان چین'],
  ['cad', 'دلار کانادا'],
];
