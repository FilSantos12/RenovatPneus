import { useQuery } from '@tanstack/react-query'
import { financeService, type FinancePeriod } from '@/services/finance.service'

export function useFinanceSummary(period: FinancePeriod) {
  return useQuery({
    queryKey: ['finance', 'summary', period],
    queryFn: () => financeService.getSummary(period),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  })
}
