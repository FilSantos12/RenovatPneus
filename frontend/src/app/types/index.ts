export type UserRole = 'ADM' | 'OPERADOR';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  active: boolean;
}

export interface Product {
  id: string;
  code: string;
  description: string;
  size: string;
  brand: string;
  quantity: number;
  minQuantity: number;
  price?: number;
}

export type MovementType = 'ENTRADA' | 'SAIDA';

export interface Movement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  operator: string;
  notes?: string;
  supplier?: string;
  client?: string;
}

export interface StockStatus {
  total: number;
  entriesToday: number;
  exitsToday: number;
  lowStock: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  active: boolean;
}

export interface Sale {
  id: string;
  date: string;
  client: string;
  items: SaleItem[];
  services: SaleService[];
  subtotal: number;
  discount: number;
  total: number;
  operator: string;
  paymentMethod: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';
  status: 'CONCLUIDA' | 'CANCELADA';
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
