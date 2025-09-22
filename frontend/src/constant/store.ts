export class Store {
  private static instance: Store
  private isClient: boolean

  private constructor() {
    this.isClient = typeof window !== 'undefined'
  }

  public static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store()
    }
    return Store.instance
  }

  public set<T>(key: string, value: T): boolean {
    if (!this.isClient) return false
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      return false
    }
  }

  public get<T>(key: string, defaultValue?: T): T | null {
    if (!this.isClient) return defaultValue || null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      return defaultValue || null
    }
  }

  public remove(key: string): boolean {
    if (!this.isClient) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      return false
    }
  }

  public clear(): boolean {
    if (!this.isClient) return false
    try {
      localStorage.clear()
      return true
    } catch (error) {
      return false
    }
  }

  public has(key: string): boolean {
    if (!this.isClient) return false
    return localStorage.getItem(key) !== null
  }
}

export const store = Store.getInstance()
