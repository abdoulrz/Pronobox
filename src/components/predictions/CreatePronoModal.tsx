import React, { useState, useEffect, useRef } from 'react';

export interface PronoSubmissionData {
  match: string;
  market: string;
  pick: string;
  odds: number;
  confidence: number;
  analysis?: string;
  formattedTitle: string;
}

interface CreatePronoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PronoSubmissionData) => void;
}

const DEFAULT_MATCHES = [
  'Real Madrid vs FC Barcelone',
  'PSG vs Olympique de Marseille',
  'Arsenal vs Chelsea',
  'Al Ahly vs Zamalek',
  'Bayern Munich vs Borussia Dortmund',
  'Inter Milan vs AC Milan',
  'Liverpool vs Manchester City',
  'Juventus vs Napoli',
  'AS Monaco vs Lyon',
  'Lille vs Rennes'
];

const MARKETS = [
  { id: '1x2', label: 'Résultat du match (1X2)' },
  { id: 'btts', label: 'Les 2 équipes marquent (BTTS)' },
  { id: 'over_under', label: 'Plus/Moins de buts' },
  { id: 'corners', label: 'Corners' },
  { id: 'cards', label: 'Cartons' }
];

const SUGGESTED_PICKS: Record<string, string[]> = {
  '1x2': ['Victoire Domicile (1)', 'Match Nul (N)', 'Victoire Extérieur (2)'],
  btts: ['Oui (Les 2 marquent)', 'Non'],
  over_under: ['Plus de 2.5 buts', 'Moins de 2.5 buts', 'Plus de 1.5 buts'],
  corners: ['Plus de 8.5 corners', 'Plus de 10.5 corners', 'Plus de 4.5 corners'],
  cards: ['Plus de 3.5 cartons', 'Plus de 4.5 cartons', 'Plus de 2.5 cartons']
};

const CreatePronoModal: React.FC<CreatePronoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [matchList, setMatchList] = useState<string[]>(DEFAULT_MATCHES);
  const [matchQuery, setMatchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const [selectedMarket, setSelectedMarket] = useState('1x2');
  const [pick, setPick] = useState(SUGGESTED_PICKS['1x2'][0]);
  const [odds, setOdds] = useState('1.75');
  const [confidence, setConfidence] = useState(4);
  const [analysis, setAnalysis] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch real live matches from /api/football/matches on modal open
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setLoadingMatches(true);

      fetch(`/api/football/matches?date=${today}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.response && Array.isArray(data.response) && data.response.length > 0) {
            const formattedDbMatches = data.response.map((item: any) => {
              const home = item.teams?.home?.name || 'Équipe 1';
              const away = item.teams?.away?.name || 'Équipe 2';
              return `${home} vs ${away}`;
            });
            const combined = Array.from(new Set([...formattedDbMatches, ...DEFAULT_MATCHES]));
            setMatchList(combined);
          }
        })
        .catch((err) => {
          console.warn('Could not load live football API matches, using defaults:', err);
        })
        .finally(() => {
          setLoadingMatches(false);
        });
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredMatches = matchList.filter((m) =>
    m.toLowerCase().includes(matchQuery.toLowerCase())
  );

  const handleSelectMatch = (matchName: string) => {
    setSelectedMatch(matchName);
    setMatchQuery(matchName);
    setShowDropdown(false);
  };

  const handleMarketChange = (marketId: string) => {
    setSelectedMarket(marketId);
    const suggestions = SUGGESTED_PICKS[marketId] || [];
    setPick(suggestions[0] || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMatch = selectedMatch || matchQuery || 'Match Football';
    const numericOdds = parseFloat(odds) || 1.75;
    const formattedTitle = `${finalMatch} — ${pick} (⏳ en attente)`;

    onSubmit({
      match: finalMatch,
      market: selectedMarket,
      pick,
      odds: numericOdds,
      confidence,
      analysis,
      formattedTitle
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden border border-white/20 shadow-2xl bg-slate-900 text-white flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-green-600/30 via-emerald-700/20 to-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-base font-black tracking-tight">Formulaire de publication structuré</h2>
              <p className="text-[11px] text-slate-400">Canal Administrateur / Tipster</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-slate-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* 1. Real-time Autocomplete Match Search Engine */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. Recherche & Sélection du match
              </label>
              <span className="text-[10px] text-brand-green font-semibold">
                {loadingMatches ? 'Chargement API...' : 'API Matchs Connectée'}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Taper ou chercher un match (ex. Real, PSG, Chelsea...)"
                value={matchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setMatchQuery(e.target.value);
                  setSelectedMatch(e.target.value);
                  setShowDropdown(true);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder-slate-400 focus:outline-none focus:border-brand-green"
                required
              />

              {matchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setMatchQuery('');
                    setSelectedMatch('');
                  }}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Interactive Autocomplete Results Dropdown */}
            {showDropdown && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-700/50">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => handleSelectMatch(m)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedMatch === m
                          ? 'bg-brand-green/20 text-brand-green font-bold'
                          : 'text-slate-200 hover:bg-slate-700/80 hover:text-white'
                      }`}
                    >
                      <span>⚽ {m}</span>
                      {selectedMatch === m && <span>✓</span>}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 italic text-center">
                    Taper pour créer le match "{matchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Market selector */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              2. Sélection du marché
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MARKETS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => handleMarketChange(m.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center border ${
                    selectedMarket === m.id
                      ? 'bg-brand-green text-white border-brand-green shadow-md shadow-green-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Flexible Custom Pick Input + Suggestion Pills */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                3. Issue pronostiquée (Pick libre)
              </label>
              <span className="text-[10px] text-amber-400 font-semibold">Liberté totale</span>
            </div>

            {/* Quick suggested pills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(SUGGESTED_PICKS[selectedMarket] || []).map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => setPick(suggestion)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    pick === suggestion
                      ? 'bg-emerald-500/20 text-brand-green border-brand-green/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Editable Pick text field */}
            <input
              type="text"
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              placeholder="Taper l'issue (ex. Plus de 3.5 corners, Buteur: Mbappe...)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-brand-green"
              required
            />
          </div>

          {/* 4. Odds & Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                Cote (ex. 1.85)
              </label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                max="50"
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-brand-green focus:outline-none focus:border-brand-green"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                Confiance ({confidence}/5)
              </label>
              <div className="flex gap-1 pt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setConfidence(star)}
                    className={`text-xl transition-transform ${
                      star <= confidence ? 'text-amber-400 scale-110' : 'text-slate-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Text analysis */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              Analyse libre & arguments (Optionnel)
            </label>
            <textarea
              rows={3}
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              placeholder="Explique ta stratégie et tes arguments tactiques..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-green text-white shadow-lg shadow-green-500/25 hover:bg-emerald-500 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Publier le Pronostic</span>
              <span>⏳</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreatePronoModal;
