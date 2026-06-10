import { useState } from 'react'
import { FileSpreadsheet, FileText, Search, BarChart2 } from 'lucide-react'
import { useEntriesReport, useSalesReport, type ReportFilters } from '@/hooks/useReports'
import { useUsers } from '@/hooks/useUsers'
import { useProducts } from '@/hooks/useProducts'
import { exportEntriesToExcel, exportSalesToExcel, exportReportToPDF } from '@/lib/export'
import type { EntryReportItem, SaleReportItem } from '@/app/types'

type Tab = 'entradas' | 'vendas'

const paymentLabels: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'PIX',
  fiado: 'Fiado',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

const formatMoney = (value: number) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function getMonthRange(): { start: string; end: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
  return { start: `${y}-${m}-01`, end: `${y}-${m}-${String(lastDay).padStart(2, '0')}` }
}

const inputCls =
  'h-10 px-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-[#F97316] transition-colors'

const tabCls = (active: boolean) =>
  `px-5 py-2.5 text-sm font-medium rounded-xl border-2 transition-colors ${
    active
      ? 'border-[#F97316] bg-[#F97316]/10 text-[#F97316]'
      : 'border-gray-200 text-gray-500 hover:border-gray-300'
  }`

export function RelatoriosPage() {
  const { start, end } = getMonthRange()

  const [tab, setTab] = useState<Tab>('entradas')

  // Filtros do formulário (não submetidos ainda)
  const [formFilters, setFormFilters] = useState({
    start_date: start,
    end_date: end,
    user_id: '',
    product_id: '',
  })

  // Filtros submetidos — disparam as queries
  const [submitted, setSubmitted] = useState(false)
  const [activeFilters, setActiveFilters] = useState<ReportFilters>({
    start_date: start,
    end_date: end,
  })

  const { data: usersData }    = useUsers()
  const { data: productsData } = useProducts()
  const users    = (usersData as any)?.data ?? []
  const products = productsData?.data ?? []

  const entriesQuery = useEntriesReport(activeFilters, submitted && tab === 'entradas')
  const salesQuery   = useSalesReport(activeFilters,   submitted && tab === 'vendas')

  const entries: EntryReportItem[] = entriesQuery.data?.data ?? []
  const sales: SaleReportItem[]    = salesQuery.data?.data   ?? []

  const isLoading = tab === 'entradas' ? entriesQuery.isFetching : salesQuery.isFetching

  function handleSearch() {
    setActiveFilters({
      start_date: formFilters.start_date,
      end_date:   formFilters.end_date,
      ...(formFilters.user_id    ? { user_id:    Number(formFilters.user_id) }    : {}),
      ...(formFilters.product_id ? { product_id: Number(formFilters.product_id) } : {}),
    })
    setSubmitted(true)
  }

  const today = new Date().toISOString().slice(0, 10)

  const totalEntryQty   = entries.reduce((s, e) => s + e.quantity, 0)
  const totalSaleQty    = sales.reduce((s, i) => s + i.quantity, 0)
  const totalSaleValue  = sales.reduce((s, i) => s + Number(i.subtotal), 0)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">

      {/* Cabeçalho imprimível */}
      <div className="print-header print-only">
        <div>
          <strong>Renovat Pneus</strong>
          <p>Relatório de {tab === 'entradas' ? 'Entradas' : 'Vendas'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p>Emitido em: {new Date().toLocaleString('pt-BR')}</p>
          <p>Período: {formFilters.start_date} a {formFilters.end_date}</p>
          <p>Total de registros: {tab === 'entradas' ? entries.length : sales.length}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-[#F97316]" />
            Relatórios
          </h1>
          <p className="text-[#2D2D2D]/60 text-sm mt-1">
            Relatórios de entradas e vendas por período
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (tab === 'entradas') exportEntriesToExcel(entries, today)
              else exportSalesToExcel(sales, today)
            }}
            disabled={tab === 'entradas' ? entries.length === 0 : sales.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
          >
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button
            onClick={exportReportToPDF}
            disabled={tab === 'entradas' ? entries.length === 0 : sales.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[#F97316] text-white hover:bg-orange-600 disabled:opacity-40 transition-colors"
          >
            <FileText size={16} /> PDF
          </button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 no-print">
        <button onClick={() => setTab('entradas')} className={tabCls(tab === 'entradas')}>
          Entradas
        </button>
        <button onClick={() => setTab('vendas')} className={tabCls(tab === 'vendas')}>
          Vendas
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4 no-print">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Data início</label>
            <input
              type="date"
              value={formFilters.start_date}
              onChange={e => setFormFilters(f => ({ ...f, start_date: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Data fim</label>
            <input
              type="date"
              value={formFilters.end_date}
              onChange={e => setFormFilters(f => ({ ...f, end_date: e.target.value }))}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Operador</label>
            <select
              value={formFilters.user_id}
              onChange={e => setFormFilters(f => ({ ...f, user_id: e.target.value }))}
              className={`${inputCls} pr-8`}
            >
              <option value="">Todos os operadores</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Produto</label>
            <select
              value={formFilters.product_id}
              onChange={e => setFormFilters(f => ({ ...f, product_id: e.target.value }))}
              className={`${inputCls} pr-8`}
            >
              <option value="">Todos os produtos</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 h-10 px-5 bg-[#111111] text-white rounded-xl text-sm font-medium hover:bg-[#2D2D2D] transition-colors"
          >
            <Search size={15} /> Buscar
          </button>
        </div>
      </div>

      {/* Estado: aguardando busca */}
      {!submitted && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-sm text-[#2D2D2D]/60">Selecione os filtros e clique em Buscar.</p>
        </div>
      )}

      {/* Estado: carregando */}
      {submitted && isLoading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Tabela de Entradas */}
      {submitted && !isLoading && tab === 'entradas' && (
        <>
          {entries.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <p className="text-sm text-[#2D2D2D]/60">Nenhum registro encontrado para o período selecionado.</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#111111] text-white">
                        <th className="px-4 py-3 text-left text-sm font-medium">Produto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Cód. Barras</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Qtd</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Data/Hora</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Operador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-800">{item.product_name}</td>
                          <td className="py-3 px-4 text-xs text-gray-500 font-mono">{item.product_barcode}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-700">{item.quantity}</td>
                          <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(item.created_at)}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.user_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards mobile — Entradas */}
              <div className="lg:hidden space-y-3">
                {entries.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{item.product_barcode}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{item.quantity} un · {item.user_name}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totalizador — Entradas */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-6 text-sm no-print">
                <span className="text-gray-500">
                  <span className="font-semibold text-[#2D2D2D]">{entries.length}</span> registro{entries.length !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-500">
                  Total de unidades: <span className="font-semibold text-[#2D2D2D]">{totalEntryQty}</span>
                </span>
              </div>
            </>
          )}
        </>
      )}

      {/* Tabela de Vendas */}
      {submitted && !isLoading && tab === 'vendas' && (
        <>
          {sales.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <p className="text-sm text-[#2D2D2D]/60">Nenhum registro encontrado para o período selecionado.</p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#111111] text-white">
                        <th className="px-4 py-3 text-left text-sm font-medium">Produto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Cód. Barras</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Qtd</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Vlr Unit.</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Subtotal</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Data/Hora</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Pagamento</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Operador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-800">{item.product_name}</td>
                          <td className="py-3 px-4 text-xs text-gray-500 font-mono">{item.product_barcode}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-700">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm text-right text-gray-700">{formatMoney(item.unit_price)}</td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-gray-800">{formatMoney(item.subtotal)}</td>
                          <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{formatDate(item.created_at)}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {paymentLabels[item.payment_method] ?? item.payment_method}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{item.user_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cards mobile — Vendas */}
              <div className="lg:hidden space-y-3">
                {sales.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-sm font-bold text-gray-800">{formatMoney(item.subtotal)}</p>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">{item.product_barcode}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{item.quantity} × {formatMoney(item.unit_price)} · {paymentLabels[item.payment_method] ?? item.payment_method}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{item.user_name}</p>
                  </div>
                ))}
              </div>

              {/* Totalizador — Vendas */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-wrap gap-6 text-sm no-print">
                <span className="text-gray-500">
                  <span className="font-semibold text-[#2D2D2D]">{sales.length}</span> item{sales.length !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-500">
                  Total de unidades: <span className="font-semibold text-[#2D2D2D]">{totalSaleQty}</span>
                </span>
                <span className="text-gray-500">
                  Valor total: <span className="font-semibold text-[#22C55E]">{formatMoney(totalSaleValue)}</span>
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
