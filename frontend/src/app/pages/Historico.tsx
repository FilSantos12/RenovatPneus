import { useState, useMemo } from 'react'
import { ArrowDown, ShoppingCart, Eye, FileSpreadsheet, FileText, Filter } from 'lucide-react'
import { useMovements } from '@/hooks/useMovements'
import { useSales } from '@/hooks/useSales'
import { useAuth } from '../contexts/AuthContext'
import { exportHistoricoToExcel, exportHistoricoToPDF } from '@/lib/export'
import { HistoricoDetalheModal, type HistoricoItem } from '../components/Historico/HistoricoDetalheModal'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

const formatMoney = (value: number) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const buildSaleDescription = (sale: import('@/app/types').Sale): string => {
  const first = sale.items?.[0]
  if (!first) {
    const firstSv = sale.services?.[0]
    return firstSv?.service?.name ?? `Venda #${sale.id}`
  }
  const name = first.product?.name ?? 'Produto'
  const truncated = name.length > 28 ? name.slice(0, 28) + '…' : name
  const extra = (sale.items?.length ?? 0) + (sale.services?.length ?? 0) - 1
  return truncated + (extra > 0 ? ` +${extra}` : '') + ` ×${first.quantity}`
}

const chip = (active: boolean) =>
  `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
    active
      ? 'bg-[#F97316] text-white border-[#F97316]'
      : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'
  }`

const inputCls =
  'h-10 px-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-[#F97316] transition-colors'

