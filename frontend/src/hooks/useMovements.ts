import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { movementService, type MovementFilters, type MovementPayload } from '@/services/movement.service'
import { PRODUCT_KEYS } from './useProducts'
import { DASHBOARD_KEYS } from './useDashboard'
import { getErrorMessage } from '@/lib/errors'

export const MOVEMENT_KEYS = {
  all: ['movements'] as const,
  list: (filters?: MovementFilters) => ['movements', 'list', filters] as const,
}

export function useMovements(filters?: MovementFilters) {
  return useQuery({
    queryKey: MOVEMENT_KEYS.list(filters),
    queryFn: () => movementService.list(filters),
  })
}

export function useCreateMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MovementPayload) => movementService.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      const label = variables.type === 'entrada' ? 'Entrada' : 'Saída'
      toast.success(`${label} registrada com sucesso!`)
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao registrar movimentação.'))
    },
  })
}

export function useDeleteMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => movementService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.summary })
      toast.success('Entrada excluída com sucesso.')
    },
    onError: (error: unknown) => {
      const httpError = error as { response?: { status?: number } }
      if (httpError?.response?.status === 403) {
        toast.error('Apenas o administrador pode excluir entradas.')
      } else {
        toast.error(getErrorMessage(error, 'Erro ao excluir entrada.'))
      }
    },
  })
}
