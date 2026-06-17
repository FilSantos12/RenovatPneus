import api from '@/lib/axios'
import type { Product } from '@/app/types'

export interface ProductFilters {
  name?: string
  brand?: string
  size?: string
  page?: number
  per_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number; per_page: number }
}

export interface ProductPayload {
  name: string
  barcode?: string
  description?: string
  brand: string
  size: string
  price_cost?: number
  price_sale: number
  quantity?: number
  min_stock: number
  active?: boolean
}

function parseProduct(p: Product): Product {
  return {
    ...p,
    price_cost: p.price_cost != null ? Number(p.price_cost) : undefined,
    price_sale: Number(p.price_sale),
  }
}

export const productService = {
  async list(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get('/api/products', { params: filters })
    return {
      ...data,
      data: (data.data as Product[]).map(parseProduct),
    }
  },

  async get(id: number): Promise<Product> {
    const { data } = await api.get(`/api/products/${id}`)
    return parseProduct(data.data)
  },

  async findByBarcode(barcode: string): Promise<Product> {
    const { data } = await api.get(`/api/products/barcode/${barcode}`)
    return parseProduct(data.data)
  },

  async create(payload: ProductPayload): Promise<Product> {
    const { data } = await api.post('/api/products', payload)
    return parseProduct(data.data)
  },

  async update(id: number, payload: Partial<ProductPayload>): Promise<Product> {
    const { data } = await api.put(`/api/products/${id}`, payload)
    return parseProduct(data.data)
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/products/${id}`)
  },

  async getNextBarcode(): Promise<string> {
    const { data } = await api.get('/api/products/next-barcode')
    return data.barcode
  },
}
