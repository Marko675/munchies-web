import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { SEOHead } from '@/components/SEOHead'
import toast from 'react-hot-toast'

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = t('common.required')
    if (!form.email.trim()) errs.email = t('common.required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Nevažeći email format'
    if (!form.phone.trim()) errs.phone = t('common.required')
    if (!form.address.trim()) errs.address = t('common.required')
    if (!form.password) errs.password = t('common.required')
    else if (form.password.length < 6) errs.password = 'Minimum 6 karaktera'
    if (!form.confirmPassword) errs.confirmPassword = t('common.required')
    else if (form.password !== form.confirmPassword) errs.confirmPassword = t('auth.passwordMismatch')
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password,
      })
      toast.success(t('auth.registerSuccess'))
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.registerError')
      toast.error(message)
    }
  }

  const EyeIcon = () => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="p-1 rounded-md text-warm-400 hover:text-warm-700 hover:bg-warm-100 active:bg-warm-200 transition-colors duration-150"
      aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      )}
    </button>
  )

  return (
    <>
      <SEOHead title={t('auth.registerTitle')} />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-sm border border-warm-100 p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4" aria-hidden="true">🍰</div>
              <h1 className="text-2xl font-bold text-warm-900">{t('auth.registerTitle')}</h1>
              <p className="text-warm-500 text-sm mt-1">{t('auth.registerSubtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input
                label={t('auth.name')}
                type="text"
                placeholder={t('auth.namePlaceholder')}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                error={errors.name}
                autoComplete="name"
                required
              />

              <Input
                label={t('auth.email')}
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
              />

              <Input
                label={t('auth.phone')}
                type="tel"
                placeholder={t('auth.phonePlaceholder')}
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                error={errors.phone}
                autoComplete="tel"
                required
              />

              <Input
                label={t('auth.address')}
                type="text"
                placeholder={t('auth.addressPlaceholder')}
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                error={errors.address}
                autoComplete="street-address"
                required
              />

              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.passwordPlaceholder')}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                error={errors.password}
                hint="Minimum 6 karaktera"
                autoComplete="new-password"
                required
                rightElement={<EyeIcon />}
              />

              <Input
                label={t('auth.confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                autoComplete="new-password"
                required
              />

              <Button type="submit" fullWidth loading={isLoading} size="lg" className="mt-2">
                {t('auth.createAccount')}
              </Button>
            </form>

            <p className="text-center text-sm text-warm-500 mt-6">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-800 transition-colors">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
