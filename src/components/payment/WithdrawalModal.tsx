import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<string>('card');
  const [accountInfo, setAccountInfo] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<
    'form' | 'confirmation' | 'processing' | 'success'>(
    'form');
  if (!isOpen) return null;
  const maxAmount = user?.walletBalance || 0;
  const isValidAmount =
  parseFloat(amount) > 0 && parseFloat(amount) <= maxAmount;
  const isValidAccountInfo = accountInfo.trim().length > 0;
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  const handleWithdrawalMethodChange = (method: string) => {
    setWithdrawalMethod(method);
    setAccountInfo('');
  };
  const handleAccountInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountInfo(e.target.value);
  };
  const handleProceedToConfirmation = () => {
    if (!isValidAmount || !isValidAccountInfo) return;
    setStep('confirmation');
  };
  const handleGoBack = () => {
    setStep('form');
  };
  const handleSubmit = () => {
    setIsProcessing(true);
    setStep('processing');
    // Simuler un retrait pour la démo
    setTimeout(() => {
      const newBalance = (user?.walletBalance || 0) - parseFloat(amount);
      updateUser({
        walletBalance: newBalance
      });
      setStep('success');
      // Fermer la modal après quelques secondes
      setTimeout(() => {
        setIsProcessing(false);
        setStep('form');
        onSuccess();
      }, 2000);
    }, 2000);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Retrait
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
          {step === 'form' &&
          <>
              <div className="mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 mb-4">
                  <div className="flex items-center">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-600 dark:text-green-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />

                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Solde disponible: {maxAmount.toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Montant à retirer (€)
                </label>
                <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                placeholder="0.00" />

                {amount && !isValidAmount &&
              <p className="text-xs text-red-500 mt-1">
                    {parseFloat(amount) <= 0 ?
                'Le montant doit être supérieur à zéro' :
                `Le montant ne peut pas dépasser votre solde (${maxAmount.toFixed(2)}€)`}
                  </p>
              }
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Méthode de retrait
                </label>
                <div className="space-y-2">
                  <div
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${withdrawalMethod === 'card' ? 'theme-border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => handleWithdrawalMethodChange('card')}>

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
                        Délai: 2-5 jours ouvrables
                      </p>
                    </div>
                    {withdrawalMethod === 'card' &&
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
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${withdrawalMethod === 'bank' ? 'theme-border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => handleWithdrawalMethodChange('bank')}>

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
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />

                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Virement bancaire
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Délai: 3-7 jours ouvrables
                      </p>
                    </div>
                    {withdrawalMethod === 'bank' &&
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
                  className={`p-3 border rounded-lg cursor-pointer flex items-center ${withdrawalMethod === 'mobile' ? 'theme-border-primary bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => handleWithdrawalMethodChange('mobile')}>

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
                        Mobile Money
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Délai: Instantané
                      </p>
                    </div>
                    {withdrawalMethod === 'mobile' &&
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {withdrawalMethod === 'card' ?
                'Numéro de carte' :
                withdrawalMethod === 'bank' ?
                'IBAN' :
                'Numéro de téléphone'}
                </label>
                <input
                type="text"
                value={accountInfo}
                onChange={handleAccountInfoChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                placeholder={
                withdrawalMethod === 'card' ?
                'XXXX XXXX XXXX XXXX' :
                withdrawalMethod === 'bank' ?
                'FR76 XXXX XXXX XXXX XXXX XXXX XXX' :
                '+XXX XX XX XX XX XX'
                } />

                {accountInfo && !isValidAccountInfo &&
              <p className="text-xs text-red-500 mt-1">
                    Veuillez entrer des informations valides
                  </p>
              }
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Montant
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {parseFloat(amount || '0').toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Frais
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {(parseFloat(amount || '0') * 0.02).toFixed(2)}€
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Total à recevoir
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {(parseFloat(amount || '0') * 0.98).toFixed(2)}€
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700">

                  Annuler
                </button>
                <button
                onClick={handleProceedToConfirmation}
                className="px-4 py-2 theme-bg-primary text-white rounded-lg text-sm"
                disabled={!isValidAmount || !isValidAccountInfo}>

                  Continuer
                </button>
              </div>
            </>
          }
          {step === 'confirmation' &&
          <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800 mb-4">
                <div className="flex items-start">
                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5"
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
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Confirmation de retrait
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                      Veuillez vérifier les informations ci-dessous avant de
                      confirmer votre demande de retrait.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Récapitulatif de votre demande
                </h4>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Méthode de retrait
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {withdrawalMethod === 'card' ?
                    'Carte bancaire' :
                    withdrawalMethod === 'bank' ?
                    'Virement bancaire' :
                    'Mobile Money'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {withdrawalMethod === 'card' ?
                    'Numéro de carte' :
                    withdrawalMethod === 'bank' ?
                    'IBAN' :
                    'Numéro de téléphone'}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {accountInfo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Montant du retrait
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {parseFloat(amount).toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Frais (2%)
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(parseFloat(amount) * 0.02).toFixed(2)}€
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Montant total à recevoir
                    </span>
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {(parseFloat(amount) * 0.98).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                En confirmant ce retrait, vous acceptez les conditions générales
                de service et la politique de confidentialité de PRONOSBOX.
              </div>
              <div className="flex justify-between space-x-3">
                <button
                onClick={handleGoBack}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700">

                  Retour
                </button>
                <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">

                  Confirmer le retrait
                </button>
              </div>
            </>
          }
          {step === 'processing' &&
          <div className="text-center py-8">
              <div className="inline-block mb-4">
                <svg
                className="animate-spin h-12 w-12 theme-text-primary"
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
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Traitement en cours
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nous traitons votre demande de retrait. Veuillez patienter...
              </p>
            </div>
          }
          {step === 'success' &&
          <div className="text-center py-8">
              <div className="inline-block p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">

                  <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7" />

                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Retrait effectué avec succès!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Votre demande de retrait de {parseFloat(amount).toFixed(2)}€ a
                été traitée.
                {withdrawalMethod === 'mobile' ?
              ' Les fonds seront disponibles immédiatement.' :
              withdrawalMethod === 'card' ?
              ' Les fonds seront crédités sur votre carte dans 2-5 jours ouvrables.' :
              ' Les fonds seront crédités sur votre compte dans 3-7 jours ouvrables.'}
              </p>
            </div>
          }
        </div>
      </div>
    </div>);

};
export default WithdrawalModal;