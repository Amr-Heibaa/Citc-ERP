const apiUrl = import.meta.env.VITE_API_URL

export const env = {
  API_URL: apiUrl || 'http://localhost:8080',
} as const