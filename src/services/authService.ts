import type { LoginCredentials, RegisterData, AuthResponse, UpdateProfileData } from '@/types'
import type { User } from '@/types'
import { apiClient } from '@/lib/apiClient'

/** Shape returned by the backend auth endpoints */
interface BackendUser {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  provider?: string
  isAdmin: boolean
}

interface BackendAuthResponse {
  token: string
  user: BackendUser
}

function mapBackendUser(bu: BackendUser): User {
  return {
    id: bu.id,
    name: bu.name,
    email: bu.email,
    phone: '',
    address: '',
    role: bu.isAdmin ? 'admin' : 'user',
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await apiClient.post<BackendAuthResponse>('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    })
    return { token: data.token, user: mapBackendUser(data.user) }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await apiClient.post<BackendAuthResponse>('/api/auth/register', {
      email: data.email,
      password: data.password,
      name: data.name,
    })
    return { token: res.token, user: mapBackendUser(res.user) }
  },

  async resetPassword(_email: string): Promise<void> {
    // Backend does not support password reset yet — no-op
  },

  async updateProfile(_userId: string, data: UpdateProfileData): Promise<User> {
    // Backend doesn't have a profile update endpoint yet
    // Return the data as-is for now
    return {
      id: _userId,
      name: data.name,
      email: '',
      phone: data.phone,
      address: data.address,
      role: 'user',
    }
  },

  async changePassword(_userId: string, _currentPassword: string, _newPassword: string): Promise<void> {
    // Backend doesn't have a change-password endpoint yet
    throw new Error('Promena lozinke nije dostupna.')
  },

  async getCurrentUser(_token: string): Promise<User> {
    const data = await apiClient.get<BackendUser>('/api/auth/me')
    return mapBackendUser(data)
  },
}
