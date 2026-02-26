import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { productService } from '@/services/productService'
import type { Product, Category } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/Skeleton'
import { SEOHead } from '@/components/SEOHead'
import { Button } from '@/components/Button'

const CATEGORY_ICONS: Record<string, string> = {
  cakes: '🎂',
  cookies: '🍪',
  'crescent-rolls': '🥐',
  pies: '🥧',
  bread: '🍞',
  donuts: '🍩',
  tarts: '🥮',
  seasonal: '⭐',
  'gift-boxes': '🎁',
}

export function HomePage() {
  const { t } = useTranslation()
  const [featured, setFeatured] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productService.getFeaturedProducts(),
      productService.getCategories(),
    ])
      .then(([products, cats]) => {
        setFeatured(products.slice(0, 6))
        setCategories(cats)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])


  return (
    <>
      <SEOHead
        title={t('home.heroTitle')}
        description={t('home.heroSubtitle')}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-terracotta-600 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />
        <div className="container-app relative py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-10 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            <Link to="/menu">
              <Button size="lg" variant="secondary" className="shadow-lg">
                {t('home.heroCta')} →
              </Button>
            </Link>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 60L1440 60L1440 20C1200 60 720 0 0 40L0 60Z"
              fill="rgb(250 250 245)"
            />
          </svg>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-app py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-warm-900 mb-2">{t('home.featuredTitle')}</h2>
          <p className="text-warm-500">{t('home.featuredSubtitle')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/menu">
            <Button variant="outline" size="lg">
              {t('home.heroCta')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-warm-100 py-16">
        <div className="container-app">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-warm-900 mb-2">{t('home.categoriesTitle')}</h2>
            <p className="text-warm-500">{t('home.categoriesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/menu?category=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-warm-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                  {CATEGORY_ICONS[cat.id] ?? '🍽️'}
                </span>
                <span className="text-sm font-medium text-warm-800 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
