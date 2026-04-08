import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const MenuPage = lazy(() => import('@/pages/MenuPage').then((m) => ({ default: m.MenuPage })))
const ProductPage = lazy(() => import('@/pages/ProductPage').then((m) => ({ default: m.ProductPage })))
const CartPage = lazy(() => import('@/pages/CartPage').then((m) => ({ default: m.CartPage })))
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const OrderStatusPage = lazy(() => import('@/pages/OrderStatusPage').then((m) => ({ default: m.OrderStatusPage })))
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

// Admin pages
const AdminRecipesPage = lazy(() => import('@/pages/admin/AdminRecipesPage').then((m) => ({ default: m.AdminRecipesPage })))
const AdminIngredientsPage = lazy(() => import('@/pages/admin/AdminIngredientsPage').then((m) => ({ default: m.AdminIngredientsPage })))
const AdminFoldersPage = lazy(() => import('@/pages/admin/AdminFoldersPage').then((m) => ({ default: m.AdminFoldersPage })))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })))
const AdminTasksPage = lazy(() => import('@/pages/admin/AdminTasksPage').then((m) => ({ default: m.AdminTasksPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Checkout & order routes — no login required */}
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/order-status/:orderId" element={<OrderStatusPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin panel — separate layout */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin/recipes" element={<AdminRecipesPage />} />
          <Route path="/admin/ingredients" element={<AdminIngredientsPage />} />
          <Route path="/admin/folders" element={<AdminFoldersPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
