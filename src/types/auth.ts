export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  address: string
}

export interface UpdateProfileData {
  name: string
  phone: string
  address: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface AuthResponse {
  token: string
  user: import('./user').User
}
