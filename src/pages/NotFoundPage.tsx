import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEOHead } from '@/components/SEOHead'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <>
      <SEOHead title={t('errors.notFound')} />

      <div className="container-app py-20 text-center">
        <p className="text-8xl font-extrabold text-warm-200 mb-4" aria-hidden="true">404</p>
        <h1 className="text-3xl font-bold text-warm-900 mb-3">{t('errors.notFound')}</h1>
        <p className="text-warm-500 mb-8 max-w-sm mx-auto">{t('errors.notFoundDesc')}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
        >
          ← {t('common.backToHome')}
        </Link>
      </div>
    </>
  )
}
