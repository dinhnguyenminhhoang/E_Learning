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
export { refreshTokenApi, resendVerificationApi, signinApi, signoutApi, signupApi, verifyEmailApi }
