const API_CONFIG = {
  // Prefer NEXT_PUBLIC_API_URL for Next.js, but also support API_BASE_URL to mirror backend env
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_BASE_URL ||
    'http://localhost:8080',
  API_VERSION: '/v1/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}
export { API_CONFIG }
