export function saleStatusLabel(status: string, paymentMethod: string): string {
  if (status === 'cancelado') return 'cancelado'
  if (status === 'pago')      return 'pago'
  return paymentMethod === 'fiado' ? 'fiado' : 'pendente'
}
