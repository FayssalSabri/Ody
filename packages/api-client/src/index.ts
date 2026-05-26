import axios from 'axios'

axios.defaults.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8787'

export type ApiClientResponse<T> = {
  data: T
  status: number
}

export const createApiClient = () => ({
  baseUrl: axios.defaults.baseURL
})

export const apiClient = createApiClient()

export * from './generated'
