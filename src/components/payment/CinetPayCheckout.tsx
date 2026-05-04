import React, { useEffect, useState } from 'react';
interface CinetPayCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}
const CinetPayCheckout: React.FC<CinetPayCheckoutProps> = ({
  amount,
  onSuccess,
  onCancel
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [operator, setOperator] = useState<string>('orange');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<
    'form' | 'confirmation' | 'processing' | 'success' | 'error'>(
    'form');
  const [transactionId, setTransactionId] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(180); // 3 minutes
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'confirmation' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (step === 'confirmation' && countdown === 0) {
      setStep('error');
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step, countdown]);
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Accepter seulement les nombres
    if (/^\d*$/.test(value)) {
      setPhoneNumber(value);
    }
  };
  const handleSubmit = () => {
    if (phoneNumber.length < 8) return;
    setIsProcessing(true);
    // Simuler une requête API vers CinetPay
    setTimeout(() => {
      setTransactionId(`CP${Math.floor(Math.random() * 1000000)}`);
      setIsProcessing(false);
      setStep('confirmation');
    }, 1500);
  };
  const handleConfirm = () => {
    setStep('processing');
    // Simuler une confirmation de paiement
    setTimeout(() => {
      setStep('success');
      // Attendre un peu avant de fermer
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 3000);
  };
  const handleCancel = () => {
    onCancel();
  };
  return (
    <div className="w-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mr-2">
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            CinetPay
          </h3>
        </div>
        <button
          onClick={handleCancel}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          disabled={isProcessing || step === 'processing'}>

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
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Montant
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {amount.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Frais CinetPay
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {(amount * 0.035).toFixed(2)}€
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {(amount * 1.035).toFixed(2)}€
                </span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Opérateur Mobile
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div
                className={`p-2 border rounded-lg flex flex-col items-center cursor-pointer ${operator === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setOperator('orange')}>

                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                      OM
                    </span>
                  </div>
                  <span className="text-xs">Orange Money</span>
                </div>
                <div
                className={`p-2 border rounded-lg flex flex-col items-center cursor-pointer ${operator === 'mtn' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setOperator('mtn')}>

                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                      MTN
                    </span>
                  </div>
                  <span className="text-xs">MTN Money</span>
                </div>
                <div
                className={`p-2 border rounded-lg flex flex-col items-center cursor-pointer ${operator === 'moov' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setOperator('moov')}>

                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-1">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      MV
                    </span>
                  </div>
                  <span className="text-xs">Moov Money</span>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Numéro de téléphone
              </label>
              <div className="flex">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md text-gray-500 dark:text-gray-400">
                  +225
                </div>
                <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="07 XX XX XX XX"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400" />

              </div>
              {phoneNumber && phoneNumber.length < 8 &&
            <p className="text-xs text-red-500 mt-1">
                  Le numéro doit contenir au moins 8 chiffres
                </p>
            }
            </div>
            <button
            onClick={handleSubmit}
            className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium flex items-center justify-center"
            disabled={isProcessing || phoneNumber.length < 8}>

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

            'Payer maintenant'
            }
            </button>
          </>
        }
        {step === 'confirmation' &&
        <>
            <div className="text-center mb-4">
              <div className="inline-block p-3 bg-orange-100 dark:bg-orange-900 rounded-full mb-2">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-orange-600 dark:text-orange-400"
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Confirmez le paiement
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Une demande de paiement a été envoyée à votre téléphone.
                Veuillez confirmer le paiement.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Montant
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {amount.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Téléphone
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  +225 {phoneNumber}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Transaction ID
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {transactionId}
                </span>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                Temps restant: {formatTime(countdown)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                La demande expirera après ce délai
              </p>
            </div>
            <div className="flex space-x-3">
              <button
              onClick={handleCancel}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg text-sm font-medium">

                Annuler
              </button>
              <button
              onClick={handleConfirm}
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium">

                J'ai confirmé
              </button>
            </div>
          </>
        }
        {step === 'processing' &&
        <div className="text-center py-8">
            <div className="inline-block mb-4">
              <svg
              className="animate-spin h-12 w-12 text-orange-600 dark:text-orange-400"
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
              Nous vérifions votre paiement. Veuillez patienter...
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
              Paiement réussi!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Votre portefeuille a été rechargé de {amount.toFixed(2)}€
            </p>
          </div>
        }
        {step === 'error' &&
        <div className="text-center py-8">
            <div className="inline-block p-3 bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">

                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />

              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Paiement échoué
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Le délai de paiement a expiré ou une erreur s'est produite.
            </p>
            <div className="flex space-x-3">
              <button
              onClick={handleCancel}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg text-sm font-medium">

                Annuler
              </button>
              <button
              onClick={() => setStep('form')}
              className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium">

                Réessayer
              </button>
            </div>
          </div>
        }
      </div>
    </div>);

};
export default CinetPayCheckout;