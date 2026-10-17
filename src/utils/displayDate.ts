/** Shows an ISO date (YYYY-MM-DD or timestamp) the UK way, e.g. "20 Nov 2026". Display only. */
export function displayDate(value: string | undefined | null): string {
  if (!value) return ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
