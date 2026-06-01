import api from '@/lib/axios'
import type { DashboardSummary } from '@/app/types'

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get('/api/dashboard')
    return data
  },
}
