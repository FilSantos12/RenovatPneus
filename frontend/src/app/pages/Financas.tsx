import { useState } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, BarChart2, Wrench } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useFinanceSummary } from '@/hooks/useFinance'
import type { FinancePeriod } from '@/services/finance.service'

const formatMoney = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </div>
  )
}

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Crédito',
  cartao_debito: 'Débito',
  fiado: 'Fiado',
}

const PAYMENT_COLORS: Record<string, string> = {
  pix: '#3b82f6',
  dinheiro: '#22C55E',
  cartao_credito: '#a855f7',
  cartao_debito: '#8b5cf6',
  fiado: '#EF4444',
}

const STATUS_STYLE: Record<string, string> = {
  pago: 'bg-green-100 text-green-800',
  pendente: 'bg-yellow-100 text-yellow-800',
  cancelado: 'bg-gray-100 text-gray-600',
}

const STATUS_LABEL: Record<string, string> = {
  pago: 'pago',
  pendente: 'pendente',
  cancelado: 'cancelado',
}

const PERIODS: { value: FinancePeriod; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'month', label: 'Este mês' },
  { value: 'year', label: 'Este ano' },
]

export function Financas() {
  const [period, setPeriod] = useState<FinancePeriod>('month')
  const { data, isLoading } = useFinanceSummary(period)

  const paymentData = data
    ? Object.entries(data.payment_methods).map(([key, val]) => ({
        name: PAYMENT_LABELS[key] ?? key,
        value: Number(val.total),
        color: PAYMENT_COLORS[key] ?? '#9ca3af',
      }))
    : []

  const isEmpty = !isLoading && data !== undefined && data.recent_sales.length === 0

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
          Finanças
        </h1>
        <div className="flex gap-2">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              style={{
                minHeight: '48px',
                borderRadius: '12px',
                background: period === value ? '#F97316' : 'white',
                color: period === value ? 'white' : '#6b7280',
                border: '0.5px solid #e5e7eb',
              }}
              className="px-4 font-medium transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Fiado alert */}
      {data && data.fiado_count > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#F97316' }} />
          <p className="text-sm" style={{ color: '#9a3412' }}>
            <strong>{data.fiado_count}</strong>{' '}
            venda{data.fiado_count !== 1 ? 's' : ''} no fiado em aberto —{' '}
            {formatMoney(Number(data.fiado_total))} a receber
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          </>
        ) : (
          <>
            {/* Receita */}
            <div
              className="bg-white flex overflow-hidden"
              style={{ borderRadius: '16px', border: '0.5px solid #e5e7eb' }}
            >
              <div className="w-1 flex-shrink-0" style={{ background: '#22C55E' }} />
              <div className="flex-1 px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#dcfce7' }}
                  >
                    <TrendingUp className="w-5 h-5" style={{ color: '#22C55E' }} />
                  </div>
                  <p className="text-xs text-gray-500">Receita total</p>
                </div>
                <p className="font-medium" style={{ fontSize: '22px', color: '#2D2D2D' }}>
                  {formatMoney(Number(data?.revenue ?? 0))}
                </p>
              </div>
            </div>

            {/* Custo dos Produtos */}
            <div
              className="bg-white flex overflow-hidden"
              style={{ borderRadius: '16px', border: '0.5px solid #e5e7eb' }}
            >
              <div className="w-1 flex-shrink-0" style={{ background: '#EF4444' }} />
              <div className="flex-1 px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#fee2e2' }}
                  >
                    <TrendingDown className="w-5 h-5" style={{ color: '#EF4444' }} />
                  </div>
                  <p className="text-xs text-gray-500">Custo dos produtos</p>
                </div>
                <p className="font-medium" style={{ fontSize: '22px', color: '#2D2D2D' }}>
                  {formatMoney(Number(data?.cost ?? 0))}
                </p>
                <p className="text-xs text-gray-400 mt-1">Preço de custo dos itens vendidos</p>
              </div>
            </div>

            {/* Custo dos Serviços */}
            <div
              className="bg-white flex overflow-hidden"
              style={{ borderRadius: '16px', border: '0.5px solid #e5e7eb' }}
            >
              <div className="w-1 flex-shrink-0" style={{ background: '#6366f1' }} />
              <div className="flex-1 px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#eef2ff' }}
                  >
                    <Wrench className="w-5 h-5" style={{ color: '#6366f1' }} />
                  </div>
                  <p className="text-xs text-gray-500">Custo dos serviços</p>
                </div>
                <p className="font-medium" style={{ fontSize: '22px', color: '#2D2D2D' }}>
                  {formatMoney(Number(data?.service_cost ?? 0))}
                </p>
                <p className="text-xs text-gray-400 mt-1">Custo de execução dos serviços</p>
              </div>
            </div>

            {/* Lucro — Receita - Custo Produtos - Custo Serviços */}
            <div
              className="bg-white flex overflow-hidden"
              style={{ borderRadius: '16px', border: '0.5px solid #e5e7eb' }}
            >
              <div className="w-1 flex-shrink-0" style={{ background: '#F97316' }} />
              <div className="flex-1 px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: '#fff7ed' }}
                  >
                    <DollarSign className="w-5 h-5" style={{ color: '#F97316' }} />
                  </div>
                  <p className="text-xs text-gray-500">Lucro estimado</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium" style={{ fontSize: '22px', color: '#2D2D2D' }}>
                    {formatMoney(Number(data?.profit ?? 0))}
                  </p>
                  {data && data.margin > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                      Margem: {data.margin}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16 text-gray-400">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma venda registrada neste período.</p>
        </div>
      )}

      {/* Bar chart — Receita × Custo × Lucro */}
      {!isEmpty && (
        <div
          className="bg-white px-6 py-5"
          style={{ borderRadius: '16px', border: '0.5px solid #e5e7eb' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
              Receita × Custo × Lucro
            </h2>
            <div className="flex gap-4">
              <LegendDot color="#22C55E" label="Receita" />
              <LegendDot color="#EF4444" label="Custo" />
              <LegendDot color="#F97316" label="Lucro" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-52 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.series ?? []} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatMoney(value)}
                  contentStyle={{ borderRadius: 8, border: '0.5px solid #e5e7eb', fontSize: 12 }}
                />
                <Bar dataKey="revenue" name="Receita" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Custo" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Lucro" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Bottom row: donut + recent sales */}
      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut — formas de pagamento */}
          <div
            className="bg-white px-6 py-5"
            style={{ borderRadius: '16px', border: '0.5px solid #e5e7eb' }}
          >
            <h2 className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D] mb-4">
              Formas de pagamento
            </h2>
            {isLoading ? (
              <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
            ) : paymentData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-sm text-gray-400">
                Nenhum pagamento registrado
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatMoney(value)}
                      contentStyle={{ borderRadius: 8, border: '0.5px solid #e5e7eb', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2">
                  {paymentData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1 text-xs text-gray-500">
                      <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
                      {item.name}{' '}
                      {data && data.revenue > 0
                        ? `${((item.value / Number(data.revenue)) * 100).toFixed(0)}%`
                        : ''}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent sales */}
          <div
            className="bg-white px-6 py-5"
            style={{ borderRadius: '16px', border: '0.5px solid #e5e7eb' }}
          >
            <h2 className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D] mb-4">
              Últimas vendas
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !data?.recent_sales?.length ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Nenhuma venda no período
              </div>
            ) : (
              <div>
                {data.recent_sales.map((sale, idx) => (
                  <div
                    key={sale.id}
                    className={`py-3 ${idx < data.recent_sales.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[#2D2D2D] leading-snug">
                        {sale.description}
                      </p>
                      <p className="text-sm font-['Barlow_Condensed'] font-bold text-[#22C55E] flex-shrink-0">
                        {formatMoney(Number(sale.total))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">
                        {sale.created_at}
                        {sale.user_name ? ` · ${sale.user_name}` : ''}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[sale.status] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_LABEL[sale.status] ?? sale.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
