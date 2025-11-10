import apiInstance from '@/configs/instance'
import { SignInFormData, SignUpFormData } from '@/types/form'
import { SignInResponse, SignUpResponse } from '@/types/response'

const signinApi = async (formdata: SignInFormData) => {
  const response = await apiInstance.post<SignInResponse>(
    '/user/signin',
    formdata
  )
  return response
}
const signupApi = async (formdata: Omit<SignUpFormData, 'confirmPassword' | 'agreeToTerms' | 'subscribeNewsletter'>) => {
  const response = await apiInstance.post<SignUpResponse>(
    '/user/signup',
    formdata
  )
  return response
}

const signoutApi = async () => {
  const response = await apiInstance.post('/user/signout')
  return response
}
const refreshTokenApi = async () => {
  const response = await apiInstance.post('/user/refresh-token')
  return response
}
const verifyEmailApi = async (token: string) => {
  const response = await apiInstance.get(`/user/verify-email?token=${token}`)
  return response
}

const resendVerificationApi = async (email: string) => {
  const response = await apiInstance.post('/user/resend-verification', { email })
  return response
}

// Google Signin API
// Nếu backend có endpoint POST để xử lý Google token
const googleSigninApi = async (googleToken: string) => {
  const response = await apiInstance.post<SignInResponse>(
    '/user/google-signin',
    { token: googleToken }
  )
  return response
}

// Hoặc nếu backend sử dụng OAuth flow, trả về URL để redirect
const getGoogleSigninUrl = (returnUrl?: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:8080'
  const apiVersion = '/v1/api'
  const returnUrlParam = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''
  return `${baseUrl}${apiVersion}/auth/google${returnUrlParam}`
}

export { 
  refreshTokenApi, 
  resendVerificationApi, 
  signinApi, 
  signoutApi, 
  signupApi, 
  verifyEmailApi,
  googleSigninApi,
  getGoogleSigninUrl
}
