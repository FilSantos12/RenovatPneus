import { Package, TrendingDown, TrendingUp, AlertTriangle, Plus, Minus, Scan, Printer, Eye, Loader2, Wrench } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router';
import { useDashboard } from '@/hooks/useDashboard';
import { useMovements } from '@/hooks/useMovements';
import { useSales } from '@/hooks/useSales';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: summary, isLoading: loadingSummary } = useDashboard();
  const { data: movementsData, isLoading: loadingMovements } = useMovements({ page: 1 });
  const { data: salesData, isLoading: loadingSales } = useSales({ page: 1 });

  const movements = movementsData?.data ?? [];
  const sales = salesData?.data ?? [];

  // Chart data — built from backend-aggregated series (avoids pagination truncation and uses BRT timezone)
  const chartData = (summary?.chart?.last_7_days ?? []).map((day) => ({
    date: format(new Date(day.date + 'T00:00:00'), 'EEE', { locale: ptBR }),
    Entradas: day.entries,
    Vendas: day.exits,
    Serviços: day.services,
  }));

  // Unified activity feed — movements + service sales merged by date
  type ActivityItem = {
    id: string
    kind: 'entrada' | 'saida' | 'servico'
    title: string
    date: string
    quantity: number
    user: string
  }

  const movementItems: ActivityItem[] = movements.map((m) => ({
    id: `mov-${m.id}`,
    kind: m.type,
    title: m.product.name,
    date: m.created_at,
    quantity: m.quantity,
    user: m.user.name,
  }))

  const serviceItems: ActivityItem[] = sales
    .filter((s) => s.services.length > 0)
    .map((s) => {
      const totalQty = s.services.reduce((sum, sv) => sum + sv.quantity, 0)
      const names = s.services.map((sv) => sv.service.name)
      const title =
        names.length === 1
          ? names[0]
          : `${names[0]} + ${names.length - 1} ${names.length - 1 === 1 ? 'outro' : 'outros'}`
      return {
        id: `sale-${s.id}`,
        kind: 'servico' as const,
        title,
        date: s.created_at,
        quantity: totalQty,
        user: s.user.name,
      }
    })

  const recentActivities = [...movementItems, ...serviceItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  if (loadingSummary) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
          Dashboard
        </h1>
        <p className="text-[#2D2D2D]/60">Bem-vindo, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => navigate('/estoque')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:border-[#111111] hover:shadow-md transition-all group"
        >
          <div className="mb-4">
            <div className="w-12 h-12 bg-[#111111] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Estoque total de produtos</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            {summary?.total_stock ?? 0}
          </p>
        </button>

        <button
          onClick={() => navigate('/estoque', { state: { openModal: true } })}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:border-[#22C55E] hover:shadow-md transition-all group"
        >
          <div className="mb-4">
            <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Entrada no Estoque</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#22C55E]">
            {summary?.entries_today ?? 0}
          </p>
        </button>

        <button
          onClick={() => navigate('/saida')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:border-[#F97316] hover:shadow-md transition-all group"
        >
          <div className="mb-4">
            <div className="w-12 h-12 bg-[#F97316] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Vendas Pneus hoje</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#F97316]">
            {summary?.sales_today ?? 0}
          </p>
        </button>

        <button
          onClick={() => navigate('/servicos')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:border-[#2D2D2D] hover:shadow-md transition-all group"
        >
          <div className="mb-4">
            <div className="w-12 h-12 bg-[#2D2D2D] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Serviços executados hoje</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            {summary?.services_today ?? 0}
          </p>
        </button>

        <button
          onClick={() => navigate('/estoque')}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left hover:border-[#EF4444] hover:shadow-md transition-all group"
        >
          <div className="mb-4">
            <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Estoque baixo de produtos</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#EF4444]">
            {summary?.low_stock_count ?? 0}
          </p>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
          Atalhos Rápidos
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Link
            to="/estoque"
            state={{ openModal: true }}
            className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-white transition-all group"
          >
            <div className="w-12 h-12 bg-[#22C55E]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-center">Registrar Entrada</span>
          </Link>

          <Link
            to="/saida"
            className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all group"
          >
            <div className="w-12 h-12 bg-[#EF4444]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <Minus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-center">Registrar Venda</span>
          </Link>

          <Link
            to="/scanner"
            className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white transition-all group"
          >
            <div className="w-12 h-12 bg-[#F97316]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <Scan className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-center">Ler Código de Barras</span>
          </Link>

          <Link
            to="/etiquetas"
            className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-all group"
          >
            <div className="w-12 h-12 bg-[#111111]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <Printer className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-center">Imprimir Etiqueta</span>
          </Link>

          <Link
            to="/estoque"
            className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white transition-all group"
          >
            <div className="w-12 h-12 bg-[#2D2D2D]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <Eye className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-center">Ver Estoque</span>
          </Link>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-6">
          Movimentações — Últimos 7 dias
        </h2>
        <div className="h-64">
          {loadingSummary ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#2D2D2D" />
                <YAxis stroke="#2D2D2D" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Entradas" fill="#22C55E" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Vendas" fill="#F97316" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Serviços" fill="#111111" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
          Últimas Movimentações
        </h2>
        <div className="space-y-3">
          {loadingMovements || loadingSales ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
            </div>
          ) : recentActivities.length === 0 ? (
            <p className="text-center text-[#2D2D2D]/40 py-8">Nenhuma atividade recente.</p>
          ) : (
            recentActivities.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.kind === 'entrada'
                        ? 'bg-[#22C55E]/10 text-[#22C55E]'
                        : item.kind === 'saida'
                        ? 'bg-[#F97316]/10 text-[#F97316]'
                        : 'bg-[#111111]/10 text-[#2D2D2D]'
                    }`}
                  >
                    {item.kind === 'entrada' ? (
                      <TrendingDown className="w-5 h-5" />
                    ) : item.kind === 'saida' ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <Wrench className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#2D2D2D] truncate">{item.title}</p>
                    <p className="text-sm text-[#2D2D2D]/60">
                      {format(new Date(item.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p
                    className={`text-lg font-['Barlow_Condensed'] font-bold ${
                      item.kind === 'entrada'
                        ? 'text-[#22C55E]'
                        : item.kind === 'saida'
                        ? 'text-[#F97316]'
                        : 'text-[#2D2D2D]'
                    }`}
                  >
                    {item.kind === 'entrada' ? '+' : item.kind === 'saida' ? '-' : ''}
                    {item.quantity}
                    {item.kind === 'servico' && (
                      <span className="text-sm font-normal ml-1">
                        {item.quantity === 1 ? 'serviço' : 'serviços'}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[#2D2D2D]/60">{item.user}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <Link
          to="/historico"
          className="block mt-4 text-center py-3 text-[#F97316] font-medium hover:bg-[#F97316]/5 rounded-xl transition-colors"
        >
          Ver todo o histórico →
        </Link>
      </div>
    </div>
  );
}
