import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import type { Product } from '@/types'
import { Badge } from './Badge'
import { Button } from './Button'
import { useCartStore } from '@/features/cart/store'
import { useAuthStore } from '@/features/auth/store'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/formatters'

interface ProductCardProps {
  product: Product
  onAdminDelete?: (id: string) => void
}

export function ProductCard({ product, onAdminDelete }: ProductCardProps) {
  const { t, i18n } = useTranslation()
  const addItem = useCartStore((s) => s.addItem)
  const isAdmin = useAuthStore((s) => s.isAdmin)

  function handleAddToCart() {
    try {
      addItem(product, product.unit === 'kg' || product.unit === 'L' ? 0.1 : 1)
      toast.success(t('product.addedToCart'))
    } catch {
      toast.error(t('product.errorAddToCart'))
    }
  }

  return (
    <article
      className={clsx(
        'bg-white rounded-2xl overflow-hidden border border-warm-100',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        'flex flex-col'
      )}
    >
      <Link to={`/product/${product.id}`} className="relative block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-52 object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="unavailable" className="text-sm px-3 py-1">
              {t('common.unavailable')}
            </Badge>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link
          to={`/product/${product.id}`}
          className="font-semibold text-warm-900 hover:text-primary-700 transition-colors duration-150 line-clamp-2 mb-1"
        >
          {product.name}
        </Link>

        {product.description && (
          <p className="text-xs text-warm-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div>
            <span className="text-lg font-bold text-primary-700">
              {formatPrice(product.pricePerUnit, i18n.language)}
            </span>
            <span className="text-xs text-warm-500 ml-1">/{product.unit}</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={!product.available}
            onClick={handleAddToCart}
            aria-label={
              product.available
                ? `${t('product.addToCart')} - ${product.name}`
                : t('product.unavailableBtn')
            }
          >
            {product.available ? t('product.addToCart') : t('product.unavailableBtn')}
          </Button>
        </div>

        {isAdmin && onAdminDelete && (
          <div className="mt-3 pt-3 border-t border-warm-100">
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={() => onAdminDelete(product.id)}
            >
              {t('admin.deleteProduct')}
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}
