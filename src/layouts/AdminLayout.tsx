import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store'
import { clsx } from 'clsx'

const adminNavItems = [
  { to: '/admin/recipes', icon: '📋', labelKey: 'adminPanel.recipes' },
  { to: '/admin/ingredients', icon: '🥕', labelKey: 'adminPanel.ingredients' },
  { to: '/admin/folders', icon: '📁', labelKey: 'adminPanel.folders' },
  { to: '/admin/orders', icon: '📦', labelKey: 'adminPanel.orders' },
  { to: '/admin/tasks', icon: '✅', labelKey: 'adminPanel.tasks' },
]

export function AdminLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-warm-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-warm-100 flex flex-col transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:transform-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-5 border-b border-warm-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary-700">
            <span aria-hidden="true">🧁</span>
            Munchies Admin
          </Link>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg text-warm-500 hover:bg-warm-100"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="px-5 text-xs text-warm-500 mt-2">{user?.email}</p>

        <nav className="flex-1 p-3 space-y-1 mt-2">
          {adminNavItems.map(({ to, icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-warm-600 hover:bg-warm-100 hover:text-warm-900'
                )
              }
            >
              <span aria-hidden="true">{icon}</span>
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-warm-100">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-warm-600 hover:bg-warm-100 hover:text-warm-900 transition-colors"
          >
            ← {t('adminPanel.backToSite')}
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-warm-100 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-warm-700 hover:bg-warm-100"
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="font-bold text-primary-700">🧁 Admin</span>
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
