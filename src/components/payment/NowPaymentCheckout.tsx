import React, { useEffect, useState } from 'react';
interface NowPaymentCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}
const NowPaymentCheckout: React.FC<NowPaymentCheckoutProps> = ({
  amount,
  onSuccess,
  onCancel
}) => {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<
    'select' | 'payment' | 'processing' | 'success' | 'error'>(
    'select');
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(900); // 15 minutes
  const [paymentId, setPaymentId] = useState<string>('');
  const cryptoOptions = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    rate: 0.000022
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    rate: 0.00035
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: 'USDT',
    rate: 1.01
  },
  {
    id: 'bnb',
    name: 'Binance Coin',
    symbol: 'BNB',
    rate: 0.0032
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    rate: 0.014
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'DOGE',
    rate: 1.2
  }];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'payment' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (step === 'payment' && countdown === 0) {
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
  const handleSelectCrypto = (cryptoId: string) => {
    setSelectedCrypto(cryptoId);
  };
  const handleCreatePayment = () => {
    setIsProcessing(true);
    // Simuler une requête API vers NOWPayments
    setTimeout(() => {
      const selected = cryptoOptions.find((c) => c.id === selectedCrypto);
      if (selected) {
        setCryptoAmount((amount * selected.rate).toFixed(8));
        setPaymentAddress(
          `${selected.id}${Math.random().toString(36).substring(2, 10)}`
        );
        setPaymentId(`NP${Math.floor(Math.random() * 1000000)}`);
        setIsProcessing(false);
        setStep('payment');
      }
    }, 1500);
  };
  const handleCheckPayment = () => {
    setStep('processing');
    // Simuler une vérification de paiement
    setTimeout(() => {
      // Simuler un paiement réussi
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
  const selectedCryptoInfo = cryptoOptions.find((c) => c.id === selectedCrypto);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-2">
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            NOWPayments
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
        {step === 'select' &&
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
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choisissez une cryptomonnaie
              </label>
              <div className="grid grid-cols-2 gap-2">
                {cryptoOptions.map((crypto) =>
              <div
                key={crypto.id}
                className={`p-3 border rounded-lg cursor-pointer ${selectedCrypto === crypto.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => handleSelectCrypto(crypto.id)}>

                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-bold">
                          {crypto.symbol}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {crypto.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ≈ {(amount * crypto.rate).toFixed(6)} {crypto.symbol}
                        </p>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </div>
            <button
            onClick={handleCreatePayment}
            className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center justify-center"
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

            'Continuer'
            }
            </button>
          </>
        }
        {step === 'payment' && selectedCryptoInfo &&
        <>
            <div className="text-center mb-4">
              <div className="inline-block p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-2">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600 dark:text-purple-400"
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                Paiement {selectedCryptoInfo.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Envoyez exactement le montant indiqué à l'adresse ci-dessous
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <div className="mb-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Montant à envoyer
                </label>
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-600">
                  <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {cryptoAmount}
                  </span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {selectedCryptoInfo.symbol}
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Adresse de paiement
                </label>
                <div className="relative">
                  <input
                  type="text"
                  readOnly
                  value={paymentAddress}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-100 pr-10" />

                  <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() =>
                  navigator.clipboard.writeText(paymentAddress)
                  }>

                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">

                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />

                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ID de paiement
                </span>
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {paymentId}
                </span>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Temps restant: {formatTime(countdown)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Le taux de change est garanti pendant ce délai
              </p>
            </div>
            <div className="flex space-x-3">
              <button
              onClick={handleCancel}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg text-sm font-medium">

                Annuler
              </button>
              <button
              onClick={handleCheckPayment}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">

                J'ai payé
              </button>
            </div>
          </>
        }
        {step === 'processing' &&
        <div className="text-center py-8">
            <div className="inline-block mb-4">
              <svg
              className="animate-spin h-12 w-12 text-purple-600 dark:text-purple-400"
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
              Vérification en cours
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nous attendons la confirmation de votre transaction sur la
              blockchain. Cela peut prendre quelques minutes...
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
              Paiement expiré
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Le délai de paiement a expiré. Le taux de change a peut-être
              changé.
            </p>
            <div className="flex space-x-3">
              <button
              onClick={handleCancel}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg text-sm font-medium">

                Annuler
              </button>
              <button
              onClick={() => setStep('select')}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">

                Réessayer
              </button>
            </div>
          </div>
        }
      </div>
    </div>);

};
export default NowPaymentCheckout;