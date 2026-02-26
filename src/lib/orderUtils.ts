let orderCounter = 1

/**
 * Generate a human-readable order number: ORD-000123
 */
export function generateOrderNumber(): string {
  const num = orderCounter++
  return `ORD-${String(num).padStart(6, '0')}`
}

/**
 * Generate a UUID v4 (simple implementation for mock use)
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get minimum date for orders: today + 2 days, formatted as YYYY-MM-DD
 */
export function getMinOrderDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  return date.toISOString().split('T')[0]
}