export function Historico() {
  const { user } = useAuth()
  const [tipo, setTipo] = useState<'todos' | 'entrada' | 'venda'>('todos')
  const [search, setSearch] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [itemSelecionado, setItemSelecionado] = useState<HistoricoItem | null>(null)

  const { data: movementsData, isLoading: loadingMovements } = useMovements()
  const { data: salesData, isLoading: loadingSales } = useSales()
  const isLoading = loadingMovements || loadingSales

  const items = useMemo<HistoricoItem[]>(() => {
    const entradas: HistoricoItem[] =
      tipo !== 'venda'
        ? (movementsData?.data ?? [])
            .filter(m => m.type === 'entrada')
            .map(m => ({ kind: 'entrada' as const, data: m }))
        : []

    const vendas: HistoricoItem[] =
      tipo !== 'entrada'
        ? (salesData?.data ?? []).map(s => ({ kind: 'venda' as const, data: s }))
        : []

    return [...entradas, ...vendas]
      .filter(item => {
        if (!search) return true
        const text =
          item.kind === 'entrada'
            ? (item.data.product?.name ?? '')
            : (item.data.items?.map(i => i.product?.name).join(' ') ?? '')
        return text.toLowerCase().includes(search.toLowerCase())
      })
      .filter(item => {
        const date = new Date(item.data.created_at)
        if (dataInicio && date < new Date(dataInicio + 'T00:00:00')) return false
        if (dataFim && date > new Date(dataFim + 'T23:59:59')) return false
        return true
      })
      .sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime())
  }, [movementsData, salesData, tipo, search, dataInicio, dataFim])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Cabeçalho imprimível (só aparece na impressão) */}
      <div className="print-header print-only">
        <div>
          <strong>Renovat Pneus</strong>
          <p>Histórico de movimentações</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p>Emitido em: {new Date().toLocaleString('pt-BR')}</p>
          <p>Filtro: {tipo === 'todos' ? 'Todos' : tipo === 'entrada' ? 'Entradas' : 'Vendas'}</p>
          <p>Total de registros: {items.length}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            Histórico de Movimentações
          </h1>
          <p className="text-[#2D2D2D]/60 text-sm mt-1">
            {items.length} registro{items.length !== 1 ? 's' : ''} encontrado{items.length !== 1 ? 's' : ''}
          </p>
        </div>

        {user?.role === 'adm' && (
          <div className="flex gap-2">
            <button
              onClick={() => exportHistoricoToExcel(items)}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
            >
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button
              onClick={exportHistoricoToPDF}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[#F97316] text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
            >
              <FileText size={16} /> PDF
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4 no-print">
        {/* Chips de tipo */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setTipo('todos')} className={chip(tipo === 'todos')}>
            Todos
          </button>
          <button onClick={() => setTipo('entrada')} className={chip(tipo === 'entrada')}>
            <ArrowDown size={13} /> Entrada
          </button>
          <button onClick={() => setTipo('venda')} className={chip(tipo === 'venda')}>
            <ShoppingCart size={13} /> Venda
          </button>
        </div>

        {/* Datas e busca */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">De</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Até</label>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Filter size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${inputCls} w-full`}
            />
          </div>
          {(search || dataInicio || dataFim) && (
            <button
              onClick={() => { setSearch(''); setDataInicio(''); setDataFim('') }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Tabela desktop */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#111111] text-white">
                <th className="px-4 py-3 text-left text-sm font-medium">Data/Hora</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Produto / Descrição</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Qtd</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Operador</th>
                <th className="px-4 py-3 text-center text-sm font-medium no-print">Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">

                  {/* Data */}
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(item.data.created_at)}
                  </td>

                  {/* Produto / Descrição */}
                  <td className="py-3 px-4 max-w-[220px]">
                    {item.kind === 'entrada' ? (
                      <>
                        <p className="text-sm text-gray-800 truncate">{item.data.product?.name}</p>
                        {item.data.notes && (
                          <p className="text-xs text-gray-400 truncate">{item.data.notes}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-800 truncate">
                          {buildSaleDescription(item.data)}
                        </p>
                        {item.data.services && item.data.services.length > 0 && (
                          <p className="text-xs text-gray-400 truncate">
                            + {item.data.services.map(s => s.service?.name).join(', ')}
                          </p>
                        )}
                      </>
                    )}
                  </td>

                  {/* Tipo */}
                  <td className="py-3 px-4">
                    {item.kind === 'entrada' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <ArrowDown size={10} /> Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <ShoppingCart size={10} /> Venda
                      </span>
                    )}
                  </td>

                  {/* Quantidade */}
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {item.kind === 'entrada'
                      ? `${item.data.quantity} un`
                      : `${item.data.items?.reduce((s, i) => s + i.quantity, 0) ?? 0} un`}
                  </td>

                  {/* Valor */}
                  <td className="py-3 px-4">
                    {item.kind === 'entrada' ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {formatMoney(item.data.total)}
                        </p>
                        {item.data.payment_method === 'fiado' && (
                          <p className="text-xs text-yellow-600">fiado</p>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Operador */}
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {item.data.user?.name ?? '—'}
                  </td>

                  {/* Ação */}
                  <td className="py-3 px-4 text-center no-print">
                    <button
                      onClick={() => setItemSelecionado(item)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-[#F97316] hover:text-white hover:border-[#F97316] transition-colors mx-auto"
                      title="Ver detalhes"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards mobile */}
      <div className="lg:hidden space-y-3">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.kind === 'entrada'
                    ? item.data.product?.name
                    : buildSaleDescription(item.data)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.data.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.kind === 'entrada' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <ArrowDown size={10} /> Entrada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ShoppingCart size={10} /> Venda
                  </span>
                )}
                <button
                  onClick={() => setItemSelecionado(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-[#F97316] hover:text-white hover:border-[#F97316] transition-colors"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {item.kind === 'entrada'
                  ? `${item.data.quantity} unidades`
                  : formatMoney(item.data.total)}
              </span>
              <span>{item.data.user?.name ?? '—'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vazio */}
      {items.length === 0 && !isLoading && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-1">
            Nenhum registro encontrado
          </h3>
          <p className="text-sm text-[#2D2D2D]/60">Tente ajustar os filtros de busca</p>
        </div>
      )}

      {/* Modal de detalhes */}
      {itemSelecionado && (
        <HistoricoDetalheModal
          item={itemSelecionado}
          onClose={() => setItemSelecionado(null)}
        />
      )}
    </div>
  )
}
