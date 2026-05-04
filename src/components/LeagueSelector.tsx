import React, { useState } from 'react';
interface LeagueSelectorProps {
  onSelectLeague: (league: string | null) => void;
  selectedLeague: string | null;
}
const LeagueSelector: React.FC<LeagueSelectorProps> = ({
  onSelectLeague,
  selectedLeague
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const leagues = [
  {
    id: 'ligue1',
    name: 'Ligue 1',
    flag: '🇫🇷'
  },
  {
    id: 'premier-league',
    name: 'Premier League',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    flag: '🇪🇸'
  },
  {
    id: 'bundesliga',
    name: 'Bundesliga',
    flag: '🇩🇪'
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    flag: '🇮🇹'
  }];

  const handleSelectLeague = (leagueName: string) => {
    if (selectedLeague === leagueName) {
      onSelectLeague(null);
    } else {
      onSelectLeague(leagueName);
    }
    setIsOpen(false);
  };
  const selectedLeagueData = leagues.find(
    (league) => league.name === selectedLeague
  );
  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-green-500"
        onClick={() => setIsOpen(!isOpen)}>

        {selectedLeagueData ?
        <>
            <span>{selectedLeagueData.flag}</span>
            <span>{selectedLeagueData.name}</span>
          </> :

        <>
            <span>🌍</span>
            <span>Toutes les ligues</span>
          </>
        }
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7" />

        </svg>
      </button>
      {isOpen &&
      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${!selectedLeague ? 'bg-green-50 text-green-700' : ''}`}
            onClick={() => handleSelectLeague('')}>

              <span>🌍</span>
              <span>Toutes les ligues</span>
            </button>
            {leagues.map((league) =>
          <button
            key={league.id}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 ${selectedLeague === league.name ? 'bg-green-50 text-green-700' : ''}`}
            onClick={() => handleSelectLeague(league.name)}>

                <span>{league.flag}</span>
                <span>{league.name}</span>
              </button>
          )}
          </div>
        </div>
      }
    </div>);

};
export default LeagueSelector;