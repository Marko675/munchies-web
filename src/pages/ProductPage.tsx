import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productService } from '@/services/productService'
import type { Product, Unit } from '@/types'
import { UNIT_CONFIG } from '@/types'
import { useCartStore } from '@/features/cart/store'
import { useAuthStore } from '@/features/auth/store'
import { useProductsStore } from '@/features/products/store'
import { Modal } from '@/components/Modal'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { QuantityInput } from '@/components/QuantityInput'
import { Skeleton } from '@/components/Skeleton'
import { SEOHead } from '@/components/SEOHead'
import { formatPrice } from '@/lib/formatters'
import toast from 'react-hot-toast'

export function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const deleteProduct = useProductsStore((s) => s.deleteProduct)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productService.getProductById(id)
      .then((p) => {
        setProduct(p)
        const config = UNIT_CONFIG[p.unit as Unit]
        setQuantity(config.min)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : t('errors.generic'))
        setLoading(false)
      })
  }, [id, t])

  function handleAddToCart() {
    if (!product) return
    try {
      addItem(product, quantity)
      toast.success(t('product.addedToCart'))
    } catch {
      toast.error(t('product.errorAddToCart'))
    }
  }

  async function handleDeleteConfirm() {
    if (!product) return
    setDeleteLoading(true)
    try {
      await deleteProduct(product.id)
      toast.success(t('admin.deleteSuccess'))
      navigate('/menu')
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="container-app py-10">
        <Skeleton className="h-6 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="h-80 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-11 w-44" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-app py-10 text-center">
        <p className="text-warm-600 mb-4">{error ?? t('errors.generic')}</p>
        <Link to="/menu">
          <Button variant="outline">{t('product.backToMenu')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <SEOHead title={product.name} description={product.description} />

      <div className="container-app py-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-warm-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary-600 transition-colors">{t('nav.home')}</Link>
          <span aria-hidden="true">›</span>
          <Link to="/menu" className="hover:text-primary-600 transition-colors">{t('nav.menu')}</Link>
          <span aria-hidden="true">›</span>
          <span className="text-warm-800 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden bg-warm-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 md:h-[480px] object-cover"
            />
            {!product.available && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Badge variant="unavailable" className="text-base px-4 py-2">
                  {t('common.unavailable')}
                </Badge>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-bold text-warm-900">{product.name}</h1>
              {!product.available && (
                <Badge variant="unavailable">{t('common.unavailable')}</Badge>
              )}
            </div>

            {product.description && (
              <p className="text-warm-600 text-base leading-relaxed mb-6">{product.description}</p>
            )}

            <div className="mb-6">
              <span className="text-xs uppercase tracking-wide text-warm-500 font-semibold">
                {t('product.pricePerUnit')}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold text-primary-700">
                  {formatPrice(product.pricePerUnit, i18n.language)}
                </span>
                <span className="text-warm-500 text-lg">/{product.unit}</span>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-warm-700 mb-3">
                {t('product.quantity')}
              </label>
              <QuantityInput
                value={quantity}
                unit={product.unit as Unit}
                onChange={setQuantity}
                disabled={!product.available}
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              disabled={!product.available}
              onClick={handleAddToCart}
              className="self-start"
            >
              {product.available ? t('product.addToCart') : t('product.unavailableBtn')}
            </Button>

            {isAdmin && (
              <div className="mt-6 pt-6 border-t border-warm-100">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                >
                  {t('admin.deleteProduct')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('admin.deleteProduct')}
        description={t('admin.deleteConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={deleteLoading}
      />
    </>
  )
}
