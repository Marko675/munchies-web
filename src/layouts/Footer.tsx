import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-warm-900 text-warm-300 mt-auto">
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <span aria-hidden="true">🧁</span>
              <span>{t('common.appName')}</span>
            </div>
            <p className="text-sm text-warm-400 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
              Brze veze
            </h3>
            <nav className="space-y-2">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/menu', label: t('nav.menu') },
                { to: '/contact', label: t('nav.contact') },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block text-sm text-warm-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">
              {t('contact.infoTitle')}
            </h3>
            <div className="space-y-2 text-sm text-warm-400">
              <p>{t('contact.addressValue')}</p>
              <p>{t('contact.phoneValue')}</p>
              <p>{t('contact.emailValue')}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-warm-700 mt-8 pt-6 text-center text-xs text-warm-500">
          © {year} {t('common.appName')}. Sva prava zadržana.
        </div>
      </div>
    </footer>
  )
}
