import { useQuery } from '@tanstack/react-query'
import { periodService } from '@/services/period.service'

export function usePeriodCurrent() {
  return useQuery({
    queryKey: ['period', 'current'],
    queryFn: () => periodService.getCurrent(),
    staleTime: 1000 * 60 * 5,
  })
}
