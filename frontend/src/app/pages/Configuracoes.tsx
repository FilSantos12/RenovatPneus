import { useState, useEffect, type FormEvent } from 'react'
import { Settings as SettingsIcon, Loader2 } from 'lucide-react'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'

export function Configuracoes() {
  const { data, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const [diaInicioMes, setDiaInicioMes] = useState('')

  useEffect(() => {
    if (data) {
      setDiaInicioMes(String(data.dia_inicio_mes))
    }
  }, [data])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const value = Number(diaInicioMes)
    if (!Number.isInteger(value) || value < 1 || value > 31) return
    updateSettings.mutate(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-[#F97316]" />
          Configurações
        </h1>
        <p className="text-[#2D2D2D]/60 text-sm mt-1">Configurações gerais do sistema</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-lg">
        <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
          Mês contábil
        </h2>
        <p className="text-sm text-[#2D2D2D]/60 mb-4">
          Define em qual dia do mês começa e termina o ciclo usado nos relatórios e no card
          "Este mês" das Finanças. Por exemplo, configurando o dia 10, o ciclo vai do dia 10
          de um mês ao dia 9 do mês seguinte.
        </p>

        <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Dia de início do mês contábil</label>
            <input
              type="number"
              min={1}
              max={31}
              value={diaInicioMes}
              onChange={e => setDiaInicioMes(e.target.value)}
              className="h-10 px-3 w-28 bg-[#F5F5F5] border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="h-10 px-6 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#F97316]/90 disabled:opacity-50 transition-colors"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  )
}
