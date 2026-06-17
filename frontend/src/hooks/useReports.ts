import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { EntryReportItem, SaleReportItem, ServiceReportItem } from '@/app/types'

export interface ReportFilters {
  start_date: string
  end_date: string
  user_id?: number
  product_id?: number
  service_id?: number
}

interface ReportResponse<T> {
  data: T[]
  total: number
}

export function useEntriesReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'entries', filters],
    queryFn: (): Promise<ReportResponse<EntryReportItem>> =>
      api.get('/api/reports/entries', { params: filters }).then(r => r.data),
    enabled: enabled && !!filters.start_date && !!filters.end_date,
  })
}

export function useSalesReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'sales', filters],
    queryFn: (): Promise<ReportResponse<SaleReportItem>> =>
      api.get('/api/reports/sales', { params: filters }).then(r => r.data),
    enabled: enabled && !!filters.start_date && !!filters.end_date,
  })
}

export function useServicesReport(filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: ['reports', 'services', filters],
    queryFn: (): Promise<ReportResponse<ServiceReportItem>> =>
      api.get('/api/reports/services', { params: filters }).then(r => r.data),
    enabled: enabled && !!filters.start_date && !!filters.end_date,
  })
}
