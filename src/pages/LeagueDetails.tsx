import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface StandingsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: any[][];
  };
}

const TOURNAMENT_SEASONS: Record<number, number> = {
  1: 2022, // World Cup
  4: 2024, // Euro
  9: 2024, // Copa America
  6: 2023, // Africa Cup of Nations
  21: 2022, // Confederation Cup
};

const LeagueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'standings' | 'matches'>('standings');
  const [data, setData] = useState<StandingsResponse | null>(null);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeagueData = async (leagueId: string, seasonYear: number, attempts = 0) => {
    try {
      if (attempts === 0) setLoading(true);
      
      console.log(`Fetching data for league ${leagueId} in season ${seasonYear} (Attempt ${attempts + 1})`);
      const res = await fetch(`/api/football/standings/${leagueId}/${seasonYear}`);
      const json = await res.json();
      
      if (json.response && json.response.length > 0) {
        setData(json.response[0]);
        setError(null);
        
        // Fetch fixtures
        const fixtureRes = await fetch(`/api/football/fixtures/${leagueId}/${seasonYear}`);
        const fixtureJson = await fixtureRes.json();
        if (fixtureJson.response) {
          const allFixtures = fixtureJson.response.sort((a: any, b: any) => 
            new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
          );
          const now = new Date().getTime();
          const pastMatches = allFixtures.filter((m: any) => new Date(m.fixture.date).getTime() < now);
          const futureMatches = allFixtures.filter((m: any) => new Date(m.fixture.date).getTime() >= now).reverse();
          const displayFixtures = [...futureMatches.slice(0, 10).reverse(), ...pastMatches.slice(0, 10)];
          setFixtures(displayFixtures);
        }
        setLoading(false);
      } else if (attempts < 3 && seasonYear > 2018) {
        // Try up to 3 previous seasons if no data found
        console.log(`No data for ${seasonYear}, trying ${seasonYear - 1}...`);
        fetchLeagueData(leagueId, seasonYear - 1, attempts + 1);
      } else {
        const apiError = json.errors && (typeof json.errors === 'object' ? Object.values(json.errors)[0] : json.errors);
        setError(typeof apiError === 'string' ? apiError : "Aucune donnée disponible pour cette ligue.");
        setLoading(false);
      }
    } catch (err) {
      if (attempts >= 3) {
        setError("Erreur de chargement.");
        setLoading(false);
      } else {
        fetchLeagueData(leagueId, seasonYear - 1, attempts + 1);
      }
    }
  };

  useEffect(() => {
    if (id) {
      const leagueIdNum = parseInt(id);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      
      // Determine initial season
      let initialSeason = TOURNAMENT_SEASONS[leagueIdNum] || (currentMonth < 6 ? currentYear - 1 : currentYear);
      
      // Cap at 2024 for Free Tier
      if (initialSeason > 2024) initialSeason = 2024;
      
      fetchLeagueData(id, initialSeason);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 font-medium">{error || 'Erreur'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-brand-green">Retour</button>
      </div>
    );
  }

  const standings = data.league.standings[0] || [];

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate p-6 mb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-brand-navy-3 transition-colors mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="w-16 h-16 shrink-0 bg-slate-50 dark:bg-brand-navy-1 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-brand-slate/50">
            <img src={data.league.logo} alt={data.league.name} className="w-full h-full object-contain" />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              {data.league.name}
              {data.league.flag && <img src={data.league.flag} alt={data.league.country} className="h-5 rounded-sm shadow-sm" />}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{data.league.country} • Saison {data.league.season}/{data.league.season + 1}</p>
          </div>
          
          <button className="px-6 py-2 rounded-full bg-slate-800 dark:bg-white text-white dark:text-brand-navy-1 font-bold text-sm hover:opacity-90 transition-opacity">
            Suivre
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mt-8 border-b border-slate-100 dark:border-brand-slate/50">
          <button 
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'standings' ? 'border-slate-800 dark:border-white text-slate-800 dark:text-white' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('standings')}
          >
            Classement
          </button>
          <button 
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'matches' ? 'border-slate-800 dark:border-white text-slate-800 dark:text-white' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('matches')}
          >
            Matchs
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-brand-navy-2 rounded-2xl shadow-sm border border-slate-200 dark:border-brand-slate overflow-hidden">
        {activeTab === 'standings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-brand-navy-3/50 text-slate-400 dark:text-slate-500 text-xs uppercase font-bold border-b border-slate-100 dark:border-brand-slate/50">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Équipe</th>
                  <th className="px-2 py-3 text-center" title="Joués">J</th>
                  <th className="px-2 py-3 text-center" title="Gagnés">G</th>
                  <th className="px-2 py-3 text-center" title="Nuls">N</th>
                  <th className="px-2 py-3 text-center" title="Perdus">P</th>
                  <th className="px-2 py-3 text-center" title="Différence">+ / -</th>
                  <th className="px-4 py-3 text-center text-slate-800 dark:text-white font-black">PTS</th>
                  <th className="px-4 py-3 hidden md:table-cell">Forme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-brand-slate/50">
                {standings.map((teamData: any) => (
                  <tr key={teamData.team.id} className="hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors">
                    <td className="px-4 py-3 text-center font-medium text-slate-500">{teamData.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={teamData.team.logo} alt={teamData.team.name} className="w-6 h-6 object-contain" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{teamData.team.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center text-slate-500">{teamData.all.played}</td>
                    <td className="px-2 py-3 text-center text-slate-500">{teamData.all.win}</td>
                    <td className="px-2 py-3 text-center text-slate-500">{teamData.all.draw}</td>
                    <td className="px-2 py-3 text-center text-slate-500">{teamData.all.lose}</td>
                    <td className="px-2 py-3 text-center text-slate-500">{teamData.goalsDiff > 0 ? `+${teamData.goalsDiff}` : teamData.goalsDiff}</td>
                    <td className="px-4 py-3 text-center font-black text-slate-800 dark:text-white">{teamData.points}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        {teamData.form?.split('').map((f: string, i: number) => {
                          let bgColor = "bg-slate-200 text-slate-500"; // Draw or unknown
                          if (f === 'W') bgColor = "bg-brand-green text-white"; // Win
                          if (f === 'L') bgColor = "bg-red-500 text-white"; // Loss
                          return (
                            <span key={i} className={`w-5 h-5 flex items-center justify-center rounded-[4px] text-[10px] font-bold ${bgColor}`}>
                              {f === 'W' ? 'V' : f === 'L' ? 'D' : 'N'}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="p-0">
            {fixtures.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Aucun match récent ou à venir trouvé.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-brand-slate/50">
                {fixtures.map((match) => {
                  const date = new Date(match.fixture.date);
                  const isFinished = match.fixture.status.short === 'FT';
                  return (
                    <div 
                      key={match.fixture.id} 
                      className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-brand-navy-3/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/match/${match.fixture.id}`)}
                    >
                      <div className="text-xs text-slate-400 w-24">
                        {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        <br />
                        {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      
                      <div className="flex-1 flex items-center justify-end gap-3 pr-6 border-r border-slate-100 dark:border-brand-slate/50">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{match.teams.home.name}</span>
                        <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-6 h-6 object-contain" />
                      </div>
                      
                      <div className="w-20 text-center font-bold text-slate-800 dark:text-white mx-2">
                        {isFinished ? (
                          <div className="bg-brand-navy-2 dark:bg-brand-navy-1 px-3 py-1 text-white rounded-lg inline-block">
                            {match.goals.home} - {match.goals.away}
                          </div>
                        ) : (
                          <span className="text-slate-400">vs</span>
                        )}
                      </div>
                      
                      <div className="flex-1 flex items-center gap-3 pl-6">
                        <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-6 h-6 object-contain" />
                        <span className="font-bold text-slate-700 dark:text-slate-200">{match.teams.away.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueDetails;
