import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/store'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { SEOHead } from '@/components/SEOHead'
import { formatPrice } from '@/lib/formatters'
import { formatQuantityDisplay } from '@/lib/quantityUtils'
import { apiClient } from '@/lib/apiClient'
import type { Unit } from '@/types'
import toast from 'react-hot-toast'

export function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { items, subtotal, clearCart } = useCartStore()

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    note: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items.length, navigate])

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = t('common.required')
    if (!form.email.trim()) errs.email = t('common.required')
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Nevažeći email format'
    if (!form.phone.trim()) errs.phone = t('common.required')
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }
    setFormErrors({})
    setIsLoading(true)

    try {
      const endpoint = isAuthenticated ? '/api/my-orders' : '/api/public/orders'
      await apiClient.post(endpoint, {
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        notes: form.note || undefined,
        items: items.map((item) => ({
          recipeName: item.productName,
          quantityKg: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      })

      clearCart()
      toast.success(t('checkout.orderSuccess'))
      navigate('/order-success')
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.generic')
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SEOHead title={t('checkout.title')} />

      <div className="container-app py-10">
        <h1 className="text-3xl font-bold text-warm-900 mb-8">{t('checkout.title')}</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: form */}
            <div className="lg:col-span-2 space-y-8">

              {/* Contact info */}
              <section className="bg-white rounded-2xl border border-warm-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-warm-900">Kontakt informacije</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('auth.name')}
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    error={formErrors.name}
                    autoComplete="name"
                    required
                  />
                  <Input
                    label={t('auth.email')}
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    error={formErrors.email}
                    autoComplete="email"
                    required
                  />
                  <Input
                    label={t('auth.phone')}
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    error={formErrors.phone}
                    autoComplete="tel"
                    required
                  />
                </div>
              </section>

              {/* Note */}
              <section className="bg-white rounded-2xl border border-warm-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-warm-900">Dodatne napomene</h2>
                <Textarea
                  label={t('checkout.note')}
                  value={form.note}
                  onChange={(e) => update('note', e.target.value)}
                  rows={3}
                  placeholder={t('checkout.notePlaceholder')}
                />
              </section>
            </div>

            {/* Right: order summary */}
            <aside>
              <div className="bg-white rounded-2xl border border-warm-100 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-warm-900 mb-4">{t('checkout.orderSummary')}</h2>

                <ul className="space-y-3 mb-4">
                  {items.map((item) => (
                    <li key={item.productId} className="flex justify-between text-sm">
                      <span className="text-warm-700">
                        {item.productName} × {formatQuantityDisplay(item.quantity, item.unit as Unit)} {item.unit}
                      </span>
                      <span className="font-medium text-warm-900 whitespace-nowrap ml-2">
                        {formatPrice(item.lineTotal, i18n.language)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-warm-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between font-semibold text-warm-900 text-base pt-2">
                    <span>{t('cart.total')}</span>
                    <span>{formatPrice(subtotal, i18n.language)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isLoading}
                  className="mt-6"
                >
                  {t('checkout.placeOrder')}
                </Button>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </>
  )
}
