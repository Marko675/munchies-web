import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'

const LANGUAGES = [
  { code: 'sr', label: 'SR' },
  { code: 'en', label: 'EN' },
]

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const current = i18n.language

  return (
    <div
      className={clsx('flex items-center gap-0.5 rounded-lg bg-warm-100 p-0.5', className)}
      role="group"
      aria-label="Language switcher"
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={clsx(
            'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            current === code
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-warm-500 hover:bg-warm-200 hover:text-warm-800 active:bg-warm-300'
          )}
          aria-pressed={current === code}
          aria-label={`Switch to ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
