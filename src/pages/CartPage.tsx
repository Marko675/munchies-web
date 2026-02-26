import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '@/features/cart/store'
import type { Unit } from '@/types'
import { UNIT_CONFIG } from '@/types'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { SEOHead } from '@/components/SEOHead'
import { formatPrice } from '@/lib/formatters'
import { formatQuantityDisplay } from '@/lib/quantityUtils'
import toast from 'react-hot-toast'

export function CartPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCartStore()
  const [clearOpen, setClearOpen] = useState(false)

  function handleRemove(productId: string) {
    removeItem(productId)
    toast.success(t('cart.itemRemoved'))
  }

  function handleClearConfirm() {
    clearCart()
    setClearOpen(false)
    toast.success(t('cart.cartCleared'))
  }

  function handleCheckout() {
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <>
        <SEOHead title={t('cart.title')} />
        <div className="container-app py-10">
          <EmptyState
            icon="🛒"
            title={t('cart.empty')}
            description={t('cart.emptyDesc')}
            actionLabel={t('cart.goToMenu')}
            onAction={() => navigate('/menu')}
          />
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead title={t('cart.title')} />

      <div className="container-app py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-warm-900">{t('cart.title')}</h1>
          <Button variant="ghost" size="sm" onClick={() => setClearOpen(true)}>
            {t('cart.clearCart')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const unitConfig = UNIT_CONFIG[item.unit as Unit] ?? { min: 1, step: 1 }
              return (
                <article
                  key={item.productId}
                  className="bg-white rounded-2xl border border-warm-100 p-5 flex gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-warm-900 truncate">{item.productName}</h3>
                    <p className="text-sm text-warm-500 mt-1">
                      {formatPrice(item.unitPrice, i18n.language)}/{item.unit}
                    </p>

                    {/* Quantity control */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - unitConfig.step)}
                        disabled={item.quantity <= unitConfig.min}
                        aria-label="Smanji količinu"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-warm-300 text-warm-700 hover:bg-warm-100 active:bg-warm-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        −
                      </button>
                      <span className="w-16 text-center text-sm font-medium text-warm-900">
                        {formatQuantityDisplay(item.quantity, item.unit as Unit)} {item.unit}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + unitConfig.step)}
                        aria-label="Povećaj količinu"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-warm-300 text-warm-700 hover:bg-warm-100 active:bg-warm-200 transition-colors duration-150"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemove(item.productId)}
                      aria-label={`Ukloni ${item.productName}`}
                      className="p-1 rounded-lg text-warm-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors duration-150"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <span className="font-bold text-warm-900">
                      {formatPrice(item.lineTotal, i18n.language)}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Order summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-warm-100 p-6 sticky top-24">
              <h2 className="font-bold text-lg text-warm-900 mb-6">{t('checkout.orderSummary')}</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm text-warm-600">
                    <span className="truncate mr-2">{item.productName} × {formatQuantityDisplay(item.quantity, item.unit as Unit)}{item.unit}</span>
                    <span className="flex-shrink-0">{formatPrice(item.lineTotal, i18n.language)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-warm-100 pt-4 mb-6">
                <div className="flex justify-between text-sm text-warm-600 mb-2">
                  <span>{t('cart.deliveryFee')}</span>
                  <span className="text-green-600 font-medium">{t('cart.free')}</span>
                </div>
                <div className="flex justify-between font-bold text-warm-900 text-lg">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(subtotal, i18n.language)}</span>
                </div>
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={handleCheckout}>
                {t('cart.checkout')}
              </Button>

              <div className="mt-3 text-center">
                <Link to="/menu" className="text-sm text-warm-500 hover:text-primary-600 active:text-primary-700 transition-colors duration-150">
                  ← {t('product.backToMenu')}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Modal
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={handleClearConfirm}
        title={t('cart.clearCartTitle')}
        description={t('cart.clearCartConfirm')}
        confirmLabel={t('cart.clearCart')}
        cancelLabel={t('common.cancel')}
        variant="danger"
      />
    </>
  )
}
