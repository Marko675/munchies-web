import type { Unit } from '@/types'

/** Number of decimal places for each unit (avoids float precision bugs) */
const UNIT_DECIMALS: Record<Unit, number> = {
  kg: 1,
  g: 0,
  L: 1,
  mL: 0,
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function roundToStep(value: number, step: number): number {
  const result = Math.round(value / step) * step
  const decimals = step >= 1 ? 0 : 1
  return roundToDecimals(result, decimals)
}

export function clampQuantity(value: number, unit: Unit): number {
  const config = {
    kg: { min: 0.1, step: 0.1 },
    g: { min: 1, step: 1 },
    L: { min: 0.1, step: 0.1 },
    mL: { min: 1, step: 1 },
  }
  const { min, step } = config[unit]
  const clamped = Math.max(min, value)
  const result = roundToStep(clamped, step)
  return roundToDecimals(result, UNIT_DECIMALS[unit])
}

/** Round quantity for display/storage - avoids float artifacts like 0.30000000000000004 */
export function roundQuantity(quantity: number, unit: Unit): number {
  return roundToDecimals(quantity, UNIT_DECIMALS[unit])
}

/** Format quantity for display (e.g. "0.3" or "150") */
export function formatQuantityDisplay(quantity: number, unit: Unit): string {
  const decimals = UNIT_DECIMALS[unit]
  return decimals === 0
    ? Math.round(quantity).toString()
    : roundToDecimals(quantity, decimals).toFixed(decimals)
}
