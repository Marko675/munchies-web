import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store'
import { useOrdersStore } from '@/features/orders/store'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Badge } from '@/components/Badge'
import { SEOHead } from '@/components/SEOHead'
import { EmptyState } from '@/components/EmptyState'
import { ProfileSkeleton } from '@/components/Skeleton'
import { formatPrice, formatDate } from '@/lib/formatters'
import type { OrderStatus } from '@/types'
import toast from 'react-hot-toast'

const STATUS_BADGE: Record<OrderStatus, 'info' | 'warning' | 'success' | 'error' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  out_for_delivery: 'info',
  delivered: 'success',
  cancelled: 'error',
}

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, updateProfile, changePassword, isLoading } = useAuthStore()
  const { fetchOrderHistory, orderHistory } = useOrdersStore()

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [profileSaving, setProfileSaving] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadOrders() {
    if (!user) return
    setOrdersLoading(true)
    try {
      await fetchOrderHistory(user.id)
    } finally {
      setOrdersLoading(false)
    }
  }

  function validateProfile() {
    const errs: Record<string, string> = {}
    if (!profileForm.name.trim()) errs.name = t('common.required')
    if (!profileForm.phone.trim()) errs.phone = t('common.required')
    return errs
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateProfile()
    if (Object.keys(errs).length > 0) { setProfileErrors(errs); return }
    setProfileErrors({})
    setProfileSaving(true)
    try {
      await updateProfile(profileForm)
      toast.success(t('profile.profileSaved'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setProfileSaving(false)
    }
  }

  function validatePassword() {
    const errs: Record<string, string> = {}
    if (!passwordForm.currentPassword) errs.currentPassword = t('common.required')
    if (!passwordForm.newPassword) errs.newPassword = t('common.required')
    else if (passwordForm.newPassword.length < 6) errs.newPassword = 'Minimum 6 karaktera'
    if (!passwordForm.confirmPassword) errs.confirmPassword = t('common.required')
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = t('auth.passwordMismatch')
    return errs
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    const errs = validatePassword()
    if (Object.keys(errs).length > 0) { setPasswordErrors(errs); return }
    setPasswordErrors({})
    setPasswordSaving(true)
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.success(t('profile.passwordChanged'))
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setPasswordSaving(false)
    }
  }

  if (isLoading && !user) {
    return (
      <div className="container-app py-10">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <SEOHead title={t('profile.title')} />

      <div className="container-app py-10">
        <h1 className="text-3xl font-bold text-warm-900 mb-8">{t('profile.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="space-y-8">
            {/* Edit Profile */}
            <section className="bg-white rounded-2xl border border-warm-100 p-6">
              <h2 className="text-lg font-semibold text-warm-900 mb-5">{t('profile.editProfile')}</h2>
              <form onSubmit={handleProfileSave} noValidate className="space-y-4">
                <Input
                  label={t('auth.name')}
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  error={profileErrors.name}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-1">{t('auth.email')}</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full rounded-xl border border-warm-200 bg-warm-50 px-3 py-2.5 text-warm-500 cursor-not-allowed text-sm"
                  />
                  <p className="text-xs text-warm-400 mt-1">{t('profile.emailCannotChange')}</p>
                </div>
                <Input
                  label={t('auth.phone')}
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  error={profileErrors.phone}
                  required
                />
                <Input
                  label={t('auth.address')}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                  error={profileErrors.address}
                />
                <Button type="submit" fullWidth loading={profileSaving}>
                  {t('common.save')}
                </Button>
              </form>
            </section>

            {/* Change Password */}
            <section className="bg-white rounded-2xl border border-warm-100 p-6">
              <h2 className="text-lg font-semibold text-warm-900 mb-5">{t('profile.changePassword')}</h2>
              <form onSubmit={handlePasswordChange} noValidate className="space-y-4">
                <Input
                  label={t('auth.currentPassword')}
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  error={passwordErrors.currentPassword}
                  autoComplete="current-password"
                  required
                />
                <Input
                  label={t('auth.newPassword')}
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  error={passwordErrors.newPassword}
                  hint="Minimum 6 karaktera"
                  autoComplete="new-password"
                  required
                />
                <Input
                  label={t('auth.confirmPassword')}
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  error={passwordErrors.confirmPassword}
                  autoComplete="new-password"
                  required
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={(e) => setShowPasswords(e.target.checked)}
                    className="w-4 h-4 rounded border-warm-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-warm-600">{t('auth.showPasswords')}</span>
                </label>
                <Button type="submit" fullWidth variant="secondary" loading={passwordSaving}>
                  {t('profile.changePassword')}
                </Button>
              </form>
            </section>
          </div>

          {/* Right column: order history */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-2xl border border-warm-100 p-6">
              <h2 className="text-lg font-semibold text-warm-900 mb-5">{t('profile.orderHistory')}</h2>

              {ordersLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" aria-label="Učitavanje..." />
                </div>
              ) : orderHistory.length === 0 ? (
                <EmptyState
                  icon="📦"
                  title={t('profile.noOrders')}
                  description={t('profile.noOrdersDesc')}
                  actionLabel={t('nav.menu')}
                  onAction={() => navigate('/menu')}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-warm-100">
                        <th className="text-left pb-3 text-warm-500 font-medium">{t('order.orderNumber')}</th>
                        <th className="text-left pb-3 text-warm-500 font-medium">{t('order.createdAt')}</th>
                        <th className="text-right pb-3 text-warm-500 font-medium">{t('cart.total')}</th>
                        <th className="text-center pb-3 text-warm-500 font-medium">{t('order.statusLabel')}</th>
                        <th className="pb-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-50">
                      {orderHistory.map((order) => (
                        <tr key={order.id}>
                          <td className="py-3 font-medium text-primary-600">{order.orderNumber}</td>
                          <td className="py-3 text-warm-600">{formatDate(order.createdAt, i18n.language)}</td>
                          <td className="py-3 text-right font-medium text-warm-900">
                            {formatPrice(order.summary.total, i18n.language)}
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant={STATUS_BADGE[order.status] ?? 'neutral'}>
                              {t(`order.status.${order.status}`)}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              to={`/order-status/${order.id}`}
                              className="text-primary-600 hover:text-primary-800 text-xs font-medium"
                            >
                              {t('order.view')} →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
