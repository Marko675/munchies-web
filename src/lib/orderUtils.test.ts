import { generateOrderNumber, generateUUID, getMinOrderDate } from './orderUtils'

describe('generateOrderNumber', () => {
  it('returns a string starting with ORD-', () => {
    expect(generateOrderNumber()).toMatch(/^ORD-/)
  })

  it('generates incrementing order numbers', () => {
    const a = generateOrderNumber()
    const b = generateOrderNumber()
    const numA = parseInt(a.replace('ORD-', ''), 10)
    const numB = parseInt(b.replace('ORD-', ''), 10)
    expect(numB).toBeGreaterThan(numA)
  })
})

describe('generateUUID', () => {
  it('returns a non-empty string', () => {
    expect(generateUUID().length).toBeGreaterThan(0)
  })

  it('generates unique values', () => {
    expect(generateUUID()).not.toBe(generateUUID())
  })
})

describe('getMinOrderDate', () => {
  it('returns a date at least 2 days in the future', () => {
    const result = getMinOrderDate()
    const resultDate = new Date(result)
    const twoDaysFromNow = new Date()
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    twoDaysFromNow.setHours(0, 0, 0, 0)
    expect(resultDate.getTime()).toBeGreaterThanOrEqual(twoDaysFromNow.getTime())
  })

  it('returns a YYYY-MM-DD formatted string', () => {
    expect(getMinOrderDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
