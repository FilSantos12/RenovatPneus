import { useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers'
import { extractValidationErrors, getFirstError } from '@/lib/errors'
import { useAuth } from '@/app/contexts/AuthContext'
import type { User } from '@/app/types'
import type { UserPayload } from '@/services/user.service'

interface UserFormModalProps {
  user?: User
  onClose: () => void
}

export function UserFormModal({ user, onClose }: UserFormModalProps) {
  const isEditing = !!user
  const { user: authUser } = useAuth()
  const isOwnAccount = isEditing && user.id === authUser?.id

  const [form, setForm] = useState({
    name: user?.name ?? '',
    username: user?.username ?? '',
    password: '',
    password_confirmation: '',
    role: user?.role ?? ('operador' as 'adm' | 'operador'),
    active: user?.active ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser()
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser()
  const isPending = isCreating || isUpdating

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: [] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    try {
      if (isEditing) {
        const payload: { id: number } & Partial<UserPayload> = {
          id: user.id,
          name: form.name,
          username: form.username,
          role: form.role,
          active: form.active,
        }
        if (form.password) {
          payload.password = form.password
          payload.password_confirmation = form.password_confirmation
        }
        await updateUser(payload)
      } else {
        await createUser({
          name: form.name,
          username: form.username,
          password: form.password,
          password_confirmation: form.password_confirmation,
          role: form.role,
        })
      }
      onClose()
    } catch (error) {
      setErrors(extractValidationErrors(error))
    }
  }

  const inputClass =
    'w-full h-[52px] px-4 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#F97316] transition-colors'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-['Barlow_Condensed'] font-bold text-[#2D2D2D]">
            {isEditing ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#2D2D2D]/60 hover:text-[#2D2D2D] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <div>
            <label className="block text-[#2D2D2D] font-medium mb-2">Nome Completo *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              autoFocus
              placeholder="Ex: João da Silva"
              className={inputClass}
              required
            />
            {getFirstError(errors, 'name') && (
              <p className="text-[#EF4444] text-sm mt-1">{getFirstError(errors, 'name')}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-[#2D2D2D] font-medium mb-2">Nome de Usuário *</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                updateField('username', e.target.value.toLowerCase().replace(/\s/g, ''))
              }
              placeholder="Ex: joaosilva"
              className={inputClass}
              required
            />
            {getFirstError(errors, 'username') && (
              <p className="text-[#EF4444] text-sm mt-1">{getFirstError(errors, 'username')}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-[#2D2D2D] font-medium mb-2">
              Senha {!isEditing && '*'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder={isEditing ? 'Deixe em branco para manter a atual' : ''}
              className={inputClass}
              required={!isEditing}
            />
            {getFirstError(errors, 'password') && (
              <p className="text-[#EF4444] text-sm mt-1">{getFirstError(errors, 'password')}</p>
            )}
          </div>

          {/* Confirmar senha — aparece só quando senha tiver valor */}
          {form.password && (
            <div>
              <label className="block text-[#2D2D2D] font-medium mb-2">Confirmar Senha *</label>
              <input
                type="password"
                value={form.password_confirmation}
                onChange={(e) => updateField('password_confirmation', e.target.value)}
                placeholder="Repita a senha"
                className={inputClass}
                required
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-[#2D2D2D] font-medium mb-2">Nível de Acesso *</label>
            <select
              value={form.role}
              onChange={(e) => updateField('role', e.target.value as 'adm' | 'operador')}
              disabled={isOwnAccount}
              className={`${inputClass} ${isOwnAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="operador">OPERADOR</option>
              <option value="adm">ADM</option>
            </select>
            {isOwnAccount && (
              <p className="text-[#2D2D2D]/50 text-xs mt-1">
                Você não pode alterar o próprio nível de acesso.
              </p>
            )}
          </div>

          {/* Status — apenas na edição */}
          {isEditing && (
            <div className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-xl">
              <div>
                <p className="font-medium text-[#2D2D2D]">Status da conta</p>
                <p className="text-sm text-[#2D2D2D]/60">
                  {form.active
                    ? 'Ativa — usuário pode fazer login'
                    : 'Inativa — acesso bloqueado'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateField('active', !form.active)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  form.active ? 'bg-[#22C55E]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.active ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-[#2D2D2D] font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F97316] text-white font-medium hover:bg-[#F97316]/90 transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {isPending ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
