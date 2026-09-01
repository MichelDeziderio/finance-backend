import { MovementType, WalletType } from '../enums/finance.enums';

export interface CategoryResponse {
  id: string;
  walletId: string;
  name: string;
  type: MovementType;
  color: string;
  isDefault: boolean;
  defaultKey?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MovementResponse {
  id: string;
  walletId: string;
  type: MovementType;
  description: string;
  categoryId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedMovementsResponse {
  data: MovementResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WalletResponse {
  id: string;
  name: string;
  type: WalletType;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DeleteResponse {
  deleted: true;
}
