import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { SEOHead } from '@/components/SEOHead'
import toast from 'react-hot-toast'

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setEmailError(t('common.required'))
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Nevažeći email format')
      return
    }
    setEmailError('')
    setIsLoading(true)
    try {
      await authService.resetPassword()
      setSubmitted(true)
      toast.success(t('auth.resetEmailSent'))
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SEOHead title={t('auth.resetTitle')} />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-sm border border-warm-100 p-8">
            {submitted ? (
              <div className="text-center py-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-600" aria-hidden="true">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-warm-900 mb-2">{t('auth.resetEmailSentTitle')}</h2>
                <p className="text-warm-500 text-sm mb-6">{t('auth.resetEmailSentDesc')}</p>
                <Link
                  to="/login"
                  className="text-primary-600 font-medium hover:text-primary-800 transition-colors text-sm"
                >
                  ← {t('auth.backToLogin')}
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4" aria-hidden="true">🔑</div>
                  <h1 className="text-2xl font-bold text-warm-900">{t('auth.resetTitle')}</h1>
                  <p className="text-warm-500 text-sm mt-1">{t('auth.resetSubtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <Input
                    label={t('auth.email')}
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError('')
                    }}
                    error={emailError}
                    autoComplete="email"
                    required
                  />

                  <Button type="submit" fullWidth loading={isLoading} size="lg">
                    {t('auth.sendResetLink')}
                  </Button>
                </form>

                <p className="text-center text-sm text-warm-500 mt-6">
                  <Link to="/login" className="text-primary-600 font-medium hover:text-primary-800 transition-colors">
                    ← {t('auth.backToLogin')}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
