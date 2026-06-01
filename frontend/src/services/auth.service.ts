import api from '@/lib/axios'
import type { User } from '@/app/types'

export const authService = {
  async login(username: string, password: string): Promise<User> {
    await api.get('/sanctum/csrf-cookie')
    const { data } = await api.post('/api/login', { username, password })
    return data.user
  },

  async logout(): Promise<void> {
    await api.post('/api/logout')
  },

  async me(): Promise<User> {
    const { data } = await api.get('/api/me')
    return data.data
  },
}
