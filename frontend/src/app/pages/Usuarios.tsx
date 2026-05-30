import { useState } from 'react';
import { Plus, Edit, UserX, Shield, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { toast } from 'sonner';

export function Usuarios() {
  const [showForm, setShowForm] = useState(false);

  const mockUsers: User[] = [
    { id: '1', name: 'Administrador', username: 'admin', role: 'ADM', active: true },
    { id: '2', name: 'João Silva', username: 'joao', role: 'OPERADOR', active: true },
    { id: '3', name: 'Maria Santos', username: 'maria', role: 'OPERADOR', active: false },
  ];

  const handleDeactivate = (user: User) => {
    toast.success(`Usuário ${user.name} foi desativado`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Gerenciar Usuários
          </h1>
          <p className="text-[#2D2D2D]/60">{mockUsers.length} usuários cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#F97316]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Cadastrar Novo Usuário
        </button>
      </div>

      {/* Permissions Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-4">
          Níveis de Acesso
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#111111]/5 border border-[#111111] rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#111111] rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-['Barlow_Condensed'] font-bold text-lg text-[#111111]">
                ADM
              </span>
            </div>
            <p className="text-sm text-[#2D2D2D]/60 mb-2">Acesso total ao sistema:</p>
            <ul className="text-sm text-[#2D2D2D]/80 space-y-1">
              <li>✅ Gerenciar usuários e produtos</li>
              <li>✅ Ver relatórios completos</li>
              <li>✅ Exportar dados</li>
            </ul>
          </div>

          <div className="p-4 bg-[#F97316]/5 border border-[#F97316] rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#F97316] rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-['Barlow_Condensed'] font-bold text-lg text-[#F97316]">
                OPERADOR
              </span>
            </div>
            <p className="text-sm text-[#2D2D2D]/60 mb-2">Acesso operacional:</p>
            <ul className="text-sm text-[#2D2D2D]/80 space-y-1">
              <li>✅ Entradas e saídas</li>
              <li>✅ Ver estoque e gerar etiquetas</li>
              <li>❌ Não gerencia usuários</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#111111] text-white">
                <th className="px-6 py-4 text-left font-medium">Nome</th>
                <th className="px-6 py-4 text-left font-medium">Usuário</th>
                <th className="px-6 py-4 text-center font-medium">Nível</th>
                <th className="px-6 py-4 text-center font-medium">Status</th>
                <th className="px-6 py-4 text-center font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#F9F9F9]'
                  } hover:bg-[#F5F5F5] transition-colors`}
                >
                  <td className="px-6 py-4 font-medium text-[#2D2D2D]">{user.name}</td>
                  <td className="px-6 py-4 text-[#2D2D2D]/60">{user.username}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-lg font-medium text-sm ${
                        user.role === 'ADM'
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F97316] text-white'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-lg font-medium text-sm ${
                        user.active
                          ? 'bg-[#22C55E]/10 text-[#22C55E]'
                          : 'bg-[#EF4444]/10 text-[#EF4444]'
                      }`}
                    >
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 rounded-lg transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                      {user.active && (
                        <button
                          onClick={() => handleDeactivate(user)}
                          className="p-2 text-[#2D2D2D]/60 hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {mockUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-['Barlow_Condensed'] font-bold text-lg text-[#2D2D2D]">
                  {user.name}
                </p>
                <p className="text-sm text-[#2D2D2D]/60">@{user.username}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span
                  className={`inline-block px-3 py-1 rounded-lg font-medium text-sm ${
                    user.role === 'ADM'
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F97316] text-white'
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-lg font-medium text-sm ${
                    user.active
                      ? 'bg-[#22C55E]/10 text-[#22C55E]'
                      : 'bg-[#EF4444]/10 text-[#EF4444]'
                  }`}
                >
                  {user.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors">
                <Edit className="w-4 h-4" />
                Editar
              </button>
              {user.active && (
                <button
                  onClick={() => handleDeactivate(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-[#EF4444]/10 hover:text-[#EF4444] transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  Desativar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full my-8">
            <h3 className="text-xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-6">
              Cadastrar Novo Usuário
            </h3>

            <form className="space-y-4">
              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Nome de Usuário</label>
                <input
                  type="text"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Senha</label>
                <input
                  type="password"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2D2D2D] font-medium mb-2">Nível de Acesso</label>
                <select className="w-full h-12 px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors">
                  <option value="OPERADOR">OPERADOR</option>
                  <option value="ADM">ADM</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#F97316] text-white rounded-xl font-medium hover:bg-[#F97316]/90 transition-colors"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
