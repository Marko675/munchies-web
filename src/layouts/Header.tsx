import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'
import { useCartStore } from '@/features/cart/store'
import { useAuthStore } from '@/features/auth/store'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { MobileDrawer } from './MobileDrawer'
import toast from 'react-hot-toast'

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const { isAuthenticated, isAdmin, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLogout() {
    logout()
    toast.success(t('auth.logoutSuccess'))
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/menu', label: t('nav.menu') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <>
      <header
        className={clsx(
          'sticky top-0 z-40 w-full transition-shadow duration-200',
          scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'
        )}
      >
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl text-primary-700 hover:text-primary-800 transition-colors duration-150"
            >
              <span className="text-2xl" aria-hidden="true">🧁</span>
              <span className="hidden sm:block">{t('common.appName')}</span>
              <span className="sm:hidden">Munchies</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-warm-700 hover:bg-warm-100 hover:text-warm-900 active:bg-warm-200'
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl text-warm-700 hover:bg-warm-100 active:bg-warm-200 transition-colors duration-150"
                aria-label={`${t('nav.cart')} (${cartCount})`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-6 h-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold">
                    {cartCount > 99 ? '99+' : Math.floor(cartCount)}
                  </span>
                )}
              </Link>

              {/* Auth links - desktop */}
              <div className="hidden md:flex items-center gap-1">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin/recipes"
                        className="px-3 py-2 rounded-lg text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 transition-colors duration-150"
                      >
                        {t('nav.admin')}
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-warm-700 hover:bg-warm-100 active:bg-warm-200 transition-colors duration-150"
                    >
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-lg text-sm font-medium text-warm-700 hover:bg-warm-100 active:bg-warm-200 transition-colors duration-150"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-3 py-2 rounded-lg text-sm font-medium text-warm-700 hover:bg-warm-100 active:bg-warm-200 transition-colors duration-150"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors duration-150"
                    >
                      {t('nav.register')}
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-warm-700 hover:bg-warm-100 active:bg-warm-200 transition-colors duration-150"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-6 h-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />
    </>
  )
}
