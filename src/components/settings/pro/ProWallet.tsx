import React, { useState } from 'react';
import { useUserFeatures } from '../../../hooks/useUserFeatures';

interface ProWalletProps {
  user: any;
  updateUser: (updates: any) => Promise<void>;
}

export const ProWallet: React.FC<ProWalletProps> = ({ user, updateUser }) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalStatus, setWithdrawalStatus] = useState<{
    success: boolean;
    message: string;
    amount?: number;
    fees?: number;
    netAmount?: number;
    processingDays?: string;
  } | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<number>(50);
  const [showRechargeModal, setShowRechargeModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState<boolean>(false);
  
  const userFunctions = useUserFeatures(user);

  const handleRecharge = async () => {
    if (rechargeAmount < 10) {
      alert('Le montant minimum de recharge est de 10€');
      return;
    }
    setIsProcessingPayment(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const currentBalance = user?.walletBalance || 0;
    updateUser({
      walletBalance: currentBalance + rechargeAmount
    });
    setIsProcessingPayment(false);
    setShowRechargeModal(false);
    alert(`Votre compte a été rechargé de ${rechargeAmount}€ avec succès!`);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount < userFunctions.minWithdrawalAmount) {
      alert(`Le montant minimum de retrait est de ${userFunctions.minWithdrawalAmount}€`);
      return;
    }
    if (amount > (user?.walletBalance || 0)) {
      alert('Solde insuffisant pour effectuer ce retrait');
      return;
    }
    setIsProcessingWithdraw(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const currentBalance = user?.walletBalance || 0;
    updateUser({
      walletBalance: currentBalance - amount
    });
    
    const fees = amount * (userFunctions.withdrawalFeePercentage / 100);
    const netAmount = amount - fees;
    setIsProcessingWithdraw(false);
    setShowWithdrawModal(false);
    setWithdrawalAmount('');
    
    setWithdrawalStatus({
      success: true,
      message: `Votre demande de retrait a été traitée avec succès!`,
      amount,
      fees,
      netAmount,
      processingDays: '48h (jeudi et vendredi uniquement)'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 mb-6">
        Portefeuille
      </h3>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
        
        <div className="p-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
              Solde disponible
            </h4>
            <div className="text-5xl font-black text-white tracking-tight">
              {(user?.walletBalance || 0).toFixed(2)}<span className="text-3xl text-gray-400 ml-1">€</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Vous pouvez retirer jusqu'à {(user?.walletBalance || 0).toFixed(2)}€
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium backdrop-blur-md border border-white/10 transition-all shadow-lg flex items-center gap-2"
            >
              <span>➕</span> Recharger
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center gap-2"
            >
              <span>💸</span> Retirer
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {withdrawalStatus && (
        <div className={`p-4 rounded-xl border backdrop-blur-md ${withdrawalStatus.success ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300' : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'}`}>
          <div className="font-medium mb-1">{withdrawalStatus.message}</div>
          {withdrawalStatus.success && (
            <ul className="text-sm space-y-1 mt-2 opacity-90">
              <li>Montant brut : {withdrawalStatus.amount?.toFixed(2)}€</li>
              <li>Frais ({userFunctions.withdrawalFeePercentage}%) : {withdrawalStatus.fees?.toFixed(2)}€</li>
              <li>Montant net versé : <span className="font-bold">{withdrawalStatus.netAmount?.toFixed(2)}€</span></li>
              <li>Délai : {withdrawalStatus.processingDays}</li>
            </ul>
          )}
        </div>
      )}

      {/* Transaction History Mock */}
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-gray-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Historique récent</h4>
        <div className="space-y-3">
          {[
            { date: 'Aujourd\'hui', desc: 'Revenu - Canal Premium', amount: '+45.00€', type: 'in' },
            { date: 'Hier', desc: 'Revenu - Abonnements', amount: '+120.00€', type: 'in' },
            { date: '01/05/2026', desc: 'Retrait - Virement bancaire', amount: '-250.00€', type: 'out' }
          ].map((tx, i) => (
            <div key={i} className="flex justify-between items-center p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'in' ? 'bg-green-500/20 text-green-500' : 'bg-orange-500/20 text-orange-500'}`}>
                  {tx.type === 'in' ? '↓' : '↑'}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">{tx.desc}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{tx.date}</div>
                </div>
              </div>
              <div className={`font-bold ${tx.type === 'in' ? 'text-green-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recharger mon compte</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant (€)</label>
                <input
                  title="Montant de la recharge"
                  type="number"
                  min="10"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white font-medium"
                />
              </div>
              <div className="flex gap-2">
                {[20, 50, 100, 200].map(val => (
                  <button key={val} onClick={() => setRechargeAmount(val)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    {val}€
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRecharge}
                  disabled={isProcessingPayment}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Traitement...' : 'Payer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Demande de retrait</h3>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg mb-4">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Solde disponible: <span className="font-bold">{(user?.walletBalance || 0).toFixed(2)}€</span>
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant à retirer (€)</label>
                <input
                  title="Montant du retrait"
                  type="number"
                  min={userFunctions.minWithdrawalAmount}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder={`Min. ${userFunctions.minWithdrawalAmount}€`}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white font-medium"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isProcessingWithdraw || !withdrawalAmount}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessingWithdraw ? 'Traitement...' : 'Valider'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
