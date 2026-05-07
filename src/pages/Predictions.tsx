import { useState } from 'react';
import { PredictionCard, Prediction } from '../components/predictions/PredictionCard';

const Predictions = () => {
  const [activeTab, setActiveTab] = useState('free');

  const freePredictions: Prediction[] = [
    { id: 1, match: 'Manchester United vs Liverpool', prediction: '+ 22.5 tirs au total', confidence: 85, time: '20:45', date: "Aujourd'hui", league: 'Premier League', teams: { home: { name: 'Manchester United', logo: 'https://via.placeholder.com/100' }, away: { name: 'Liverpool', logo: 'https://via.placeholder.com/100' } } },
    { id: 2, match: 'Barcelona vs Real Madrid', prediction: '+ 12 tirs / 1ère mi-temps', confidence: 80, time: '21:00', date: "Aujourd'hui", league: 'La Liga', teams: { home: { name: 'Barcelona', logo: 'https://via.placeholder.com/100' }, away: { name: 'Real Madrid', logo: 'https://via.placeholder.com/100' } } },
    { id: 3, match: 'Bayern Munich vs Borussia Dortmund', prediction: '+ 7.5 corners', confidence: 75, time: '18:30', date: "Aujourd'hui", league: 'Bundesliga', teams: { home: { name: 'Bayern Munich', logo: 'https://via.placeholder.com/100' }, away: { name: 'Borussia Dortmund', logo: 'https://via.placeholder.com/100' } } },
  ];

  const proResources: Prediction[] = [
    { id: 1, match: 'Juventus vs Inter Milan', prediction: '+ 4.5 cartons jaunes', confidence: 95, locked: true, time: '19:30', date: "Aujourd'hui", league: 'Serie A', teams: { home: { name: 'Juventus', logo: 'https://via.placeholder.com/100' }, away: { name: 'Inter Milan', logo: 'https://via.placeholder.com/100' } } },
    { id: 2, match: 'PSG vs Marseille', prediction: '+ 15.5 tirs cadrés total', confidence: 90, locked: true, time: '20:00', date: "Aujourd'hui", league: 'Ligue 1', teams: { home: { name: 'PSG', logo: 'https://via.placeholder.com/100' }, away: { name: 'Marseille', logo: 'https://via.placeholder.com/100' } } },
    { id: 3, match: 'Arsenal vs Tottenham', prediction: '+ 3.5 buts total match', confidence: 88, locked: true, time: '17:30', date: "Aujourd'hui", league: 'Premier League', teams: { home: { name: 'Arsenal', logo: 'https://via.placeholder.com/100' }, away: { name: 'Tottenham', logo: 'https://via.placeholder.com/100' } } },
  ];

  return (
    <div className="container mx-auto px-4 py-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">IA Pronos</h2>

      {/* Tab header — green gradient bar */}
      <div className="prono-tab-header rounded-xl overflow-hidden mb-4">
        <div className="flex">
          <button
            title="Afficher les pronostics gratuits"
            className={`flex-1 py-3 text-sm font-bold transition-all duration-200 ${activeTab === 'free' ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-400 dark:text-slate-500 hover:text-brand-green'}`}
            onClick={() => setActiveTab('free')}
          >
            Gratuits
          </button>
          <button
            title="Afficher les pronostics premium"
            className={`flex-1 py-3 text-sm font-bold transition-all duration-200 ${activeTab === 'premium' ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-400 dark:text-slate-500 hover:text-brand-green'}`}
            onClick={() => setActiveTab('premium')}
          >
            ✦ Premium
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {activeTab === 'free'
          ? freePredictions.map((p) => <PredictionCard key={p.id} prediction={p} isPro={false} />)
          : proResources.map((p) => <PredictionCard key={p.id} prediction={p} isPro={true} />)
        }
      </div>
    </div>
  );
};

export default Predictions;