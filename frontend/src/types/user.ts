export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'manager' | 'admin'
  avatar?: string
  status: 'active' | 'inactive' | 'pending'
  verified: boolean
  createdAt: string
  updatedAt: string
  portfolioCount: number
  lastLoginAt?: Date
}
