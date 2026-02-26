import { formatPrice, formatDate } from './formatters'

describe('formatPrice', () => {
  it('formats price in Serbian locale', () => {
    const result = formatPrice(1500, 'sr')
    expect(result).toContain('RSD')
    expect(result).toContain('1')
  })

  it('formats price in English locale', () => {
    const result = formatPrice(1500, 'en')
    expect(result).toContain('RSD')
  })

  it('handles zero', () => {
    const result = formatPrice(0, 'en')
    expect(result).toContain('0')
    expect(result).toContain('RSD')
  })
})

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2025-06-15T10:00:00', 'en')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('includes the year in the formatted output', () => {
    const result = formatDate('2025-06-15T10:00:00', 'en')
    expect(result).toContain('2025')
  })
})
