import React from 'react';
import { Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
interface ComparisonFeature {
  name: string;
  description: string;
  standardUser: boolean;
  proUser: boolean;
}
const AccountComparison: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const features: ComparisonFeature[] = [
  {
    name: 'Rejoindre des canaux',
    description: 'Rejoindre les canaux publics et privés',
    standardUser: true,
    proUser: true
  },
  {
    name: 'Abonnements aux canaux premium',
    description:
    "S'abonner à des canaux premium pour accéder à du contenu exclusif",
    standardUser: true,
    proUser: true
  },
  {
    name: 'Accès aux pronostics de base',
    description:
    'Consulter les pronostics gratuits disponibles sur la plateforme',
    standardUser: true,
    proUser: true
  },
  {
    name: 'Créer des canaux',
    description: 'Créer et personnaliser vos propres canaux de pronostics',
    standardUser: false,
    proUser: true
  },
  {
    name: 'Monétiser vos pronostics',
    description: 'Proposer des abonnements payants à vos canaux',
    standardUser: false,
    proUser: true
  },
  {
    name: 'Coupons payants',
    description:
    'Créer et vendre des pronostics individuels sous forme de coupons',
    standardUser: false,
    proUser: true
  },
  {
    name: 'Effectuer des retraits',
    description: 'Retirer vos gains via différentes méthodes de paiement',
    standardUser: false,
    proUser: true
  },
  {
    name: 'Statistiques avancées',
    description:
    'Accéder à des analyses détaillées et des statistiques poussées',
    standardUser: false,
    proUser: true
  },
  {
    name: 'Messages vocaux dans les canaux',
    description: 'Envoyer des messages vocaux dans les canaux',
    standardUser: false,
    proUser: true
  },
  {
    name: 'Commentaires dans les canaux',
    description: 'Commenter les pronostics et interagir avec la communauté',
    standardUser: true,
    proUser: true
  },
  {
    name: 'Support prioritaire',
    description: "Bénéficier d'une assistance prioritaire de notre équipe",
    standardUser: false,
    proUser: true
  },
  {
    name: 'Personnalisation de profil',
    description: 'Options avancées de personnalisation de votre profil',
    standardUser: false,
    proUser: true
  }];

  const isUserPro = user?.isPro || user?.role === 'admin';
  const handleUpgradeToPro = () => {
    navigate('/settings');
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Comparaison des comptes
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Découvrez les différences entre un compte standard et un compte Pro
        </p>
        {user &&
        <div className="mt-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Votre compte actuel :{' '}
            </span>
            <span
            className={`font-medium ${isUserPro ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>

              {isUserPro ? 'Pro' : 'Standard'}
            </span>
          </div>
        }
      </div>
      {/* Version mobile - Affichage en accordéon */}
      <div className="block md:hidden">
        <div className="p-4 space-y-4">
          {features.map((feature, index) =>
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">

              <div className="p-3 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {feature.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {feature.description}
                </p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                <div
                className={`p-2 flex flex-col items-center ${!isUserPro ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>

                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Standard
                  </span>
                  {feature.standardUser ?
                <Check size={18} className="text-green-500" /> :

                <X size={18} className="text-red-500" />
                }
                </div>
                <div
                className={`p-2 flex flex-col items-center ${isUserPro ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>

                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tipster
                  </span>
                  {feature.proUser ?
                <Check size={18} className="text-green-500" /> :

                <X size={18} className="text-red-500" />
                }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Version desktop - Affichage en tableau */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">

                Fonctionnalité
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-32 ${!isUserPro ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>

                Utilisateur Normal
                {!isUserPro &&
                <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                    (actuel)
                  </span>
                }
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-32 ${isUserPro ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>

                Tipster
                {isUserPro &&
                <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400">
                    (actuel)
                  </span>
                }
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {features.map((feature, index) =>
            <tr
              key={index}
              className={
              index % 2 === 0 ?
              'bg-white dark:bg-gray-800' :
              'bg-gray-50 dark:bg-gray-700/50'
              }>

                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {feature.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </div>
                </td>
                <td
                className={`px-6 py-4 text-center ${!isUserPro ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>

                  {feature.standardUser ?
                <Check size={20} className="text-green-500 mx-auto" /> :

                <X size={20} className="text-red-500 mx-auto" />
                }
                </td>
                <td
                className={`px-6 py-4 text-center ${isUserPro ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>

                  {feature.proUser ?
                <Check size={20} className="text-green-500 mx-auto" /> :

                <X size={20} className="text-red-500 mx-auto" />
                }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0 text-center sm:text-left">
            {isUserPro ?
            <>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Vous bénéficiez déjà de tous les avantages Pro
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Profitez de toutes les fonctionnalités premium de PronosBox
                </p>
              </> :

            <>
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Passez à PronosBox Pro
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Créez votre propre canal et monétisez vos pronostics
                </p>
              </>
            }
          </div>
          {!isUserPro &&
          <button
            onClick={handleUpgradeToPro}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors">

              Devenir Pro
            </button>
          }
        </div>
      </div>
    </div>);

};
export default AccountComparison;