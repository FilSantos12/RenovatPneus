import { useRef, useState } from 'react'
import { X, Printer, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { exportSaleToExcel } from '@/lib/export'
import { saleStatusLabel } from '@/lib/saleStatus'
import { useUpdateSaleStatus, useDeleteSale } from '@/hooks/useSales'
import { useDeleteMovement } from '@/hooks/useMovements'
import { useAuth } from '@/app/contexts/AuthContext'
import type { Movement, Sale } from '@/app/types'

export type HistoricoItem =
  | { kind: 'entrada'; data: Movement }
  | { kind: 'venda'; data: Sale }

interface Props {
  item: HistoricoItem
  onClose: () => void
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const formatMoney = (value: number) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const PAYMENT_LABEL: Record<string, string> = {
  pix:            'Pix',
  dinheiro:       'Dinheiro',
  cartao_credito: 'Cartão de crédito',
  cartao_debito:  'Cartão de débito',
  fiado:          'Fiado',
}

const STATUS_STYLE: Record<string, string> = {
  pago:      'bg-green-100 text-green-800',
  pendente:  'bg-yellow-100 text-yellow-800',
  cancelado: 'bg-gray-100 text-gray-600',
}


function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

export function HistoricoDetalheModal({ item, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef: printRef })

  const isVenda = item.kind === 'venda'
  const sale    = isVenda ? (item.data as Sale) : null
  const entrada = !isVenda ? (item.data as Movement) : null

  const [confirmando, setConfirmando] = useState(false)
  const [erroMsg, setErroMsg]         = useState<string | null>(null)
  const updateStatus = useUpdateSaleStatus()
  const { user } = useAuth()
  const deleteSale = useDeleteSale()
  const deleteMovement = useDeleteMovement()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const showQuitar =
    isVenda && sale !== null &&
    sale.status === 'pendente' &&
    sale.payment_method === 'fiado'

  const handleQuitar = () => {
    if (!sale) return
    setErroMsg(null)
    updateStatus.mutate(
      { id: sale.id, status: 'pago' },
      {
        onSuccess: () => onClose(),
        onError: (error: unknown) => {
          setConfirmando(false)
          const httpError = error as { response?: { status?: number } }
          setErroMsg(
            httpError?.response?.status === 403
              ? 'Você não tem permissão para quitar esta venda.'
              : 'Erro ao quitar o fiado. Tente novamente.'
          )
        },
      }
    )
  }

  const handleDelete = async () => {
    try {
      if (isVenda && sale) {
        await deleteSale.mutateAsync(sale.id)
      } else if (!isVenda && entrada) {
        await deleteMovement.mutateAsync(entrada.id)
      }
      onClose()
    } catch {
      // erro tratado no onError do hook
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-medium text-gray-900">
              {isVenda ? 'Detalhes da venda' : 'Detalhes da entrada'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(item.data.created_at)} · {item.data.user?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Área imprimível (com scroll) */}
        <div ref={printRef} className="p-5 overflow-y-auto flex-1">

          {/* ── ENTRADA ── */}
          {entrada && (
            <div className="space-y-0">
              <Row label="Produto"    value={entrada.product?.name ?? '—'} />
              <Row label="Código"     value={entrada.product?.barcode ?? '—'} />
              <Row label="Quantidade" value={`${entrada.quantity} unidades`} />
              <Row label="Operador"   value={entrada.user?.name ?? '—'} />
              <Row label="Observação" value={entrada.notes || '—'} />
            </div>
          )}

          {/* ── VENDA ── */}
          {sale && (
            <div className="space-y-4">
              {/* Dados gerais */}
              <div className="space-y-0">
                <Row
                  label="Status"
                  value={
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[sale.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {saleStatusLabel(sale.status, sale.payment_method)}
                    </span>
                  }
                />
                <Row label="Pagamento" value={PAYMENT_LABEL[sale.payment_method] ?? sale.payment_method} />
                <Row label="Cliente"   value={sale.customer_name || 'Não informado'} />
                <Row label="Operador"  value={sale.user?.name ?? '—'} />
              </div>

              {/* Produtos */}
              {sale.items && sale.items.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Produtos
                  </p>
                  <div className="space-y-2">
                    {sale.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs text-gray-800">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity} un × {formatMoney(item.unit_price)}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-gray-800 ml-2">
                          {formatMoney(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Serviços */}
              {sale.services && sale.services.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    Serviços
                  </p>
                  <div className="space-y-2">
                    {sale.services.map((sv, i) => (
                      <div key={i} className="flex justify-between items-start bg-gray-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs text-gray-800">{sv.service?.name}</p>
                          <p className="text-xs text-gray-400">
                            {sv.quantity} × {formatMoney(sv.unit_price)}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-gray-800 ml-2">
                          {formatMoney(sv.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-800">Total</span>
                <span className="text-lg font-medium text-orange-500">
                  {formatMoney(sale.total)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
          {showQuitar && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {!confirmando ? (
                  <button
                    onClick={() => { setConfirmando(true); setErroMsg(null) }}
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Marcar como pago
                  </button>
                ) : (
                  <>
                    <span className="text-xs text-gray-600 font-medium">Confirmar?</span>
                    <button
                      onClick={handleQuitar}
                      disabled={updateStatus.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {updateStatus.isPending ? 'Quitando...' : 'Sim, quitar'}
                    </button>
                    <button
                      onClick={() => { setConfirmando(false); setErroMsg(null) }}
                      disabled={updateStatus.isPending}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      Não
                    </button>
                  </>
                )}
              </div>
              {erroMsg && <p className="text-xs text-red-600">{erroMsg}</p>}
            </div>
          )}
          {user?.role === 'adm' && (
            <div className="flex items-center gap-2">
              {!confirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Excluir
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteSale.isPending || deleteMovement.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(deleteSale.isPending || deleteMovement.isPending) ? 'Excluindo...' : 'Confirmar exclusão?'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleteSale.isPending || deleteMovement.isPending}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            {isVenda && sale && (
              <button
                onClick={() => exportSaleToExcel(sale)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <FileSpreadsheet size={14} /> Excel
              </button>
            )}
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#F97316] text-white hover:bg-orange-600 transition-colors"
            >
              <Printer size={14} />
              {isVenda ? 'Imprimir venda' : 'Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
