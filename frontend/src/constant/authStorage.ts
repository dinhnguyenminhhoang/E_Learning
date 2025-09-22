import { AuthTokens, RecentActivity } from '@/types/response'
import { User } from '@/types/user'
import { cookies } from './Coookies'
import { store } from './store'

export const authStorage = {
  setRememberedEmail: (email: string) => {
    store.set('remembered_email', email.trim().toLowerCase())
  },

  getRememberedEmail: (): string | null => {
    return store.get<string>('remembered_email')
  },

  removeRememberedEmail: () => {
    store.remove('remembered_email')
  },

  addRecentActivity: (activity: RecentActivity) => {
    const activities = store.get<RecentActivity[]>('recent_activities', [])
    activities?.unshift(activity)
    store.set('recent_activities', activities?.slice(0, 10))
  },

  setTokens: (tokens: AuthTokens) => {
    const expiresInDays = Math.ceil(tokens.expiresIn / (24 * 60 * 60 * 1000))

    cookies.set('access_token', tokens.accessToken, {
      expires: expiresInDays,
      secure: true,
      sameSite: 'strict',
    })
  },

  getAccessToken: (): string | null => {
    return cookies.get<string>('access_token')
  },

  setUser: (user: User) => {
    cookies.set('user_data', user, {
      expires: 7,
      secure: true,
      sameSite: 'strict',
    })
  },

  getUser: (): User | null => {
    return cookies.get<User>('user_data')
  },

  isAuthenticated: (): boolean => {
    const token = authStorage.getAccessToken()
    const user = authStorage.getUser()
    return !!(token && user)
  },

  clearSession: () => {
    cookies.remove('access_token')
    cookies.remove('refresh_token')
    cookies.remove('user_data')
  },
}
