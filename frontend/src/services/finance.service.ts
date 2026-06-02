import api from '@/lib/axios'

export type FinancePeriod = 'today' | 'month' | 'year'

export interface FinanceSummary {
  period: FinancePeriod
  revenue: number
  cost: number
  profit: number
  margin: number
  fiado_count: number
  fiado_total: number
  payment_methods: Record<string, { total: number; count: number }>
  series: Array<{
    label: string
    revenue: number
    cost: number
    profit: number
  }>
  recent_sales: Array<{
    id: number
    description: string
    total: number
    status: string
    payment_method: string
    user_name: string
    created_at: string
  }>
}

export const financeService = {
  async getSummary(period: FinancePeriod): Promise<FinanceSummary> {
    const { data } = await api.get('/api/finance/summary', { params: { period } })
    return data.data
  },
}
