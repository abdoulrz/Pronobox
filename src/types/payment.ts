
export type PaymentType = 'recharge' | 'withdrawal' | 'subscription' | 'product';

export type PaymentMethod = 'card' | 'mobile' | 'crypto' | 'wallet';

export interface PaymentDetails {
  amount: number;
  description: string;
  type: PaymentType;
  itemName?: string;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  type: PaymentType;
}
