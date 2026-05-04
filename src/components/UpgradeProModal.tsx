import React, { useState } from 'react';
import { X, Check, ArrowLeft, CreditCard } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import { useAuth } from '../contexts/AuthContext';
interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
const UpgradeProModal: React.FC<UpgradeProModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { processPayment } = usePayment();
  const { updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  if (!isOpen) return null;
  // Prix fixe de 25€ pour un accès définitif
  const proPrice = 25;
  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      // Simuler un traitement de paiement
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await processPayment({
        amount: proPrice,
        method: 'card',
        plan: 'lifetime'
      });
      
      // Mettre à jour le statut de l'utilisateur en local/mock
      await updateUser({ isPro: true });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Erreur de paiement:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-xs mx-4 overflow-hidden">
        {/* Header */}
        <div className="relative px-3 py-2 bg-green-600 text-white">
          <h3 className="text-base font-medium">Passez à PronosBox Pro</h3>
          <p className="text-xs opacity-90">Créez votre propre canal</p>
          <button
            title="Fermer le modal"
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:text-gray-200">

            <X size={16} />
          </button>
        </div>
        {/* Content */}
        <div className="p-3">
          <div className="mb-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Offre exclusive
            </h4>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-center">
              <div className="text-xl font-bold text-green-700 dark:text-green-300">
                25€
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                Accès Pro définitif
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Paiement unique, pas d'abonnement
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-md mb-3">
            <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Avantages PronosBox Pro
            </h4>
            <ul className="text-xs space-y-1">
              <li className="flex items-start">
                <Check
                  size={12}
                  className="text-green-600 dark:text-green-400 mr-1 mt-0.5 flex-shrink-0" />

                <span>
                  Créez votre propre canal et monétisez vos pronostics
                </span>
              </li>
              <li className="flex items-start">
                <Check
                  size={12}
                  className="text-green-600 dark:text-green-400 mr-1 mt-0.5 flex-shrink-0" />

                <span>Accédez à des statistiques détaillées</span>
              </li>
              <li className="flex items-start">
                <Check
                  size={12}
                  className="text-green-600 dark:text-green-400 mr-1 mt-0.5 flex-shrink-0" />

                <span>Retirez vos gains via différentes méthodes</span>
              </li>
              <li className="flex items-start">
                <Check
                  size={12}
                  className="text-green-600 dark:text-green-400 mr-1 mt-0.5 flex-shrink-0" />

                <span>Configurez des coupons payants</span>
              </li>
              <li className="flex items-start">
                <Check
                  size={12}
                  className="text-green-600 dark:text-green-400 mr-1 mt-0.5 flex-shrink-0" />

                <span>Envoyez des messages vocaux dans vos canaux</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/30 flex justify-between">
          <button
            onClick={onClose}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">

            <ArrowLeft size={12} className="mr-1" />
            Retour
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className={`px-2 py-1 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 flex items-center ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}>

            {isProcessing ?
            <>
                <svg
                className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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

            <>
                <CreditCard size={12} className="mr-1" />
                Payer {proPrice}€
              </>
            }
          </button>
        </div>
      </div>
    </div>);

};
export default UpgradeProModal;