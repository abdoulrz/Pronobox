import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
interface SearchResult {
  id: string;
  type: 'match' | 'prediction' | 'channel' | 'user';
  title: string;
  subtitle?: string;
  image?: string;
  path: string;
}
interface SearchBarProps {
  onClose?: () => void;
}
const SearchBar: React.FC<SearchBarProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Fermer la recherche quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node))
      {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  // Simuler une recherche
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    // Simuler un délai réseau
    const timer = setTimeout(() => {
      // Données de démonstration
      const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'match',
        title: 'PSG vs Manchester City',
        subtitle: 'Ligue des Champions - 21/10/2023',
        image:
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        path: '/'
      },
      {
        id: '2',
        type: 'prediction',
        title: 'Analyse: PSG vs Manchester City',
        subtitle: 'Pronostic avec 78% de confiance',
        path: '/predictions'
      },
      {
        id: '3',
        type: 'match',
        title: 'Lyon vs Marseille',
        subtitle: 'Ligue 1 - 22/10/2023',
        image:
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        path: '/'
      },
      {
        id: '4',
        type: 'channel',
        title: 'Communauté Ligue 1',
        subtitle: '3.2k membres - Canal public',
        image:
        'https://images.unsplash.com/photo-1522778034537-20a2486be803?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        path: '/box'
      },
      {
        id: '5',
        type: 'user',
        title: 'ProUser',
        subtitle: 'Membre Pro - 142 pronostics',
        image:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        path: '/settings'
      }];

      // Filtrer les résultats basés sur le terme de recherche
      const filteredResults = mockResults.filter(
        (result) =>
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subtitle &&
        result.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filteredResults);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const handleSearchFocus = () => {
    setIsOpen(true);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleResultClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearchTerm('');
    if (onClose) onClose();
  };
  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />

          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 sm:text-sm"
          placeholder="Rechercher des matchs, pronostics, canaux..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          autoFocus />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {searchTerm &&
          <button
            className="p-1 text-gray-400 hover:text-gray-500"
            onClick={() => setSearchTerm('')}>

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
                d="M6 18L18 6M6 6l12 12" />

              </svg>
            </button>
          }
          <button
            className="p-1 text-gray-400 hover:text-gray-500 ml-1"
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            title="Recherche avancée">

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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />

            </svg>
          </button>
        </div>
      </div>
      {showAdvancedSearch &&
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mt-2 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
              type="date"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Équipe
              </label>
              <input
              type="text"
              placeholder="Rechercher une équipe..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <select className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">Tous</option>
                <option value="Live">En direct</option>
                <option value="FT">Terminé</option>
                <option value="Scheduled">À venir</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
              Appliquer les filtres
            </button>
          </div>
        </div>
      }
      {isOpen &&
      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
          {isLoading ?
        <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500 dark:border-green-400"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Recherche en cours...
              </p>
            </div> :
        results.length > 0 ?
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.map((result) =>
          <li
            key={result.id}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => handleResultClick(result.path)}>

                  <div className="flex items-center space-x-3">
                    {result.image ?
              <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        <img
                  src={result.image}
                  alt={result.title}
                  className="h-full w-full object-cover" />

                      </div> :

              <div
                className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center
                        ${result.type === 'match' ? 'bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300' : ''}
                        ${result.type === 'prediction' ? 'bg-purple-100 dark:bg-purple-900 text-purple-500 dark:text-purple-300' : ''}
                        ${result.type === 'channel' ? 'bg-green-100 dark:bg-green-900 text-green-500 dark:text-green-300' : ''}
                        ${result.type === 'user' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-500 dark:text-yellow-300' : ''}
                      `}>

                        {result.type === 'match' &&
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
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />

                          </svg>
                }
                        {result.type === 'prediction' &&
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />

                          </svg>
                }
                        {result.type === 'channel' &&
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />

                          </svg>
                }
                        {result.type === 'user' &&
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                          </svg>
                }
                      </div>
              }
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {result.title}
                      </p>
                      {result.subtitle &&
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                }
                    </div>
                    <div className="flex-shrink-0">
                      <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${result.type === 'match' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : ''}
                        ${result.type === 'prediction' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : ''}
                        ${result.type === 'channel' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : ''}
                        ${result.type === 'user' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : ''}
                      `}>

                        {result.type === 'match' ? 'Match' : ''}
                        {result.type === 'prediction' ? 'Prono' : ''}
                        {result.type === 'channel' ? 'Canal' : ''}
                        {result.type === 'user' ? 'Utilisateur' : ''}
                      </span>
                    </div>
                  </div>
                </li>
          )}
            </ul> :
        searchTerm ?
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>Aucun résultat trouvé pour "{searchTerm}"</p>
            </div> :

        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>Commencez à taper pour rechercher</p>
            </div>
        }
        </div>
      }
    </div>);

};
export default SearchBar;