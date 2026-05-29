import { useState } from 'react';
import { Download, Filter, TrendingDown, TrendingUp } from 'lucide-react';
import { mockMovements } from '../data/mockData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Historico() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('');

  // Filtrar movimentos para operadores (apenas suas próprias movimentações)
  const movements =
    user?.role === 'OPERADOR'
      ? mockMovements.filter((m) => m.operator === user.name)
      : mockMovements;

  const filteredMovements = movements.filter((m) => {
    if (!filterType) return true;
    return m.type === filterType;
  });

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success(`Exportando relatório em ${format.toUpperCase()}...`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Histórico de Movimentações
          </h1>
          <p className="text-[#2D2D2D]/60">
            {filteredMovements.length} movimentação(ões) encontrada(s)
          </p>
        </div>
        {user?.role === 'ADM' && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white rounded-xl font-medium hover:bg-[#111111]/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 px-4 py-2 bg-[#22C55E] text-white rounded-xl font-medium hover:bg-[#22C55E]/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              Excel
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#2D2D2D]/60" />
          <h2 className="text-lg font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            Filtros
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[#2D2D2D]/60 text-sm mb-2">Tipo de Movimentação</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
            >
              <option value="">Todas</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SAIDA">Saídas</option>
            </select>
          </div>
          <div>
            <label className="block text-[#2D2D2D]/60 text-sm mb-2">Data Inicial</label>
            <input
              type="date"
              className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[#2D2D2D]/60 text-sm mb-2">Data Final</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#111111] text-white">
                <th className="px-6 py-4 text-left font-medium">Data</th>
                <th className="px-6 py-4 text-left font-medium">Produto</th>
                <th className="px-6 py-4 text-center font-medium">Tipo</th>
                <th className="px-6 py-4 text-center font-medium">Quantidade</th>
                <th className="px-6 py-4 text-left font-medium">Responsável</th>
                <th className="px-6 py-4 text-left font-medium">Observação</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movement, index) => (
                <tr
                  key={movement.id}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'
                  } hover:bg-[#F5F5F5] transition-colors`}
                >
                  <td className="px-6 py-4 text-[#2D2D2D]/60">
                    {format(new Date(movement.date), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </td>
                  <td className="px-6 py-4 font-medium text-[#2D2D2D]">
                    {movement.productName}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium ${
                        movement.type === 'ENTRADA'
                          ? 'bg-[#22C55E]/10 text-[#22C55E]'
                          : 'bg-[#F97316]/10 text-[#F97316]'
                      }`}
                    >
                      {movement.type === 'ENTRADA' ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-lg font-['Barlow_Condensed'] font-bold ${
                        movement.type === 'ENTRADA' ? 'text-[#22C55E]' : 'text-[#F97316]'
                      }`}
                    >
                      {movement.type === 'ENTRADA' ? '+' : '-'}
                      {movement.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#2D2D2D]">{movement.operator}</td>
                  <td className="px-6 py-4 text-[#2D2D2D]/60 text-sm">
                    {movement.notes || movement.supplier || movement.client || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredMovements.map((movement) => (
          <div key={movement.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#2D2D2D] mb-1">{movement.productName}</p>
                <p className="text-xs text-[#2D2D2D]/60">
                  {format(new Date(movement.date), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium text-sm ${
                  movement.type === 'ENTRADA'
                    ? 'bg-[#22C55E]/10 text-[#22C55E]'
                    : 'bg-[#F97316]/10 text-[#F97316]'
                }`}
              >
                {movement.type === 'ENTRADA' ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {movement.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F5F5F5] rounded-xl mb-3">
              <div>
                <p className="text-xs text-[#2D2D2D]/60 mb-1">Quantidade</p>
                <p
                  className={`text-xl font-['Barlow_Condensed'] font-bold ${
                    movement.type === 'ENTRADA' ? 'text-[#22C55E]' : 'text-[#F97316]'
                  }`}
                >
                  {movement.type === 'ENTRADA' ? '+' : '-'}
                  {movement.quantity}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#2D2D2D]/60 mb-1">Responsável</p>
                <p className="text-sm font-medium text-[#2D2D2D]">{movement.operator}</p>
              </div>
            </div>

            {(movement.notes || movement.supplier || movement.client) && (
              <p className="text-sm text-[#2D2D2D]/60">
                {movement.notes || movement.supplier || movement.client}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMovements.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-10 h-10 text-[#2D2D2D]/40" />
          </div>
          <h3 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Nenhuma movimentação encontrada
          </h3>
          <p className="text-[#2D2D2D]/60">Tente ajustar os filtros de busca</p>
        </div>
      )}
    </div>
  );
}
