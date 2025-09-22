import { API_CONFIG } from '@/constant/api'
import { ApiResponse, AuthTokens } from '@/types/response'
import { User } from '@/types/user'
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import { toast } from 'react-hot-toast'
import { refreshTokenApi } from '../services/auth'

class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'portfolio_access_token'
  private readonly USER_KEY = 'portfolio_user'

  private setCookie(
    name: string,
    value: string,
    options: {
      days?: number
      secure?: boolean
      sameSite?: 'strict' | 'lax' | 'none'
    } = {}
  ): void {
    if (typeof document === 'undefined') return

    const {
      days = 7,
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax',
    } = options

    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

    let cookieString = `${name}=${encodeURIComponent(value)}`
    cookieString += `; expires=${expires.toUTCString()}`
    cookieString += `; path=/`
    cookieString += `; SameSite=${sameSite}`

    if (secure) {
      cookieString += `; Secure`
    }
    document.cookie = cookieString
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null

    const nameEQ = name + '='
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
      let c = cookie.trim()
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length))
      }
    }

    return null
  }

  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=lax`

    if (process.env.NODE_ENV === 'production') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=lax; Secure`
    }
  }

  setTokens(tokens: AuthTokens): void {
    this.setCookie(this.ACCESS_TOKEN_KEY, tokens.accessToken, {
      days: 1,
      secure: true,
      sameSite: 'strict',
    })
  }

  getAccessToken(): string | null {
    return this.getCookie(this.ACCESS_TOKEN_KEY)
  }

  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  clearTokens(): void {
    this.deleteCookie(this.ACCESS_TOKEN_KEY)

    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY)
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    const user = this.getUser()
    return !!(token && user)
  }
}
export const tokenManager = new TokenManager()

class ApiInstance {
  private instance: AxiosInstance
  private tokenManager: TokenManager
  private isRefreshing: boolean = false
  private failedQueue: Array<{
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []

  constructor() {
    this.tokenManager = new TokenManager()
    this.instance = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
      timeout: API_CONFIG.TIMEOUT,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.tokenManager.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        config.headers['X-Device-Type'] = 'web'
        config.headers['X-Device-ID'] = this.getDeviceId()
        config.headers['X-Client-Version'] =
          process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(() => {
              const token = this.tokenManager.getAccessToken()
              if (token) {
                originalRequest.headers!.Authorization = `Bearer ${token}`
              }
              return this.instance(originalRequest)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const response = await refreshTokenApi()

            if (response.metadata) {
              const { accessToken, user } = response.metadata

              this.tokenManager.setTokens({
                accessToken,
                tokenType: 'Bearer',
                expiresIn: 3600,
              })

              if (user) {
                this.tokenManager.setUser(user)
              }

              this.failedQueue.forEach(({ resolve }) => {
                resolve(this.instance(originalRequest))
              })
              this.failedQueue = []

              originalRequest.headers!.Authorization = `Bearer ${accessToken}`
              return this.instance(originalRequest)
            }
          } catch (refreshError) {
            this.handleAuthFailure()

            this.failedQueue.forEach(({ reject }) => {
              reject(refreshError)
            })
            this.failedQueue = []

            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        this.handleApiError(error)
        return Promise.reject(error)
      }
    )
  }

  private getDeviceId(): string {
    const DEVICE_ID_KEY = 'portfolio_device_id'

    if (typeof window !== 'undefined') {
      let deviceId = localStorage.getItem(DEVICE_ID_KEY)
      if (!deviceId) {
        deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem(DEVICE_ID_KEY, deviceId)
      }
      return deviceId
    }

    return 'web_unknown'
  }
  private handleAuthFailure(): void {
    this.tokenManager.clearTokens()
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
      window.location.href = loginUrl
    }
  }

  private handleApiError(error: AxiosError): void {
    const response = error.response
    const errorData = response?.data as any
    if (response?.status === 429) {
      toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.')
      return
    }

    if (response?.status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.')
      return
    }

    if (response?.status !== undefined && response.status >= 500) {
      toast.error('Lỗi server. Vui lòng thử lại sau.')
      return
    }

    if (response?.status === 400 && errorData?.validationErrors) {
      const firstError = Object.values(errorData.validationErrors)[0] as string
      toast.error(firstError || 'Dữ liệu không hợp lệ')
      return
    }
    const errorMessage =
      errorData?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
    toast.error(errorMessage)
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get(url, config)
    return response.data
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, data, config)
    return response.data
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put(url, data, config)
    return response.data
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch(url, data, config)
    return response.data
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(url, config)
    return response.data
  }

  public getCurrentUser(): User | null {
    return this.tokenManager.getUser()
  }

  public isAuthenticated(): boolean {
    return this.tokenManager.isAuthenticated()
  }
}

export const apiInstance = new ApiInstance()
export default apiInstance
