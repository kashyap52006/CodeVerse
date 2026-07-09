// ─── Auth Types ───────────────────────────────────────────────

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  bio?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  token: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse extends AuthTokens {
  id: string
  email: string
  firstName: string
  lastName: string
  isNewUser?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface GoogleAuthRequest {
  googleToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  bio?: string
}

// ─── Auth State ───────────────────────────────────────────────

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
