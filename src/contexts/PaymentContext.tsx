
import React, { useState, createContext, useCallback } from 'react';
import { Transaction } from '../types/payment';

interface PaymentContextType {
  processPayment: (paymentDetails: {
    amount: number;
    method: string;
    plan?: string;
  }) => Promise<boolean>;
  paymentHistory: Transaction[];
  fetchTransactions: () => Promise<void>;
}

export const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [paymentHistory, setPaymentHistory] = useState<Transaction[]>([]);

  const fetchTransactions = useCallback(async () => {
    // Simulation d'un appel API pour récupérer les transactions
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Si l'historique est vide, on peut pré-remplir avec des données fictives
        if (paymentHistory.length === 0) {
          const mockTransactions: Transaction[] = [
            {
              id: '1',
              date: new Date(Date.now() - 86400000 * 2),
              description: 'Recharge compte',
              amount: 50.00,
              method: 'card',
              status: 'completed',
              type: 'recharge'
            },
            {
              id: '2',
              date: new Date(Date.now() - 86400000 * 5),
              description: 'Abonnement Premium Mensuel',
              amount: 14.99,
              method: 'wallet',
              status: 'completed',
              type: 'subscription'
            }
          ];
          setPaymentHistory(mockTransactions);
        }
        resolve();
      }, 500);
    });
  }, [paymentHistory.length]);

  const processPayment = async (paymentDetails: {
    amount: number;
    method: string;
    plan?: string;
  }): Promise<boolean> => {
    try {
      console.log('Processing payment:', paymentDetails);
      const newPayment: Transaction = {
        id: Date.now().toString(),
        date: new Date(),
        description: paymentDetails.plan ? `Abonnement ${paymentDetails.plan}` : 'Recharge compte',
        amount: paymentDetails.amount,
        method: paymentDetails.method,
        status: 'completed',
        type: paymentDetails.plan ? 'subscription' : 'recharge'
      };
      setPaymentHistory((prev) => [newPayment, ...prev]);
      return true;
    } catch (error) {
      console.error('Payment error:', error);
      return false;
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        processPayment,
        paymentHistory,
        fetchTransactions
      }}>
      {children}
    </PaymentContext.Provider>
  );
};