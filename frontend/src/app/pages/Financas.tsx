import { DollarSign, TrendingUp, ShoppingCart, CreditCard, Calendar, Filter, Download } from 'lucide-react';
import { mockSales } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export function Financas() {
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');

  const today = new Date();

  // Filter sales by period
  const getFilteredSales = () => {
    const now = Date.now();
    switch (filterPeriod) {
      case 'today':
        return mockSales.filter(s => {
          const saleDate = new Date(s.date);
          return format(saleDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        });
      case 'week':
        return mockSales.filter(s => new Date(s.date).getTime() >= now - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return mockSales.filter(s => new Date(s.date).getTime() >= now - 30 * 24 * 60 * 60 * 1000);
      case 'all':
      default:
        return mockSales;
    }
  };

  const filteredSales = getFilteredSales();

  // Calculate stats
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalSales = filteredSales.length;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  const totalProducts = filteredSales.reduce((sum, s) =>
    sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const totalServices = filteredSales.reduce((sum, s) =>
    sum + s.services.reduce((serviceSum, service) => serviceSum + service.quantity, 0), 0
  );

  // Revenue by payment method
  const paymentMethodData = [
    {
      name: 'PIX',
      value: filteredSales.filter(s => s.paymentMethod === 'PIX').reduce((sum, s) => sum + s.total, 0),
      color: '#10B981'
    },
    {
      name: 'Dinheiro',
      value: filteredSales.filter(s => s.paymentMethod === 'DINHEIRO').reduce((sum, s) => sum + s.total, 0),
      color: '#22C55E'
    },
    {
      name: 'C. Crédito',
      value: filteredSales.filter(s => s.paymentMethod === 'CARTAO_CREDITO').reduce((sum, s) => sum + s.total, 0),
      color: '#F97316'
    },
    {
      name: 'C. Débito',
      value: filteredSales.filter(s => s.paymentMethod === 'CARTAO_DEBITO').reduce((sum, s) => sum + s.total, 0),
      color: '#EF4444'
    },
  ].filter(item => item.value > 0);

  // Daily revenue chart (last 7 days)
  const dailyRevenueData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');

    const daySales = mockSales.filter(s => format(new Date(s.date), 'yyyy-MM-dd') === dateStr);
    const revenue = daySales.reduce((sum, s) => sum + s.total, 0);

    return {
      date: format(date, 'EEE', { locale: ptBR }),
      Receita: revenue,
    };
  });

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'PIX': return 'PIX';
      case 'DINHEIRO': return 'Dinheiro';
      case 'CARTAO_CREDITO': return 'Cartão de Crédito';
      case 'CARTAO_DEBITO': return 'Cartão de Débito';
      default: return method;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Finanças
          </h1>
          <p className="text-[#2D2D2D]/60">
            Acompanhe as vendas e receitas
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterPeriod === 'today'
                ? 'bg-[#F97316] text-white'
                : 'bg-white text-[#2D2D2D] hover:bg-gray-100'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setFilterPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterPeriod === 'week'
                ? 'bg-[#F97316] text-white'
                : 'bg-white text-[#2D2D2D] hover:bg-gray-100'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setFilterPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterPeriod === 'month'
                ? 'bg-[#F97316] text-white'
                : 'bg-white text-[#2D2D2D] hover:bg-gray-100'
            }`}
          >
            30 dias
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterPeriod === 'all'
                ? 'bg-[#F97316] text-white'
                : 'bg-white text-[#2D2D2D] hover:bg-gray-100'
            }`}
          >
            Tudo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Receita Total</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#22C55E]">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#F97316] rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Total de Vendas</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            {totalSales}
          </p>
        </div>

        {/* Average Ticket */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#111111] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Ticket Médio</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            R$ {averageTicket.toFixed(2)}
          </p>
        </div>

        {/* Products + Services */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-[#2D2D2D]/60 text-sm mb-1">Produtos / Serviços</p>
          <p className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            {totalProducts} / {totalServices}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-6">
            Receita - Últimos 7 dias
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#2D2D2D" />
                <YAxis stroke="#2D2D2D" />
                <Tooltip
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Legend />
                <Bar dataKey="Receita" fill="#22C55E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-6">
            Formas de Pagamento
          </h2>
          {paymentMethodData.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-[#2D2D2D]/40">
              Nenhuma venda no período
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            Vendas Recentes
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 text-[#F97316] hover:bg-[#F97316]/5 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-[#2D2D2D]/60 font-medium text-sm">Data</th>
                <th className="text-left py-3 px-4 text-[#2D2D2D]/60 font-medium text-sm">Cliente</th>
                <th className="text-left py-3 px-4 text-[#2D2D2D]/60 font-medium text-sm">Itens</th>
                <th className="text-left py-3 px-4 text-[#2D2D2D]/60 font-medium text-sm">Pagamento</th>
                <th className="text-left py-3 px-4 text-[#2D2D2D]/60 font-medium text-sm">Operador</th>
                <th className="text-right py-3 px-4 text-[#2D2D2D]/60 font-medium text-sm">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#2D2D2D]/40">
                    Nenhuma venda encontrada no período selecionado
                  </td>
                </tr>
              ) : (
                filteredSales.slice(0, 10).map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-100 hover:bg-[#F5F5F5] transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-[#2D2D2D] font-medium">
                        {format(new Date(sale.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      <p className="text-sm text-[#2D2D2D]/60">
                        {format(new Date(sale.date), 'HH:mm', { locale: ptBR })}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-[#2D2D2D]">{sale.client}</td>
                    <td className="py-4 px-4">
                      <p className="text-[#2D2D2D]">
                        {sale.items.length} produto(s)
                      </p>
                      <p className="text-sm text-[#2D2D2D]/60">
                        {sale.services.length} serviço(s)
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-1 bg-[#F5F5F5] rounded text-xs font-medium text-[#2D2D2D]">
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#2D2D2D]/60">{sale.operator}</td>
                    <td className="py-4 px-4 text-right">
                      <p className="text-[#22C55E] font-['Barlow_Condensed'] font-bold text-lg">
                        R$ {sale.total.toFixed(2)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
