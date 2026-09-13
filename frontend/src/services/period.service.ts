import api from '@/lib/axios'

export interface PeriodCurrent {
  start: string
  end: string
  dia_inicio_mes: number
}

export const periodService = {
  async getCurrent(): Promise<PeriodCurrent> {
    const { data } = await api.get('/api/period/current')
    return data.data
  },
}
