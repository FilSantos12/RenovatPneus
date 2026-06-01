import { Package, TrendingDown, TrendingUp, AlertTriangle, Plus, Minus, Scan, Printer, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';
import { useDashboard } from '@/hooks/useDashboard';
import { useMovements } from '@/hooks/useMovements';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: loadingSummary } = useDashboard();
  const { data: movementsData, isLoading: loadingMovements } = useMovements({ page: 1 });

  const movements = movementsData?.data ?? [];

  // Chart data for last 7 days
  const today = new Date();
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');

    const dayMovements = movements.filter(
      (m) => format(new Date(m.created_at), 'yyyy-MM-dd') === dateStr
    );

    const entries = dayMovements
      .filter((m) => m.type === 'entrada')
      .reduce((sum, m) => sum + m.quantity, 0);

    const exits = dayMovements
      .filter((m) => m.type === 'saida')
      .reduce((sum, m) => sum + m.quantity, 0);

    return {
      date: format(date, 'EEE', { locale: ptBR }),
      Entradas: entries,
      Saídas: exits,
    };
  });

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
        <p className="text-[#2D2D2D]/60">
          Bem-vindo, {user?.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#111111] rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Estoque Total</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            {summary?.total_stock ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Entradas Hoje</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#22C55E]">
            {summary?.entries_today ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#F97316] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Saídas Hoje</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#F97316]">
            {summary?.exits_today ?? 0}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#EF4444] rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Estoque Baixo</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#EF4444]">
            {summary?.low_stock_count ?? 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
          Atalhos Rápidos
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Link
            to="/entrada"
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
            <span className="text-sm font-medium text-center">Registrar Saída</span>
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
          Movimentações - Últimos 7 dias
        </h2>
        <div className="h-64">
          {loadingMovements ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[#F97316]" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#2D2D2D" />
                <YAxis stroke="#2D2D2D" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Entradas" fill="#22C55E" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Saídas" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
          Últimas Movimentações
        </h2>
        <div className="space-y-3">
          {movements.slice(0, 5).map((movement) => (
            <div
              key={movement.id}
              className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    movement.type === 'entrada'
                      ? 'bg-[#22C55E]/10 text-[#22C55E]'
                      : 'bg-[#F97316]/10 text-[#F97316]'
                  }`}
                >
                  {movement.type === 'entrada' ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#2D2D2D] truncate">
                    {movement.product.name}
                  </p>
                  <p className="text-sm text-[#2D2D2D]/60">
                    {format(new Date(movement.created_at), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p
                  className={`text-lg font-['Barlow_Condensed'] font-bold ${
                    movement.type === 'entrada' ? 'text-[#22C55E]' : 'text-[#F97316]'
                  }`}
                >
                  {movement.type === 'entrada' ? '+' : '-'}
                  {movement.quantity}
                </p>
                <p className="text-xs text-[#2D2D2D]/60">{movement.user.name}</p>
              </div>
            </div>
          ))}
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
