export type Unit = 'kg' | 'g' | 'L' | 'mL'

export interface Product {
  id: string
  name: string
  description?: string
  image: string
  pricePerUnit: number
  unit: Unit
  categoryIds: string[]
  featured: boolean
  available: boolean
}

export interface Category {
  id: string
  name: string
}

export interface UnitConfig {
  min: number
  step: number
  label: string
}

export const UNIT_CONFIG: Record<Unit, UnitConfig> = {
  kg: { min: 0.1, step: 0.1, label: 'kg' },
  g: { min: 1, step: 1, label: 'g' },
  L: { min: 0.1, step: 0.1, label: 'L' },
  mL: { min: 1, step: 1, label: 'mL' },
}
