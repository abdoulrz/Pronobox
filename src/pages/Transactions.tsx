import { useEffect, useState } from 'react';
import { usePayment } from '../hooks/usePayment';
import { PaymentType } from '../types/payment';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const Transactions = () => {
  const { user } = useAuth();
  const { paymentHistory, fetchTransactions } = usePayment();
  const [filter, setFilter] = useState<PaymentType | 'all'>('all');
  const [dateRange, setDateRange] = useState<
    'all' | 'month' | 'year' | 'custom'>(
    'all');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const navigate = useNavigate();
  const isUserPro = user?.isPro || user?.role === 'admin';
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        await fetchTransactions();
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, [fetchTransactions]);
  // Filtrer les transactions
  const filteredTransactions = paymentHistory.filter((transaction) => {
    // Filtre par type
    if (filter !== 'all' && transaction.type !== filter) {
      return false;
    }
    // Filtre par date
    if (dateRange === 'month') {
      const now = new Date();
      const monthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );
      return transaction.date >= monthAgo;
    } else if (dateRange === 'year') {
      const now = new Date();
      const yearAgo = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      return transaction.date >= yearAgo;
    } else if (dateRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Inclure toute la journée de fin
      return transaction.date >= start && transaction.date <= end;
    }
    return true;
  });
  // Calculer le solde
  const balance = filteredTransactions.reduce((acc, transaction) => {
    if (transaction.type === 'withdrawal') {
      return acc - transaction.amount;
    } else {
      return acc + transaction.amount;
    }
  }, 0);
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historique des transactions</h1>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18" />

          </svg>
          Retour aux paramètres
        </button>
      </div>

      {/* Bannière Pro pour les utilisateurs standard */}
      {!isUserPro &&
      <div className="mb-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-start mb-3 md:mb-0">
              <div className="flex-shrink-0 pt-0.5">
                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor">

                  <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd" />

                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Passez à Pro pour débloquer les retraits
                </h3>
                <div className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                  <p>
                    Les utilisateurs Pro peuvent retirer leurs gains via
                    différentes méthodes de paiement.
                  </p>
                </div>
              </div>
            </div>
            <button
            onClick={() => navigate('/compare-accounts')}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors">

              Passer à Pro
            </button>
          </div>
        </div>
      }

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Filtres
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                Tout
              </button>
              <button
                onClick={() => setFilter('recharge')}
                className={`px-3 py-1 text-sm rounded-full ${filter === 'recharge' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                Recharges
              </button>
              <button
                onClick={() => setFilter('withdrawal')}
                className={`px-3 py-1 text-sm rounded-full ${filter === 'withdrawal' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                Retraits
              </button>
              <button
                onClick={() => setFilter('subscription')}
                className={`px-3 py-1 text-sm rounded-full ${filter === 'subscription' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                Abonnements
              </button>
              <button
                onClick={() => setFilter('product')}
                className={`px-3 py-1 text-sm rounded-full ${filter === 'product' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                Achats
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Période
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => setDateRange('all')}
                  className={`px-3 py-1 text-sm rounded-full ${dateRange === 'all' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                  Tout
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className={`px-3 py-1 text-sm rounded-full ${dateRange === 'month' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                  Dernier mois
                </button>
                <button
                  onClick={() => setDateRange('year')}
                  className={`px-3 py-1 text-sm rounded-full ${dateRange === 'year' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                  Dernière année
                </button>
                <button
                  onClick={() => setDateRange('custom')}
                  className={`px-3 py-1 text-sm rounded-full ${dateRange === 'custom' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>

                  Personnalisé
                </button>
              </div>
            </div>
            {dateRange === 'custom' &&
            <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="start-date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Du
                  </label>
                  <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />

                </div>
                <div>
                  <label htmlFor="end-date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Au
                  </label>
                  <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />

                </div>
              </div>
            }
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg self-start">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Balance
            </span>
            <div className="text-xl font-bold theme-text-primary">
              {balance.toFixed(2)}€
            </div>
            {isUserPro &&
            <button className="mt-2 w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors">
                Effectuer un retrait
              </button>
            }
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ?
        <div className="flex justify-center items-center p-8">
            <svg
            className="animate-spin h-8 w-8 text-green-600"
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
          </div> :

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">

                    Date
                  </th>
                  <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">

                    Description
                  </th>
                  <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">

                    Méthode
                  </th>
                  <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">

                    Statut
                  </th>
                  <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">

                    Montant
                  </th>
                  {isUserPro &&
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">

                      Actions
                    </th>
                }
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.length > 0 ?
              filteredTransactions.map((transaction) =>
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700">

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {format(transaction.date, 'dd MMM yyyy', {
                    locale: fr
                  })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {transaction.method === 'card' && 'Carte bancaire'}
                        {transaction.method === 'mobile' && 'Mobile Money'}
                        {transaction.method === 'crypto' && 'Crypto'}
                        {transaction.method === 'wallet' && 'Portefeuille'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>

                          {transaction.status === 'completed' && 'Terminé'}
                          {transaction.status === 'pending' && 'En attente'}
                          {transaction.status === 'failed' && 'Échoué'}
                        </span>
                      </td>
                      <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>

                        {transaction.type === 'withdrawal' ? '-' : '+'}
                        {transaction.amount.toFixed(2)}€
                      </td>
                      {isUserPro &&
                <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                            Détails
                          </button>
                          {transaction.status === 'pending' &&
                  <button className="ml-3 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                              Annuler
                            </button>
                  }
                        </td>
                }
                    </tr>
              ) :

              <tr>
                    <td
                  colSpan={isUserPro ? 6 : 5}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">

                      Aucune transaction trouvée
                    </td>
                  </tr>
              }
              </tbody>
            </table>
          </div>
        }
      </div>

      {/* Actions pour les utilisateurs Pro */}
      {isUserPro &&
      <div className="mt-6 flex flex-wrap gap-4 justify-end">
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium transition-colors">
            Exporter (CSV)
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
            Générer un reçu
          </button>
        </div>
      }
    </div>);

};
export default Transactions;