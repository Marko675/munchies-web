import { Fragment } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Dialog, Transition } from '@headlessui/react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/features/auth/store'
import { useCartStore } from '@/features/cart/store'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

export function MobileDrawer({ isOpen, onClose, onLogout }: MobileDrawerProps) {
  const { t } = useTranslation()
  const { isAuthenticated, isAdmin } = useAuthStore()
  const items = useCartStore((s) => s.items)
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const navLinks = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/menu', label: t('nav.menu'), end: false },
    { to: '/cart', label: `${t('nav.cart')}${cartCount > 0 ? ` (${Math.floor(cartCount)})` : ''}`, end: false },
    { to: '/contact', label: t('nav.contact'), end: false },
  ]

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </Transition.Child>

        {/* Drawer panel */}
        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="relative w-full max-w-xs bg-white h-full shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-warm-100">
                <Link
                  to="/"
                  onClick={onClose}
                  className="font-bold text-lg text-primary-700 hover:text-primary-800 flex items-center gap-2 transition-colors duration-150"
                >
                  <span aria-hidden="true">🧁</span>
                  Munchies
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-warm-500 hover:bg-warm-100 hover:text-warm-700 active:bg-warm-200 transition-colors duration-150"
                  aria-label="Close menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="Mobile navigation">
                {navLinks.map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-warm-700 hover:bg-warm-100 active:bg-warm-200'
                      )
                    }
                  >
                    {label}
                  </NavLink>
                ))}

                {isAuthenticated && (
                  <>
                    <NavLink
                      to="/profile"
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-warm-700 hover:bg-warm-100 active:bg-warm-200'
                        )
                      }
                    >
                      {t('nav.profile')}
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/admin/recipes"
                        onClick={onClose}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
                            isActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-primary-700 hover:bg-primary-50 active:bg-primary-100'
                          )
                        }
                      >
                        {t('nav.admin')}
                      </NavLink>
                    )}
                  </>
                )}
              </nav>

              {/* Footer auth */}
              <div className="px-4 py-4 border-t border-warm-100 space-y-2">
                <LanguageSwitcher />

                {isAuthenticated ? (
                  <button
                    onClick={() => { onClose(); onLogout() }}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors duration-150"
                  >
                    {t('nav.logout')}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-warm-300 text-warm-700 hover:bg-warm-100 hover:border-warm-400 active:bg-warm-200 transition-colors duration-150"
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-colors duration-150"
                    >
                      {t('nav.register')}
                    </Link>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
