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

  return (
    <div className="flex min-h-screen bg-warm-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-warm-100 flex flex-col">
        <div className="p-5 border-b border-warm-100">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary-700">
            <span aria-hidden="true">🧁</span>
            Munchies Admin
          </Link>
          <p className="text-xs text-warm-500 mt-1">{user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNavItems.map(({ to, icon, labelKey }) => (
            <NavLink
              key={to}
              to={to}
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
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
