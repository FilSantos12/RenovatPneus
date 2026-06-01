import api from '@/lib/axios'
import type { Service } from '@/app/types'

export interface ServicePayload {
  name: string
  description?: string
  price: number
  active?: boolean
}

function parseService(s: Service): Service {
  return { ...s, price: Number(s.price) }
}

export const serviceService = {
  async list() {
    const { data } = await api.get('/api/services')
    return {
      ...data,
      data: (data.data as Service[]).map(parseService),
    }
  },

  async create(payload: ServicePayload): Promise<Service> {
    const { data } = await api.post('/api/services', payload)
    return parseService(data.data)
  },

  async update(id: number, payload: Partial<ServicePayload>): Promise<Service> {
    const { data } = await api.put(`/api/services/${id}`, payload)
    return parseService(data.data)
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/services/${id}`)
  },
}
