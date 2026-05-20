import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CinetPayCheckout from './payment/CinetPayCheckout';
import NowPaymentCheckout from './payment/NowPaymentCheckout';
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { updateUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<
    'monthly' | 'quarterly' | 'yearly'>(
    'monthly');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [showCinetPay, setShowCinetPay] = useState<boolean>(false);
  const [showNowPayment, setShowNowPayment] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  if (!isOpen) return null;
interface SubscriptionPlan {
  name: string;
  price: number;
  period: string;
  regularPrice?: number;
  savings: string | null;
  features: string[];
}

  const plans: Record<'monthly' | 'quarterly' | 'yearly', SubscriptionPlan> = {
    monthly: {
      name: 'Mensuel',
      price: 29.99,
      period: 'mois',
      savings: null,
      features: [
      'Accès à tous les pronostics premium',
      'Statistiques avancées',
      "Outils d'analyse",
      'Support prioritaire']

    },
    quarterly: {
      name: 'Trimestriel',
      price: 79.99,
      period: 'trimestre',
      regularPrice: 89.97,
      savings: '11%',
      features: [
      'Tous les avantages du plan mensuel',
      'Accès aux canaux de discussion privés',
      'Alertes personnalisées',
      'Économisez 11% par rapport au plan mensuel']

    },
    yearly: {
      name: 'Annuel',
      price: 269.99,
      period: 'an',
      regularPrice: 359.88,
      savings: '25%',
      features: [
      'Tous les avantages du plan trimestriel',
      'Analyse personnalisée de vos paris',
      'Consultation avec un expert une fois par trimestre',
      'Économisez 25% par rapport au plan mensuel']

    }
  };
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };
  const handleSubscribe = () => {
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
        onClose();
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
    onClose();
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
            amount={plans[selectedPlan].price}
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
            amount={plans[selectedPlan].price}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel} />

        </div>
      </div>);

  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-modal rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Abonnement Premium
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
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
              Choisissez votre plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(plans).map(([key, plan]) =>
              <div
                key={key}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${selectedPlan === key ? 'theme-border-primary shadow-md transform scale-[1.02]' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() =>
                setSelectedPlan(key as 'monthly' | 'quarterly' | 'yearly')
                }>

                  <div
                  className={`p-4 ${selectedPlan === key ? 'theme-bg-primary' : 'bg-gray-50 dark:bg-gray-700'}`}>

                    <h5
                    className={`text-base font-bold ${selectedPlan === key ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>

                      {plan.name}
                    </h5>
                    <div className="flex items-baseline mt-1">
                      <span
                      className={`text-2xl font-bold ${selectedPlan === key ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>

                        {plan.price}€
                      </span>
                      <span
                      className={`text-sm ml-1 ${selectedPlan === key ? 'text-white opacity-90' : 'text-gray-500 dark:text-gray-400'}`}>

                        /{plan.period}
                      </span>
                    </div>
                    {plan.savings &&
                  <div
                    className={`mt-2 ${selectedPlan === key ? 'bg-white bg-opacity-20 text-white' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'} rounded-full px-2 py-0.5 text-xs inline-block`}>

                        Économisez {plan.savings}
                      </div>
                  }
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) =>
                    <li key={index} className="flex items-start text-sm">
                          <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 theme-text-primary flex-shrink-0 mr-1.5"
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
                            {feature}
                          </span>
                        </li>
                    )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
              Méthode de paiement
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    Paiement mobile
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    CinetPay
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
                    Crypto
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    NOWPayments
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
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
              Récapitulatif
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Plan
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {plans[selectedPlan].name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Durée
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  1 {plans[selectedPlan].period}
                </span>
              </div>
              {plans[selectedPlan].regularPrice &&
              <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Prix normal
                  </span>
                  <span className="text-sm font-medium line-through text-gray-500 dark:text-gray-400">
                    {plans[selectedPlan].regularPrice}€
                  </span>
                </div>
              }
              <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Total à payer
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {plans[selectedPlan].price}€
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-3 mb-6">
            <div className="flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

              </svg>
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Votre abonnement sera automatiquement renouvelé à la fin de la
                  période. Vous pouvez annuler à tout moment dans vos
                  paramètres.
                </p>
              </div>
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
              onClick={handleSubscribe}
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

              `S'abonner pour ${plans[selectedPlan].price}€`
              }
            </button>
          </div>
        </div>
      </div>
    </div>);

};
export default SubscriptionModal;