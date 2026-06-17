import * as XLSX from 'xlsx'
import type { Sale, Movement, EntryReportItem, SaleReportItem, ServiceReportItem } from '@/app/types'

export function exportHistoricoToExcel(items: Array<{ kind: string; data: any }>) {
  const rows = items.map(item => {
    if (item.kind === 'entrada') {
      const m = item.data as Movement
      return {
        'Data':       new Date(m.created_at).toLocaleString('pt-BR'),
        'Tipo':       'Entrada',
        'Produto':    m.product?.name ?? '—',
        'Código':     m.product?.barcode ?? '—',
        'Quantidade': m.quantity,
        'Valor':      '—',
        'Operador':   m.user?.name ?? '—',
        'Observação': m.notes ?? '—',
      }
    } else {
      const s = item.data as Sale
      return {
        'Data':       new Date(s.created_at).toLocaleString('pt-BR'),
        'Tipo':       'Venda',
        'Produto':    s.items?.map(i => i.product?.name).join(', ') ?? '—',
        'Quantidade': s.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0,
        'Valor':      Number(s.total).toFixed(2),
        'Pagamento':  s.payment_method,
        'Status':     s.status === 'pendente' ? 'fiado' : s.status,
        'Cliente':    s.customer_name ?? '—',
        'Operador':   s.user?.name ?? '—',
      }
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Histórico')
  ws['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 20 }))
  XLSX.writeFile(wb, `historico-renovat-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export function exportSaleToExcel(sale: Sale) {
  const itens = (sale.items ?? []).map(i => ({
    'Tipo':           'Produto',
    'Descrição':      i.product?.name ?? '—',
    'Quantidade':     i.quantity,
    'Preço unitário': Number(i.unit_price).toFixed(2),
    'Subtotal':       Number(i.subtotal).toFixed(2),
  }))

  const servicos = (sale.services ?? []).map(s => ({
    'Tipo':           'Serviço',
    'Descrição':      s.service?.name ?? '—',
    'Quantidade':     s.quantity,
    'Preço unitário': Number(s.unit_price).toFixed(2),
    'Subtotal':       Number(s.subtotal).toFixed(2),
  }))

  const rows = [
    ...itens,
    ...servicos,
    {
      'Tipo': '',
      'Descrição': '',
      'Quantidade': '',
      'Preço unitário': 'TOTAL',
      'Subtotal': Number(sale.total).toFixed(2),
    },
  ]

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Venda')
  XLSX.writeFile(wb, `venda-${sale.id}-renovat.xlsx`)
}

export function exportHistoricoToPDF() {
  window.print()
}

export function exportEntriesToExcel(items: EntryReportItem[], date: string) {
  const rows = items.map(item => ({
    'Produto':    item.product_name,
    'Cód. Barras': item.product_barcode,
    'Quantidade': item.quantity,
    'Data/Hora':  new Date(item.created_at).toLocaleString('pt-BR'),
    'Operador':   item.user_name,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Entradas')
  ws['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 22 }))
  XLSX.writeFile(wb, `relatorio-entradas-${date}.xlsx`)
}

export function exportSalesToExcel(items: SaleReportItem[], date: string) {
  const paymentLabels: Record<string, string> = {
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    pix: 'PIX',
    fiado: 'Fiado',
  }

  const rows = items.map(item => ({
    'Venda #':      item.sale_id,
    'Produto':      item.product_name,
    'Cód. Barras':  item.product_barcode,
    'Quantidade':   item.quantity,
    'Vlr Unit.':    Number(item.unit_price).toFixed(2),
    'Subtotal':     Number(item.subtotal).toFixed(2),
    'Data/Hora':    new Date(item.created_at).toLocaleString('pt-BR'),
    'Pagamento':    paymentLabels[item.payment_method] ?? item.payment_method,
    'Operador':     item.user_name,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Vendas')
  ws['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 20 }))
  XLSX.writeFile(wb, `relatorio-vendas-${date}.xlsx`)
}

export function exportServicesToExcel(items: ServiceReportItem[], date: string) {
  const paymentLabels: Record<string, string> = {
    dinheiro: 'Dinheiro',
    cartao_credito: 'Cartão de Crédito',
    cartao_debito: 'Cartão de Débito',
    pix: 'PIX',
    fiado: 'Fiado',
  }
  const statusLabels: Record<string, string> = {
    pago: 'Pago',
    pendente: 'Pendente',
    cancelado: 'Cancelado',
  }

  const rows = items.map(item => ({
    'Venda #':    item.sale_id,
    'Serviço':    item.service_name,
    'Cliente':    item.customer_name ?? '—',
    'Quantidade': item.quantity,
    'Vlr Unit.':  Number(item.unit_price).toFixed(2),
    'Subtotal':   Number(item.subtotal).toFixed(2),
    'Pagamento':  paymentLabels[item.payment_method] ?? item.payment_method,
    'Data/Hora':  new Date(item.created_at).toLocaleString('pt-BR'),
    'Operador':   item.user_name,
    'Status':     statusLabels[item.status] ?? item.status,
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Serviços')
  ws['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 20 }))
  XLSX.writeFile(wb, `relatorio-servicos-${date}.xlsx`)
}

export function exportReportToPDF() {
  window.print()
}
