import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { SEOHead } from '@/components/SEOHead'
import { delay } from '@/lib/delay'
import toast from 'react-hot-toast'

export function ContactPage() {
  const { t } = useTranslation()

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  function update(field: keyof typeof form, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = t('common.required')
    if (!form.email.trim()) errs.email = t('common.required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Nevažeći email format'
    if (!form.message.trim()) errs.message = t('common.required')
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setIsLoading(true)
    try {
      await delay(1000)
      toast.success(t('contact.successMessage'))
      setForm({ name: '', email: '', message: '' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SEOHead title={t('contact.title')} />

      <div className="container-app py-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-warm-900 mb-3">{t('contact.title')}</h1>
          <p className="text-warm-600 max-w-xl mx-auto">{t('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact form */}
          <div className="bg-white rounded-2xl border border-warm-100 p-8">
            <h2 className="text-xl font-semibold text-warm-900 mb-6">{t('contact.sendMessage')}</h2>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Input
                label={t('auth.name')}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                error={errors.name}
                autoComplete="name"
                required
              />
              <Input
                label={t('auth.email')}
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
              />
              <Textarea
                label={t('contact.message')}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                error={errors.message}
                rows={5}
                placeholder={t('contact.messagePlaceholder')}
                required
              />
              <Button type="submit" fullWidth size="lg" loading={isLoading}>
                {t('contact.send')}
              </Button>
            </form>
          </div>

          {/* Business info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-warm-900 mb-6">{t('contact.businessInfo')}</h2>
            </div>

            {[
              {
                icon: '📍',
                label: t('contact.address'),
                value: t('contact.addressValue'),
              },
              {
                icon: '📞',
                label: t('contact.phone'),
                value: t('contact.phoneValue'),
              },
              {
                icon: '✉️',
                label: t('contact.emailLabel'),
                value: t('contact.emailValue'),
              },
              {
                icon: '🕐',
                label: t('contact.workingHours'),
                value: t('contact.workingHoursValue'),
              },
            ].map((item) => (
              <div key={item.label} className="flex gap-4 p-4 bg-warm-50 rounded-xl">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-warm-900">{item.label}</p>
                  <p className="text-sm text-warm-600 mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-medium text-amber-800 mb-1">📣 {t('contact.customOrders')}</p>
              <p className="text-sm text-amber-700">{t('contact.customOrdersDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
