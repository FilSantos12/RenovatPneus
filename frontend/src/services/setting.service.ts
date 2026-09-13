import api from '@/lib/axios'

export interface Settings {
  dia_inicio_mes: number
}

export const settingService = {
  async get(): Promise<Settings> {
    const { data } = await api.get('/api/settings')
    return data.data
  },

  async update(diaInicioMes: number): Promise<Settings> {
    const { data } = await api.put('/api/settings', { dia_inicio_mes: diaInicioMes })
    return data.data
  },
}
