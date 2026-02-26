import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrdersStore } from '@/features/orders/store'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { SEOHead } from '@/components/SEOHead'
import { ErrorState } from '@/components/ErrorState'
import { formatPrice, formatDate } from '@/lib/formatters'
import { formatQuantityDisplay } from '@/lib/quantityUtils'
import { canCancelOrder } from '@/types/order'
import type { OrderStatus, Unit } from '@/types'
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

const REFRESH_INTERVAL_MS = 15_000

export function OrderStatusPage() {
  const { t, i18n } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const { fetchOrder, cancelOrder, currentOrder, loading: isLoading, error, clearError } = useOrdersStore()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function loadOrder() {
    if (!orderId) return
    await fetchOrder(orderId)
    setLastRefreshed(new Date())
  }

  useEffect(() => {
    loadOrder()
    intervalRef.current = setInterval(loadOrder, REFRESH_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [orderId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCancel() {
    if (!currentOrder) return
    setCancelLoading(true)
    try {
      await cancelOrder(currentOrder.id)
      toast.success(t('order.cancelSuccess'))
      setShowCancelModal(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setCancelLoading(false)
    }
  }

  if (isLoading && !currentOrder) {
    return (
      <div className="container-app py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" aria-label="Učitavanje..." />
      </div>
    )
  }

  if (error && !currentOrder) {
    return (
      <div className="container-app py-20">
        <ErrorState message={error} onRetry={() => { clearError(); loadOrder() }} />
      </div>
    )
  }

  if (!currentOrder) return null

  const statusLabel = t(`order.status.${currentOrder.status}`)
  const badgeVariant = STATUS_BADGE[currentOrder.status] ?? 'neutral'

  return (
    <>
      <SEOHead title={t('order.statusTitle')} />

      <div className="container-app py-10 max-w-2xl">
        {/* Auto-refresh notice */}
        <div className="flex items-center gap-2 text-sm text-warm-500 mb-6 bg-warm-50 rounded-xl px-4 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.389zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
          </svg>
          <span>{t('order.autoRefresh', { seconds: REFRESH_INTERVAL_MS / 1000 })}</span>
          <span className="ml-auto text-warm-400">
            {t('order.lastRefreshed')}: {lastRefreshed.toLocaleTimeString(i18n.language === 'sr' ? 'sr-RS' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-warm-500">{t('order.orderNumber')}</p>
              <p className="text-xl font-bold text-primary-600 tracking-wide">{currentOrder.orderNumber}</p>
            </div>
            <Badge variant={badgeVariant}>{statusLabel}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t border-warm-100 pt-4">
            <div>
              <p className="text-warm-500">{t('order.createdAt')}</p>
              <p className="font-medium text-warm-800">{formatDate(currentOrder.createdAt, i18n.language)}</p>
            </div>
            <div>
              <p className="text-warm-500">{t('checkout.deliveryType')}</p>
              <p className="font-medium text-warm-800">{t(`checkout.${currentOrder.delivery.type}`)}</p>
            </div>
            {currentOrder.delivery.scheduledAt && (
              <div>
                <p className="text-warm-500">{t('order.scheduledAt')}</p>
                <p className="font-medium text-warm-800">
                  {formatDate(currentOrder.delivery.scheduledAt, i18n.language)}
                </p>
              </div>
            )}
            {currentOrder.delivery.address && (
              <div>
                <p className="text-warm-500">{t('auth.address')}</p>
                <p className="font-medium text-warm-800">{currentOrder.delivery.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-warm-100 p-6 mb-6">
          <h2 className="font-semibold text-warm-900 mb-4">{t('order.items')}</h2>
          <ul className="space-y-3">
            {currentOrder.items.map((item, idx) => (
              <li key={idx} className="flex justify-between text-sm">
                <span className="text-warm-700">{item.productName} × {formatQuantityDisplay(item.quantity, item.unit as Unit)} {item.unit}</span>
                <span>{formatPrice(item.lineTotal, i18n.language)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-warm-100 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-warm-600">
              <span>{t('cart.subtotal')}</span>
              <span>{formatPrice(currentOrder.summary.subtotal, i18n.language)}</span>
            </div>
            <div className="flex justify-between text-warm-600">
              <span>{t('cart.delivery')}</span>
              {currentOrder.summary.deliveryFee === 0
                ? <span className="text-green-600">{t('cart.freeDelivery')}</span>
                : <span>{formatPrice(currentOrder.summary.deliveryFee, i18n.language)}</span>
              }
            </div>
            <div className="flex justify-between font-semibold text-warm-900 text-base pt-1">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(currentOrder.summary.total, i18n.language)}</span>
            </div>
          </div>
        </div>

        {currentOrder.note && (
          <div className="bg-warm-50 rounded-2xl p-4 mb-6 text-sm text-warm-700">
            <span className="font-medium">{t('checkout.note')}:</span> {currentOrder.note}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {canCancelOrder(currentOrder.status) && (
            <Button variant="danger" onClick={() => setShowCancelModal(true)}>
              {t('order.cancel')}
            </Button>
          )}
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-warm-700 border border-warm-200 hover:bg-warm-50 transition-colors"
          >
            {t('nav.profile')}
          </Link>
          <Link
            to="/menu"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-warm-700 border border-warm-200 hover:bg-warm-50 transition-colors"
          >
            {t('nav.menu')}
          </Link>
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title={t('order.cancelTitle')}
        description={t('order.cancelConfirm')}
        confirmLabel={t('order.cancel')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={cancelLoading}
      />
    </>
  )
}
