import api from '@/lib/axios'
import type { User } from '@/app/types'

export interface UserPayload {
  name: string
  username: string
  role: 'adm' | 'operador'
  active?: boolean
  password?: string
  password_confirmation?: string
}

export const userService = {
  async list() {
    const { data } = await api.get('/api/users')
    return data
  },

  async create(payload: UserPayload & { password: string; password_confirmation: string }): Promise<User> {
    const { data } = await api.post('/api/users', payload)
    return data.data
  },

  async update(id: number, payload: Partial<UserPayload>): Promise<User> {
    const { data } = await api.put(`/api/users/${id}`, payload)
    return data.data
  },

  async toggleActive(id: number): Promise<User> {
    const { data } = await api.patch(`/api/users/${id}/toggle-active`)
    return data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`)
  },
}
