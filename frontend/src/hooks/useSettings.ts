import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingService } from '@/services/setting.service'
import { getErrorMessage } from '@/lib/errors'

export const SETTING_KEYS = {
  all: ['settings'] as const,
}

export function useSettings() {
  return useQuery({
    queryKey: SETTING_KEYS.all,
    queryFn: () => settingService.get(),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (diaInicioMes: number) => settingService.update(diaInicioMes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTING_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['period'] })
      toast.success('Configuração salva com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao salvar configuração.'))
    },
  })
}
