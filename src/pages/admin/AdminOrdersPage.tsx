import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/apiClient'
import { formatPrice, formatDate } from '@/lib/formatters'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { SEOHead } from '@/components/SEOHead'
import toast from 'react-hot-toast'

interface OrderItem {
  id: string
  recipeName: string
  quantityKg: number
  unitPrice: number
  lineTotal: number
}

interface Order {
  id: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  notes: string | null
  totalPrice: number
  status: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'] as const

const STATUS_BADGE: Record<string, 'info' | 'warning' | 'success' | 'error' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  completed: 'success',
  cancelled: 'error',
}

export function AdminOrdersPage() {
  const { t, i18n } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    try {
      const data = await apiClient.get<Order[]>('/api/admin/orders')
      setOrders(data)
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(orderId: string, status: string) {
    try {
      await apiClient.patch(`/api/admin/orders/${orderId}/status`, { status })
      toast.success(t('adminPanel.statusUpdated'))
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await apiClient.del(`/api/admin/orders/${deleteTarget.id}`)
      toast.success(t('adminPanel.orderDeleted'))
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  return (
    <>
      <SEOHead title={t('adminPanel.orders')} />
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-warm-900">{t('adminPanel.orders')}</h1>
          <Button variant="ghost" onClick={loadData}>{t('common.retry')}</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-warm-500 py-8 text-center">{t('adminPanel.noOrders')}</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-warm-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <p className="font-semibold text-warm-900 truncate">{order.customerName}</p>
                      <p className="text-xs text-warm-500">{formatDate(order.createdAt, i18n.language)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-warm-900 whitespace-nowrap">{formatPrice(order.totalPrice, i18n.language)}</span>
                    <Badge variant={STATUS_BADGE[order.status] || 'neutral'}>{t(`adminPanel.status_${order.status}`, order.status)}</Badge>
                    <span className="text-warm-400">{expandedId === order.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="px-5 pb-5 border-t border-warm-100 pt-4 space-y-4">
                    {/* Customer info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {order.customerEmail && (
                        <div>
                          <p className="text-warm-500">{t('auth.email')}</p>
                          <p className="text-warm-900">{order.customerEmail}</p>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div>
                          <p className="text-warm-500">{t('auth.phone')}</p>
                          <p className="text-warm-900">{order.customerPhone}</p>
                        </div>
                      )}
                      {order.notes && (
                        <div className="col-span-full">
                          <p className="text-warm-500">{t('checkout.note')}</p>
                          <p className="text-warm-900">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-sm font-medium text-warm-700 mb-2">{t('order.items')}</p>
                      <ul className="space-y-1 text-sm">
                        {order.items.map(item => (
                          <li key={item.id} className="flex justify-between text-warm-600">
                            <span>{item.recipeName} × {item.quantityKg} kg</span>
                            <span>{formatPrice(item.lineTotal, i18n.language)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Status change + delete */}
                    <div className="flex items-center gap-3 pt-2">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        className="rounded-xl border border-warm-300 bg-white text-warm-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{t(`adminPanel.status_${s}`, s)}</option>
                        ))}
                      </select>
                      <button onClick={() => setDeleteTarget(order)} className="text-sm text-red-600 hover:text-red-700 font-medium ml-auto">
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('adminPanel.deleteOrder')}
        description={t('adminPanel.deleteOrderConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
      />
    </>
  )
}
