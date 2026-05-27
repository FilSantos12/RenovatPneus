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
