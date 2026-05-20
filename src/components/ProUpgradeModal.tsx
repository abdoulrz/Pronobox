import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CinetPayCheckout from './payment/CinetPayCheckout';
import NowPaymentCheckout from './payment/NowPaymentCheckout';
interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}
const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade
}) => {
  const { updateUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [showCinetPay, setShowCinetPay] = useState<boolean>(false);
  const [showNowPayment, setShowNowPayment] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  if (!isOpen) return null;
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };
  const handleUpgrade = () => {
    setIsProcessing(true);
    // Rediriger vers la méthode de paiement sélectionnée
    if (paymentMethod === 'mobile') {
      setShowCinetPay(true);
    } else if (paymentMethod === 'crypto') {
      setShowNowPayment(true);
    } else {
      // Simuler le paiement par carte pour la démo
      setTimeout(() => {
        updateUser({
          isPro: true
        });
        setIsProcessing(false);
        onUpgrade();
      }, 1500);
    }
  };
  const handlePaymentSuccess = () => {
    updateUser({
      isPro: true
    });
    setIsProcessing(false);
    setShowCinetPay(false);
    setShowNowPayment(false);
    onUpgrade();
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
            amount={29.99}
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
            amount={29.99}
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
            Devenir membre Pro
          </h3>
          <button
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
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800 mb-4">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-600 dark:text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />

                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                  Fonctionnalités Pro requises
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  Pour créer un canal, vous devez être membre Pro. Profitez de
                  toutes les fonctionnalités exclusives et débloquez toutes les
                  limitations.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Avantages Pro
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 theme-text-primary mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />

                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Créez vos propres canaux sans limite
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 theme-text-primary mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />

                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Accès aux analyses et pronostics Premium
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 theme-text-primary mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />

                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Statistiques avancées et outils de prédiction
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 theme-text-primary mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7" />

                </svg>
                <span className="text-gray-700 dark:text-gray-300">
                  Support prioritaire et fonctionnalités exclusives
                </span>
              </li>
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Méthode de paiement
            </h4>
            <div className="space-y-2">
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
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Abonnement mensuel
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                29,99€
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Annulation possible à tout moment
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
              onClick={handleUpgrade}
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

              'Devenir Pro'
              }
            </button>
          </div>
        </div>
      </div>
    </div>);

};
export default ProUpgradeModal;