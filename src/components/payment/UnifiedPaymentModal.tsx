import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CinetPayCheckout from './CinetPayCheckout';
import NowPaymentCheckout from './NowPaymentCheckout';
import { PaymentDetails, PaymentMethod } from '../../types/payment';
interface UnifiedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: PaymentMethod) => void;
  paymentDetails: PaymentDetails;
}
const UnifiedPaymentModal: React.FC<UnifiedPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  paymentDetails
}) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [showCinetPay, setShowCinetPay] = useState<boolean>(false);
  const [showNowPayment, setShowNowPayment] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [canUseWallet, setCanUseWallet] = useState<boolean>(false);
  useEffect(() => {
    // Vérifier si l'utilisateur peut payer avec son portefeuille
    if (user && user.walletBalance !== undefined && user.walletBalance >= paymentDetails.amount) {
      setCanUseWallet(true);
    } else {
      setCanUseWallet(false);
      // Si wallet était sélectionné mais n'est plus disponible, revenir à card
      if (paymentMethod === 'wallet') {
        setPaymentMethod('card');
      }
    }
  }, [user, paymentDetails.amount, paymentMethod]);
  if (!isOpen) return null;
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };
  const handleProceedPayment = () => {
    setIsProcessing(true);
    // Rediriger vers la méthode de paiement sélectionnée
    if (paymentMethod === 'mobile') {
      setShowCinetPay(true);
    } else if (paymentMethod === 'crypto') {
      setShowNowPayment(true);
    } else if (paymentMethod === 'wallet') {
      // Simuler le paiement par portefeuille pour la démo
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess('wallet');
      }, 1000);
    } else {
      // Simuler le paiement par carte pour la démo
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess('card');
      }, 1500);
    }
  };
  const handlePaymentSuccess = () => {
    setIsProcessing(false);
    setShowCinetPay(false);
    setShowNowPayment(false);
    onSuccess(paymentMethod);
  };
  const handlePaymentCancel = () => {
    setIsProcessing(false);
    setShowCinetPay(false);
    setShowNowPayment(false);
  };
  if (showCinetPay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <CinetPayCheckout
            amount={paymentDetails.amount}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel} />

        </div>
      </div>);

  }
  if (showNowPayment) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <NowPaymentCheckout
            amount={paymentDetails.amount}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel} />

        </div>
      </div>);

  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-modal rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {paymentDetails.type === 'recharge' ?
            'Recharger mon portefeuille' :
            paymentDetails.type === 'withdrawal' ?
            'Retrait' :
            'Paiement'}
          </h3>
          <button
            aria-label="Fermer le modale"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={isProcessing}>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />

            </svg>
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                Détails du paiement
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Description
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {paymentDetails.description}
                  </span>
                </div>
                {paymentDetails.itemName &&
                <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Produit
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {paymentDetails.itemName}
                    </span>
                  </div>
                }
                <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Montant total
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {paymentDetails.amount.toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
              Méthode de paiement
            </h4>
            <div className="space-y-2">
              {canUseWallet && paymentDetails.type !== 'recharge' &&
              <div
                className={`p-3 border rounded-lg cursor-pointer flex items-center ${paymentMethod === 'wallet' ? 'theme-border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => handlePaymentMethodChange('wallet')}>

                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />

                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Portefeuille PRONOSBOX
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Solde: {user?.walletBalance?.toFixed(2)}€
                    </p>
                  </div>
                  {paymentMethod === 'wallet' &&
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 theme-text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                      <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />

                    </svg>
                }
                </div>
              }
              {paymentDetails.type !== 'withdrawal' &&
              <>
                  <div
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${paymentMethod === 'card' ? 'theme-border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => handlePaymentMethodChange('card')}>

                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">

                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />

                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Carte bancaire
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Visa, Mastercard, etc.
                      </p>
                    </div>
                    {paymentMethod === 'card' &&
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 theme-text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                        <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7" />

                      </svg>
                  }
                  </div>
                  <div
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${paymentMethod === 'mobile' ? 'theme-border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => handlePaymentMethodChange('mobile')}>

                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-3">
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-orange-600 dark:text-orange-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">

                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />

                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Paiement mobile (CinetPay)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Orange Money, MTN Mobile Money, etc.
                      </p>
                    </div>
                    {paymentMethod === 'mobile' &&
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 theme-text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                        <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7" />

                      </svg>
                  }
                  </div>
                  <div
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${paymentMethod === 'crypto' ? 'theme-border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => handlePaymentMethodChange('crypto')}>

                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">

                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />

                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Crypto (NOWPayments)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Bitcoin, Ethereum, etc.
                      </p>
                    </div>
                    {paymentMethod === 'crypto' &&
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 theme-text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                        <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7" />

                      </svg>
                  }
                  </div>
                </>
              }
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700"
              disabled={isProcessing}>

              Annuler
            </button>
            <button
              onClick={handleProceedPayment}
              className="px-4 py-2 theme-bg-primary text-white rounded-lg text-sm flex items-center"
              disabled={isProcessing}>

              {isProcessing ?
              <>
                  <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">

                    <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4">
                  </circle>
                    <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                  </svg>
                  Traitement...
                </> :
              paymentDetails.type === 'withdrawal' ?
              'Retirer' :
              paymentDetails.type === 'recharge' ?
              'Recharger' :

              'Payer'
              }
            </button>
          </div>
        </div>
      </div>
    </div>);

};
export default UnifiedPaymentModal;