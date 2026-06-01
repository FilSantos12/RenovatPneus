import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { serviceService, type ServicePayload } from '@/services/service.service'
import { getErrorMessage } from '@/lib/errors'

export const SERVICE_KEYS = {
  all: ['services'] as const,
  list: () => ['services', 'list'] as const,
}

export function useServices() {
  return useQuery({
    queryKey: SERVICE_KEYS.list(),
    queryFn: () => serviceService.list(),
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ServicePayload) => serviceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all })
      toast.success('Serviço cadastrado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao cadastrar serviço.'))
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<ServicePayload>) =>
      serviceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all })
      toast.success('Serviço atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar serviço.'))
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => serviceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICE_KEYS.all })
      toast.success('Serviço removido com sucesso.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao remover serviço.'))
    },
  })
}
