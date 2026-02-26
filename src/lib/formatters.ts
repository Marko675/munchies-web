/**
 * Format a price in RSD currency.
 * Serbian locale: period as thousands separator, comma as decimal (e.g. 1.200,00 RSD)
 * English locale: comma as thousands separator, period as decimal (e.g. 1,200.00 RSD)
 */
export function formatPrice(amount: number, locale: string): string {
  const isSerbian = locale === 'sr' || locale.startsWith('sr-')
  const formatLocale = isSerbian ? 'sr-RS' : 'en-US'

  return new Intl.NumberFormat(formatLocale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' RSD'
}

/**
 * Format a date string (ISO) to localized display
 */
export function formatDate(dateStr: string, locale: string): string {
  const isSerbian = locale === 'sr' || locale.startsWith('sr-')
  const formatLocale = isSerbian ? 'sr-RS' : 'en-US'

  return new Date(dateStr).toLocaleDateString(formatLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
