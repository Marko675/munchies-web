import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/apiClient'
import { formatPrice, formatDate } from '@/lib/formatters'
import { Badge } from '@/components/Badge'
import { SEOHead } from '@/components/SEOHead'
import toast from 'react-hot-toast'

interface TaskItem {
  id: string
  recipeId: string
  recipeName: string
  quantityKg: number
  unitPrice: number
  lineTotal: number
}

interface Task {
  id: string
  title: string
  notes: string | null
  totalPrice: number
  status: string
  items: TaskItem[]
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'] as const

const STATUS_BADGE: Record<string, 'info' | 'warning' | 'success' | 'error' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
}

export function AdminTasksPage() {
  const { t, i18n } = useTranslation()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    try {
      const data = await apiClient.get<Task[]>('/api/tasks')
      setTasks(data)
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(taskId: string, status: string) {
    try {
      await apiClient.patch(`/api/tasks/${taskId}/status`, { status })
      toast.success(t('adminPanel.statusUpdated'))
      await loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  return (
    <>
      <SEOHead title={t('adminPanel.tasks')} />
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-warm-900">{t('adminPanel.tasks')}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-warm-500 py-8 text-center">{t('adminPanel.noTasks')}</p>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="bg-white rounded-2xl border border-warm-100 overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-warm-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-warm-900 truncate">{task.title}</p>
                    <p className="text-xs text-warm-500">{formatDate(task.createdAt, i18n.language)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-warm-900 whitespace-nowrap">{formatPrice(task.totalPrice, i18n.language)}</span>
                    <Badge variant={STATUS_BADGE[task.status] || 'neutral'}>{t(`adminPanel.status_${task.status}`, task.status)}</Badge>
                    <span className="text-warm-400">{expandedId === task.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedId === task.id && (
                  <div className="px-5 pb-5 border-t border-warm-100 pt-4 space-y-4">
                    {task.notes && (
                      <div className="text-sm">
                        <p className="text-warm-500">{t('adminPanel.notes')}</p>
                        <p className="text-warm-900">{task.notes}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-warm-700 mb-2">{t('order.items')}</p>
                      <ul className="space-y-1 text-sm">
                        {task.items.map(item => (
                          <li key={item.id} className="flex justify-between text-warm-600">
                            <span>{item.recipeName} × {item.quantityKg} kg</span>
                            <span>{formatPrice(item.lineTotal, i18n.language)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="text-sm text-warm-600">{t('order.status')}:</label>
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        className="rounded-xl border border-warm-300 bg-white text-warm-900 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{t(`adminPanel.status_${s}`, s)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
