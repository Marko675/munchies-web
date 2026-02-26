import { clsx } from 'clsx'
import type { Unit } from '@/types'
import { UNIT_CONFIG } from '@/types'
import { clampQuantity } from '@/lib/quantityUtils'

interface QuantityInputProps {
  value: number
  unit: Unit
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function QuantityInput({ value, unit, onChange, disabled = false, className }: QuantityInputProps) {
  const config = UNIT_CONFIG[unit]

  function handleDecrement() {
    const next = value - config.step
    onChange(clampQuantity(next, unit))
  }

  function handleIncrement() {
    onChange(clampQuantity(value + config.step, unit))
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value)
    if (!isNaN(parsed)) {
      onChange(clampQuantity(parsed, unit))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value)
    if (isNaN(parsed)) {
      onChange(config.min)
    }
  }

  const isAtMin = value <= config.min

  return (
    <div className={clsx('flex items-center gap-0', className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isAtMin}
        aria-label="Smanji količinu"
        className={clsx(
          'flex items-center justify-center w-9 h-9',
          'rounded-l-xl border border-r-0 border-warm-300',
          'bg-warm-100 text-warm-700 text-lg font-semibold',
          'hover:bg-warm-200 active:bg-warm-300 transition-colors duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        min={config.min}
        step={config.step}
        aria-label="Količina"
        className={clsx(
          'w-20 h-9 text-center text-sm font-medium',
          'border-y border-warm-300 bg-white text-warm-900',
          'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500',
          'disabled:opacity-50 disabled:bg-warm-50',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        )}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled}
        aria-label="Povećaj količinu"
        className={clsx(
          'flex items-center justify-center w-9 h-9',
          'rounded-r-xl border border-l-0 border-warm-300',
          'bg-warm-100 text-warm-700 text-lg font-semibold',
          'hover:bg-warm-200 active:bg-warm-300 transition-colors duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
      >
        +
      </button>
      <span className="ml-2 text-sm text-warm-600 font-medium">{unit}</span>
    </div>
  )
}
