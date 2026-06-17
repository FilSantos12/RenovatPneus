export type UserRole = 'adm' | 'operador'

export interface User {
  id: number
  name: string
  username: string
  role: UserRole
  active: boolean
  created_at?: string
}

export interface Product {
  id: number
  name: string
  barcode: string
  description?: string
  brand: string
  size: string
  price_cost?: number
  price_sale: number
  quantity: number
  min_stock: number
  low_stock: boolean
  active: boolean
}

export type MovementType = 'entrada' | 'saida'

export interface Movement {
  id: number
  type: MovementType
  quantity: number
  notes?: string
  product: {
    id: number
    name: string
    barcode?: string
  }
  user: {
    id: number
    name: string
  }
  created_at: string
}

export type SaleStatus = 'pendente' | 'pago' | 'cancelado'
export type PaymentMethod = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'fiado'

export interface SaleItem {
  id: number
  product: {
    id: number
    name: string
  }
  quantity: number
  unit_price: number
  subtotal: number
}

export interface SaleService {
  id: number
  service: {
    id: number
    name: string
  }
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Sale {
  id: number
  customer_name?: string
  status: SaleStatus
  payment_method: PaymentMethod
  total: number
  notes?: string
  paid_at?: string
  user: {
    id: number
    name: string
  }
  items: SaleItem[]
  services: SaleService[]
  created_at: string
}

export interface Service {
  id: number
  name: string
  description?: string
  price: number
  price_cost?: number
  active: boolean
}

export interface ChartDay {
  date: string
  entries: number
  exits: number
  services: number
}

export interface EntryReportItem {
  id: number
  product_name: string
  product_barcode: string
  quantity: number
  created_at: string
  user_name: string
}

export interface SaleReportItem {
  sale_id: number
  product_name: string
  product_barcode: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  payment_method: PaymentMethod
  user_name: string
}

export interface ServiceReportItem {
  sale_id: number
  service_name: string
  customer_name: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  payment_method: PaymentMethod
  user_name: string
  status: SaleStatus
}

export interface DashboardSummary {
  total_products: number
  total_stock: number
  low_stock_count: number
  movements_today: number
  entries_today: number
  exits_today: number
  sales_today: number
  services_today: number
  revenue_today: number
  low_stock_products: Product[]
  chart: {
    last_7_days: ChartDay[]
  }
}
