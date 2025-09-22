import { User } from './user'

export interface ApiResponse<T = any> {
  status: number
  message: string
  metadata?: T
}

export interface AuthTokens {
  accessToken: string
  expiresIn: number
  tokenType: string
}
export interface RecentActivity {
  type: string
  timestamp: number
  ip: string
}
export interface SignInResponse {
  session: {
    deviceId: string
    deviceType: string
    rememberMe: boolean
  }
  tokens: {
    accessToken: string
    expiresIn: number
    tokenType: string
  }
  user: User
}
export interface SignUpResponse {
  status: number
  message: string
  metadata: {
    user: {
      id: string
      name: string
      email: string
      status: 'pending' | 'active' | 'inactive'
      verified: boolean
      createdAt: string
    }
    emailVerificationRequired: boolean
    verificationEmailSent: boolean
    verificationToken?: string
  }
}
