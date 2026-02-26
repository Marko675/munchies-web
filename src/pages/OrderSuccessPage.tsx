import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrdersStore } from '@/features/orders/store'
import { SEOHead } from '@/components/SEOHead'

export function OrderSuccessPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentOrder } = useOrdersStore()

  useEffect(() => {
    if (!currentOrder) {
      navigate('/', { replace: true })
    }
  }, [currentOrder, navigate])

  if (!currentOrder) return null

  return (
    <>
      <SEOHead title={t('order.successTitle')} />

      <div className="container-app py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-green-600" aria-hidden="true">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-warm-900 mb-3">{t('order.successTitle')}</h1>
          <p className="text-warm-600 mb-6">{t('order.successDesc')}</p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <p className="text-sm text-warm-600 mb-1">{t('order.orderNumber')}</p>
            <p className="text-2xl font-bold text-primary-600 tracking-wider">
              {currentOrder.orderNumber}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/order-status/${currentOrder.id}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
            >
              {t('order.trackOrder')}
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-700 hover:bg-primary-50 font-medium rounded-xl transition-colors"
            >
              {t('common.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
