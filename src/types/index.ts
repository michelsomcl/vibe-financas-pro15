
export interface Account {
  id: string;
  name: string;
  type: 'banco' | 'dinheiro' | 'caixa' | 'cartao';
  initialBalance: number;
  currentBalance: number;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  createdAt: Date;
}

export interface ClientSupplier {
  id: string;
  name: string;
  type: 'cliente' | 'fornecedor';
  observations?: string;
  createdAt: Date;
}

export interface PayableAccount {
  id: string;
  supplierId: string;
  categoryId: string;
  value: number;
  dueDate: Date;
  observations?: string;
  installmentType: 'unico' | 'parcelado' | 'recorrente';
  installments?: number;
  recurrenceType?: 'diario' | 'semanal' | 'quinzenal' | 'mensal';
  recurrenceCount?: number;
  isPaid: boolean;
  paidDate?: Date;
  parentId?: string; // Para parcelas geradas automaticamente
  createdAt: Date;
}

export interface ReceivableAccount {
  id: string;
  clientId: string;
  categoryId: string;
  value: number;
  dueDate: Date;
  observations?: string;
  installmentType: 'unico' | 'parcelado' | 'recorrente';
  installments?: number;
  recurrenceType?: 'diario' | 'semanal' | 'quinzenal' | 'mensal';
  recurrenceCount?: number;
  isReceived: boolean;
  receivedDate?: Date;
  parentId?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  clientSupplierId: string;
  categoryId: string;
  value: number;
  paymentDate: Date;
  observations?: string;
  sourceType: 'manual' | 'payable' | 'receivable';
  sourceId?: string;
  createdAt: Date;
}
