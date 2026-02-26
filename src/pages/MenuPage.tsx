import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'
import { useProductsStore, type SortOption } from '@/features/products/store'
import { useAuthStore } from '@/features/auth/store'
import { ProductCard } from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { Modal } from '@/components/Modal'
import { SEOHead } from '@/components/SEOHead'
import { Input } from '@/components/Input'
import toast from 'react-hot-toast'

export function MenuPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const paramCategory = searchParams.get('category')

  const isAdmin = useAuthStore((s) => s.isAdmin)
  const {
    filteredProducts,
    categories,
    loading,
    error,
    search,
    categoryId,
    sort,
    fetchProducts,
    fetchCategories,
    setSearch,
    setCategoryId,
    setSort,
    deleteProduct,
  } = useProductsStore()

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Apply URL category param on load
  useEffect(() => {
    if (paramCategory) {
      setCategoryId(paramCategory)
    }
  }, [paramCategory, setCategoryId])

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteProduct(deleteTarget)
      toast.success(t('admin.deleteSuccess'))
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'name_asc', label: t('menu.sortNameAsc') },
    { value: 'price_asc', label: t('menu.sortPriceAsc') },
    { value: 'price_desc', label: t('menu.sortPriceDesc') },
  ]

  return (
    <>
      <SEOHead title={t('menu.title')} description={t('menu.subtitle')} />

      <div className="container-app py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-900 mb-1">{t('menu.title')}</h1>
          <p className="text-warm-500">{t('menu.subtitle')}</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              ref={searchRef}
              placeholder={t('menu.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t('common.search')}
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label={t('menu.sortLabel')}
              className={clsx(
                'w-full sm:w-auto px-4 py-2.5 rounded-xl border border-warm-300 text-sm',
                'bg-white text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500',
                'cursor-pointer hover:border-warm-400 transition-colors duration-150'
              )}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="relative mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setCategoryId(null)}
              className={clsx(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150',
                categoryId === null
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-warm-100 text-warm-700 hover:bg-warm-200 active:bg-warm-300'
              )}
            >
              {t('menu.allCategories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 whitespace-nowrap',
                  categoryId === cat.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-700 hover:bg-warm-200 active:bg-warm-300'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {error ? (
          <ErrorState message={error} onRetry={fetchProducts} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={t('menu.noResults')}
            description={t('menu.noResultsDesc')}
            actionLabel={t('menu.allCategories')}
            onAction={() => {
              setSearch('')
              setCategoryId(null)
              if (searchRef.current) searchRef.current.value = ''
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdminDelete={isAdmin ? (id) => setDeleteTarget(id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin delete modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
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
