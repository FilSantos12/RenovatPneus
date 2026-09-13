import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export const BRANDS_KEYS = {
  all: ['brands'] as const,
}

export function useBrands() {
  return useQuery({
    queryKey: BRANDS_KEYS.all,
    queryFn: async () => {
      const { data } = await api.get('/api/products/brands')
      return (data.brands as string[]) || []
    },
    staleTime: 5 * 60 * 1000, // cache 5 minutos
    gcTime: 10 * 60 * 1000, // garbage collect após 10 minutos
  })
}
