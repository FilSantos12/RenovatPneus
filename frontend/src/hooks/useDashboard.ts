import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'

export const DASHBOARD_KEYS = {
  summary: ['dashboard', 'summary'] as const,
}

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_KEYS.summary,
    queryFn: () => dashboardService.getSummary(),
    refetchInterval: 1000 * 60 * 2,
  })
}
