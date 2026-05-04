import React from 'react';
import AccountComparison from '../components/AccountComparison';
const CompareAccounts: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Comptes PronosBox
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Découvrez les différentes fonctionnalités disponibles selon votre type
          de compte
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Carte compte standard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Compte Standard
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Idéal pour les utilisateurs qui souhaitent accéder aux pronostics
              et rejoindre des canaux.
            </p>
            <div className="mt-6 text-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Gratuit
              </span>
            </div>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                  Rejoindre des canaux gratuits
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                  S'abonner à des canaux premium
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                  Commenter les pronostics
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />

                </svg>
                <span className="text-gray-500 dark:text-gray-400">
                  Créer des canaux
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />

                </svg>
                <span className="text-gray-500 dark:text-gray-400">
                  Monétiser vos pronostics
                </span>
              </li>
            </ul>
          </div>
        </div>
        {/* Carte compte Pro */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border-2 border-green-500 dark:border-green-400 relative lg:col-span-2">
          <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold uppercase rounded-bl-lg">
            Recommandé
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Compte Pro
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Pour les experts qui souhaitent créer leur propre canal et
              monétiser leurs pronostics.
            </p>
            <div className="mt-6 text-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                25€
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">
                paiement unique
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    Toutes les fonctionnalités standard
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    Créer et gérer vos propres canaux
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    Monétiser vos pronostics
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    Configurer des coupons payants
                  </span>
                </li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    Effectuer des retraits d'argent
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    Accès aux statistiques avancées
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    Support prioritaire
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                    Messages vocaux dans les canaux
                  </span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button className="w-full py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                Devenir Pro pour 25€
              </button>
            </div>
          </div>
        </div>
      </div>
      <AccountComparison />
      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">
          Vous êtes un pronostiqueur expérimenté ?
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
          Avec un compte Pro, vous pouvez partager votre expertise et générer
          des revenus en créant votre propre canal. Nos meilleurs pronostiqueurs
          gagnent jusqu'à 2000€ par mois !
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3 sm:mb-0">
            Commencez dès aujourd'hui et développez votre communauté !
          </p>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700">
            En savoir plus
          </button>
        </div>
      </div>
    </div>);

};
export default CompareAccounts;