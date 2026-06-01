import api from '@/lib/axios'
import type { Sale } from '@/app/types'

export interface SaleFilters {
  status?: string
  page?: number
}

export interface SalePayload {
  customer_name?: string
  payment_method: string
  notes?: string
  items?: { product_id: number; quantity: number; unit_price: number }[]
  services?: { service_id: number; quantity: number; unit_price: number }[]
}

function parseSale(s: Sale): Sale {
  return {
    ...s,
    total: Number(s.total),
    items: s.items.map((item) => ({
      ...item,
      unit_price: Number(item.unit_price),
      subtotal: Number(item.subtotal),
    })),
    services: s.services.map((sv) => ({
      ...sv,
      unit_price: Number(sv.unit_price),
      subtotal: Number(sv.subtotal),
    })),
  }
}

export const saleService = {
  async list(filters?: SaleFilters) {
    const { data } = await api.get('/api/sales', { params: filters })
    return {
      ...data,
      data: (data.data as Sale[]).map(parseSale),
    }
  },

  async get(id: number): Promise<Sale> {
    const { data } = await api.get(`/api/sales/${id}`)
    return parseSale(data.data)
  },

  async create(payload: SalePayload): Promise<Sale> {
    const { data } = await api.post('/api/sales', payload)
    return parseSale(data.data)
  },

  async updateStatus(id: number, status: string, paymentMethod?: string): Promise<Sale> {
    const { data } = await api.patch(`/api/sales/${id}/status`, {
      status,
      payment_method: paymentMethod,
    })
    return parseSale(data.data)
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/sales/${id}`)
  },
}
