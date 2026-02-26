import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import type { LoginCredentials, RegisterData, UpdateProfileData, ChangePasswordData } from '@/types'
import { authService } from '@/services/authService'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const { token, user } = await authService.login(credentials)
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            isLoading: false,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Greška pri prijavi'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          error: null,
        })
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const { token, user } = await authService.register(data)
          set({
            user,
            token,
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            isLoading: false,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Greška pri registraciji'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      updateProfile: async (data) => {
        const { user } = get()
        if (!user) throw new Error('Niste prijavljeni')
        set({ isLoading: true, error: null })
        try {
          const updated = await authService.updateProfile(user.id, data)
          set({ user: updated, isLoading: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Greška pri čuvanju'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      changePassword: async (data) => {
        const { user } = get()
        if (!user) throw new Error('Niste prijavljeni')
        set({ isLoading: true, error: null })
        try {
          await authService.changePassword(user.id, data.currentPassword, data.newPassword)
          set({ isLoading: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Greška pri promeni lozinke'
          set({ isLoading: false, error: message })
          throw err
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'munchies-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
)
