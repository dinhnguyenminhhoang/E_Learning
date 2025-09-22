export interface CookieOptions {
  expires?: number
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

export class CookiesManager {
  private static instance: CookiesManager
  private isClient: boolean

  private constructor() {
    this.isClient = typeof window !== 'undefined'
  }

  public static getInstance(): CookiesManager {
    if (!CookiesManager.instance) {
      CookiesManager.instance = new CookiesManager()
    }
    return CookiesManager.instance
  }

  public set<T>(name: string, value: T, options: CookieOptions = {}): boolean {
    if (!this.isClient) return false
    try {
      const { expires = 7, secure = true, sameSite = 'lax' } = options
      const cookieValue = encodeURIComponent(JSON.stringify(value))
      const date = new Date()
      date.setDate(date.getDate() + expires)

      let cookieString = `${name}=${cookieValue}; expires=${date.toUTCString()}; path=/`

      if (secure) cookieString += '; secure'
      cookieString += `; samesite=${sameSite}`

      document.cookie = cookieString
      return true
    } catch (error) {
      return false
    }
  }

  public get<T>(name: string, defaultValue?: T): T | null {
    if (!this.isClient) return defaultValue || null
    try {
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=')
        if (key === name && value) {
          return JSON.parse(decodeURIComponent(value))
        }
      }
      return defaultValue || null
    } catch (error) {
      return defaultValue || null
    }
  }

  public remove(name: string): boolean {
    if (!this.isClient) return false
    try {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
      return true
    } catch (error) {
      return false
    }
  }

  public has(name: string): boolean {
    if (!this.isClient) return false
    return this.get(name) !== null
  }
}

export const cookies = CookiesManager.getInstance()
