import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productService, type ProductFilters, type ProductPayload } from '@/services/product.service'
import { getErrorMessage } from '@/lib/errors'
import { DASHBOARD_KEYS } from './useDashboard'
import { MOVEMENT_KEYS } from './useMovements'

export const PRODUCT_KEYS = {
  all: ['products'] as const,
  list: (filters?: ProductFilters) => ['products', 'list', filters] as const,
  detail: (id: number) => ['products', 'detail', id] as const,
  barcode: (code: string) => ['products', 'barcode', code] as const,
  nextBarcode: ['products', 'next-barcode'] as const,
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => productService.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => productService.get(id),
    enabled: !!id,
  })
}

export function useNextBarcode(enabled: boolean = true) {
  return useQuery({
    queryKey: PRODUCT_KEYS.nextBarcode,
    queryFn: () => productService.getNextBarcode(),
    enabled,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useProductByBarcode(barcode: string) {
  return useQuery({
    queryKey: PRODUCT_KEYS.barcode(barcode),
    queryFn: () => productService.findByBarcode(barcode),
    enabled: !!barcode,
    retry: false,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) => productService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.summary })
      queryClient.invalidateQueries({ queryKey: MOVEMENT_KEYS.all })
      toast.success('Produto cadastrado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao cadastrar produto.'))
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<ProductPayload>) =>
      productService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      toast.success('Produto atualizado com sucesso!')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao atualizar produto.'))
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
      toast.success('Produto removido com sucesso.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Erro ao remover produto.'))
    },
  })
}
