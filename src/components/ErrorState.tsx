import { Button } from './Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  message = 'Nešto je pošlo po zlu.',
  onRetry,
  retryLabel = 'Pokušaj ponovo',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 text-red-400 text-5xl" aria-hidden="true">⚠</div>
      <h3 className="text-lg font-semibold text-warm-800 mb-2">Greška</h3>
      <p className="text-sm text-warm-500 max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryLabel}
        </Button>
      )}
    </div>
  )
}
