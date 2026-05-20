import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LeagueSidebarProps {
  leagues: { id: number; name: string; logo: string; country: string }[];
}

const HARDCODED_TOP_LEAGUES = [
  { id: 1, name: "Coupe du Monde", logo: "https://media.api-sports.io/football/leagues/1.png" },
  { id: 39, name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
  { id: 2, name: "Ligue des Champions", logo: "https://media.api-sports.io/football/leagues/2.png" },
  { id: 140, name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
  { id: 78, name: "Bundesliga", logo: "https://media.api-sports.io/football/leagues/78.png" },
  { id: 135, name: "Serie A", logo: "https://media.api-sports.io/football/leagues/135.png" },
  { id: 3, name: "Ligue Europa", logo: "https://media.api-sports.io/football/leagues/3.png" },
  { id: 61, name: "Ligue 1", logo: "https://media.api-sports.io/football/leagues/61.png" },
  { id: 45, name: "FA Cup", logo: "https://media.api-sports.io/football/leagues/45.png" },
  { id: 4, name: "Euro", logo: "https://media.api-sports.io/football/leagues/4.png" },
];

const LeagueSidebar: React.FC<LeagueSidebarProps> = ({ leagues }) => {
  const navigate = useNavigate();
  const [allLeaguesExpanded, setAllLeaguesExpanded] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [internationalExpanded, setInternationalExpanded] = useState(true);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());

  const toggleCountry = (country: string) => {
    const newSet = new Set(expandedCountries);
    if (newSet.has(country)) {
      newSet.delete(country);
    } else {
      newSet.add(country);
    }
    setExpandedCountries(newSet);
  };

  // Group leagues into International and Country groups
  const internationalRegions = ['World', 'Europe', 'Asia', 'Africa', 'Oceania', 'North-America', 'South-America'];
  
  const internationalLeagues = leagues
    .filter(league => internationalRegions.includes(league.country))
    .sort((a, b) => a.name.localeCompare(b.name));
    
  const countryLeagues = leagues
    .filter(league => !internationalRegions.includes(league.country));

  // Group by country
  const countryGroups = new Map<string, typeof leagues>();
  countryLeagues.forEach(league => {
    const group = countryGroups.get(league.country) || [];
    group.push(league);
    countryGroups.set(league.country, group);
  });

  // Sort countries alphabetically
  const sortedCountries = Array.from(countryGroups.keys()).sort((a, b) => a.localeCompare(b));

  const filteredInternational = internationalLeagues.filter(league => 
    league.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pr-4 pb-8 hidden lg:block">
      
      {/* Top Leagues */}
      <div className="mb-6 card overflow-hidden border border-slate-100 dark:border-brand-slate bg-white dark:bg-brand-navy-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 px-4 pt-4">Meilleures ligues</h3>
        <ul className="space-y-0.5 pb-2">
          {HARDCODED_TOP_LEAGUES.map((league) => (
            <li key={league.id}>
              <button 
                onClick={() => navigate(`/league/${league.id}`)}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-brand-navy-2 transition-colors text-left group"
              >
                <img src={league.logo} alt={league.name} className="w-5 h-5 object-contain group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-brand-green transition-colors">{league.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* All Leagues */}
      <div className="card overflow-hidden border border-slate-100 dark:border-brand-slate bg-white dark:bg-brand-navy-3">
        <button 
          onClick={() => setAllLeaguesExpanded(!allLeaguesExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-slate-800 dark:text-white hover:text-brand-green transition-colors"
        >
          Toutes les ligues
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform duration-200 ${allLeaguesExpanded ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {allLeaguesExpanded && (
          <div className="mt-2 px-4 pb-4">
             <div className="relative mb-3">
                <input 
                  type="text" 
                  placeholder="Filtre" 
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-brand-navy-1 border border-slate-200 dark:border-brand-slate rounded-full py-1.5 pl-8 pr-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-green"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-2.5 top-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>

             {/* International Group */}
             {filteredInternational.length > 0 && (
               <div className="mb-2">
                 <button 
                   onClick={() => setInternationalExpanded(!internationalExpanded)}
                   className="w-full flex items-center justify-between py-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-green transition-colors"
                 >
                   <div className="flex items-center gap-2">
                     <span>🌍</span>
                     <span>International</span>
                   </div>
                   <svg 
                     xmlns="http://www.w3.org/2000/svg" 
                     className={`h-3 w-3 transition-transform duration-200 ${internationalExpanded ? 'rotate-180' : ''}`} 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor"
                   >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </button>
                 
                 {internationalExpanded && (
                   <ul className="space-y-0.5 mt-1 ml-2 max-h-48 overflow-y-auto no-scrollbar">
                     {filteredInternational.map(league => (
                       <li key={league.id}>
                         <button 
                           onClick={() => navigate(`/league/${league.id}`)}
                           className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-brand-navy-2 transition-colors text-left text-[13px] font-medium text-slate-600 dark:text-brand-text-2"
                         >
                           <img src={league.logo} alt={league.name} className="w-4 h-4 object-contain" />
                           <span className="truncate">{league.name}</span>
                         </button>
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
             )}

             {/* Country Groups */}
             {sortedCountries.map(country => {
               const leaguesInCountry = countryGroups.get(country) || [];
               const filteredLeagues = leaguesInCountry.filter(league => 
                 league.name.toLowerCase().includes(filterQuery.toLowerCase())
               ).sort((a, b) => a.name.localeCompare(b.name));

               if (filteredLeagues.length === 0) return null;

               const isExpanded = expandedCountries.has(country) || filterQuery.length > 0;

               return (
                 <div key={country} className="mb-1">
                   <button 
                     onClick={() => toggleCountry(country)}
                     className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-green transition-colors border-t border-slate-100 dark:border-brand-slate/30 mt-1"
                   >
                     <span>{country}</span>
                     <svg 
                       xmlns="http://www.w3.org/2000/svg" 
                       className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </button>
                   
                   {isExpanded && (
                     <ul className="space-y-0.5 ml-2">
                        {filteredLeagues.map(league => (
                          <li key={league.id}>
                            <button 
                              onClick={() => navigate(`/league/${league.id}`)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-brand-navy-2 transition-colors text-left text-[13px] font-medium text-slate-600 dark:text-brand-text-2"
                            >
                              <img src={league.logo} alt={league.name} className="w-4 h-4 object-contain" />
                              <span className="truncate">{league.name}</span>
                            </button>
                          </li>
                        ))}
                     </ul>
                   )}
                 </div>
               );
             })}
          </div>
        )}
      </div>

    </div>
  );
};

export default LeagueSidebar;
