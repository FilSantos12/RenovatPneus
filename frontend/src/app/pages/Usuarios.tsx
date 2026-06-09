import { useState } from 'react';
import { Plus, Edit, UserX, UserCheck, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { useUsers, useToggleUserActive } from '@/hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import { UserFormModal } from '../components/Users/UserFormModal';
import type { User } from '../types';

export function Usuarios() {
  const { user: authUser } = useAuth();
  const [userParaEditar, setUserParaEditar] = useState<User | null>(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [confirmandoToggle, setConfirmandoToggle] = useState<number | null>(null);

  const { data, isLoading, isError } = useUsers();
  const users: User[] = data?.data ?? [];
  const toggleActive = useToggleUserActive();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-[#EF4444]">
        Erro ao carregar usuários. Tente novamente.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D] mb-2">
            Gerenciar Usuários
          </h1>
          <p className="text-[#2D2D2D]/60">{users.length} usuários cadastrados</p>
        </div>
        <button
          onClick={() => setModalCriarAberto(true)}
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
              <span className="font-['Barlow_Condensed'] font-bold text-lg text-[#111111]">ADM</span>
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
              <span className="font-['Barlow_Condensed'] font-bold text-lg text-[#F97316]">OPERADOR</span>
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
              {users.map((user, index) => (
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
                        user.role === 'adm'
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F97316] text-white'
                      }`}
                    >
                      {user.role.toUpperCase()}
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
                      <button
                        onClick={() => setUserParaEditar(user)}
                        className="p-2 text-[#2D2D2D]/60 hover:text-[#F97316] hover:bg-[#F97316]/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {user.id !== authUser?.id && (
                        confirmandoToggle === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                toggleActive.mutate(user.id)
                                setConfirmandoToggle(null)
                              }}
                              disabled={toggleActive.isPending}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmandoToggle(null)}
                              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmandoToggle(user.id)}
                            disabled={toggleActive.isPending}
                            className={`p-2 rounded-lg transition-colors ${
                              user.active
                                ? 'text-[#2D2D2D]/60 hover:text-[#EF4444] hover:bg-[#EF4444]/10'
                                : 'text-[#2D2D2D]/60 hover:text-[#22C55E] hover:bg-[#22C55E]/10'
                            }`}
                          >
                            {user.active ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                          </button>
                        )
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
        {users.map((user) => (
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
                    user.role === 'adm' ? 'bg-[#111111] text-white' : 'bg-[#F97316] text-white'
                  }`}
                >
                  {user.role.toUpperCase()}
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
              <button
                onClick={() => setUserParaEditar(user)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium hover:bg-[#F97316]/10 hover:text-[#F97316] transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              {user.id !== authUser?.id && (
                confirmandoToggle === user.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <button
                      onClick={() => {
                        toggleActive.mutate(user.id)
                        setConfirmandoToggle(null)
                      }}
                      disabled={toggleActive.isPending}
                      className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setConfirmandoToggle(null)}
                      className="flex-1 px-3 py-2 text-sm bg-[#F5F5F5] text-[#2D2D2D] rounded-xl hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmandoToggle(user.id)}
                    disabled={toggleActive.isPending}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#F5F5F5] text-[#2D2D2D] rounded-xl font-medium transition-colors disabled:opacity-50 ${
                      user.active
                        ? 'hover:bg-[#EF4444]/10 hover:text-[#EF4444]'
                        : 'hover:bg-[#22C55E]/10 hover:text-[#22C55E]'
                    }`}
                  >
                    {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    {user.active ? 'Desativar' : 'Ativar'}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {(modalCriarAberto || userParaEditar) && (
        <UserFormModal
          user={userParaEditar ?? undefined}
          onClose={() => {
            setModalCriarAberto(false)
            setUserParaEditar(null)
          }}
        />
      )}
    </div>
  );
}
