import api from '@/lib/axios'
import type { Movement } from '@/app/types'

export interface MovementFilters {
  product_id?: number
  type?: 'entrada' | 'saida'
  page?: number
}

export interface MovementPayload {
  product_id: number
  type: 'entrada' | 'saida'
  quantity: number
  notes?: string
}

export const movementService = {
  async list(filters?: MovementFilters) {
    const { data } = await api.get('/api/movements', { params: filters })
    return data
  },

  async create(payload: MovementPayload): Promise<Movement> {
    const { data } = await api.post('/api/movements', payload)
    return data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/movements/${id}`)
  },
}
