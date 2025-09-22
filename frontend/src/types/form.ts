export interface SignInFormData {
  email: string
  password: string
  rememberMe: boolean
}
export interface ValidationErrors {
  email?: string
  password?: string
  general?: string
}
export interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber: string
  bio: string
  website: string
  skills: string[]
  agreeToTerms: boolean
  subscribeNewsletter: boolean
}

export interface ValidationErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  phoneNumber?: string
  bio?: string
  website?: string
  skills?: string
  agreeToTerms?: string
  general?: string
}
