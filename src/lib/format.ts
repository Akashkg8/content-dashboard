const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

const formatters = new Map<string, Intl.RelativeTimeFormat>();
const formatterFor = (locale: string) => {
  let formatter = formatters.get(locale);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
    formatters.set(locale, formatter);
  }
  return formatter;
};

/** "5 min. ago", "yesterday", in the given locale. Under a minute reads as "now". */
export function timeAgo(iso: string, locale = 'en', now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (Number.isNaN(seconds)) return '';
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size)
      return formatterFor(locale).format(Math.round(seconds / size), unit);
  }
  return formatterFor(locale).format(0, 'second');
}
