import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { saleService, type SaleFilters, type SalePayload } from '@/services/sale.service'
import { PRODUCT_KEYS } from './useProducts'
import { MOVEMENT_KEYS } from './useMovements'
import { getErrorMessage } from '@/lib/errors'

export const SALE_KEYS = {
  all: ['sales'] as const,
  list: (filters?: SaleFilters) => ['sales', 'list', filters] as const,
  detail: (id: number) => ['sales', 'detail', id] as const,
}

export function useSales(filters?: SaleFilters) {
  return useQuery({
    queryKey: SALE_KEYS.list(filters),
    queryFn: () => saleService.list(filters),
  })
}

export function useSale(id: number) {
  return useQuery({
    queryKey: SALE_KEYS.detail(id),
    queryFn: () => saleService.get(id),
    enabled: !!id,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SalePayload) => saleService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all })
      toast.success('Saída registrada com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao registrar saída.'))
    },
  })
}

export function useUpdateSaleStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, paymentMethod }: { id: number; status: string; paymentMethod?: string }) =>
      saleService.updateStatus(id, status, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.all })
      toast.success('Status atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar status.'))
    },
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => saleService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.all })
      toast.success('Venda removida com sucesso.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao remover venda.'))
    },
  })
}
