import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userService, type UserPayload } from '@/services/user.service'
import { getErrorMessage } from '@/lib/errors'

export const USER_KEYS = {
  all: ['users'] as const,
  list: () => ['users', 'list'] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.list(),
    queryFn: () => userService.list(),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UserPayload & { password: string; password_confirmation: string }) =>
      userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
      toast.success('Usuário cadastrado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao cadastrar usuário.'))
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<UserPayload>) =>
      userService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
      toast.success('Usuário atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar usuário.'))
    },
  })
}

export function useToggleUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
      toast.success('Status do usuário atualizado.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar usuário.'))
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all })
      toast.success('Usuário removido com sucesso.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao remover usuário.'))
    },
  })
}
