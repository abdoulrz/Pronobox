import React, { useState, useEffect, useRef } from 'react';

export interface PronoSubmissionData {
  match: string;
  market: string;
  pick: string;
  odds?: number;
  confidence: number;
  analysis?: string;
  formattedTitle: string;
  matchId?: string | number;
  matchDate?: string | Date;
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

export interface PronoOption {
  id: string;
  code: string;
  badge: string;
  title: string;
  fullPick: string;
  description: string;
}

export function getProno6Options(matchString: string): PronoOption[] {
  let homeTeam = 'Équipe 1';
  let awayTeam = 'Équipe 2';

  if (matchString && matchString.includes(' vs ')) {
    const parts = matchString.split(' vs ');
    if (parts[0]) homeTeam = parts[0].trim();
    if (parts[1]) awayTeam = parts[1].trim();
  }

  return [
    {
      id: 'V1',
      code: 'V1',
      badge: 'V1',
      title: `Victoire ${homeTeam}`,
      fullPick: `V1 - Victoire ${homeTeam}`,
      description: `Gagné si ${homeTeam} gagne`
    },
    {
      id: '1X',
      code: '1X',
      badge: '1X',
      title: `${homeTeam} ou Nul`,
      fullPick: `1X - ${homeTeam} ou Nul`,
      description: `Gagné si ${homeTeam} gagne ou Nul`
    },
    {
      id: 'X',
      code: 'X',
      badge: 'X',
      title: 'Match Nul',
      fullPick: 'X - Match Nul',
      description: 'Gagné s\'il y a Match Nul'
    },
    {
      id: '2X',
      code: '2X',
      badge: '2X',
      title: `${awayTeam} ou Nul`,
      fullPick: `2X - ${awayTeam} ou Nul`,
      description: `Gagné si ${awayTeam} gagne ou Nul`
    },
    {
      id: 'V2',
      code: 'V2',
      badge: 'V2',
      title: `Victoire ${awayTeam}`,
      fullPick: `V2 - Victoire ${awayTeam}`,
      description: `Gagné si ${awayTeam} gagne`
    },
    {
      id: '12',
      code: '12',
      badge: '12',
      title: `Victoire ${homeTeam} ou ${awayTeam}`,
      fullPick: `12 - ${homeTeam} ou ${awayTeam}`,
      description: `Gagné si une équipe gagne (Pas de Nul)`
    }
  ];
}

const CreatePronoModal: React.FC<CreatePronoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const defaultMatchObjects = DEFAULT_MATCHES.map((name, i) => ({ id: `default-${i}`, name, matchDate: new Date() }));
  const [matchList, setMatchList] = useState<{ id: string | number; name: string; matchDate?: string | Date; league?: string }[]>(defaultMatchObjects);
  const [matchQuery, setMatchQuery] = useState('');
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMatch, setSelectedMatch] = useState<{ id: string | number; name: string; matchDate?: string | Date; league?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const [selectedOptionId, setSelectedOptionId] = useState('V1');
  const [pick, setPick] = useState('');
  const [confidence, setConfidence] = useState(80);
  const [analysis, setAnalysis] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchMatchesForDate = (dateStr: string) => {
    if (!dateStr) return;
    setLoadingMatches(true);

    fetch(`/api/football/matches?date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.response && Array.isArray(data.response) && data.response.length > 0) {
          const formattedDbMatches = data.response.map((item: any) => {
            const home = item.teams?.home?.name || 'Équipe 1';
            const away = item.teams?.away?.name || 'Équipe 2';
            return {
              id: item.fixture?.id || Date.now(),
              name: `${home} vs ${away}`,
              matchDate: item.fixture?.date || dateStr,
              league: item.league?.name || ''
            };
          });
          
          const uniqueMatches = Array.from(new Map(formattedDbMatches.map(m => [m.name, m])).values());
          setMatchList(uniqueMatches);
        } else {
          setMatchList(defaultMatchObjects);
        }
      })
      .catch((err) => {
        console.warn('Could not load live football API matches, using defaults:', err);
        setMatchList(defaultMatchObjects);
      })
      .finally(() => {
        setLoadingMatches(false);
      });
  };

  // Fetch real matches for selected date when modal opens or date changes
  useEffect(() => {
    if (isOpen) {
      fetchMatchesForDate(searchDate);
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
    m.name.toLowerCase().includes(matchQuery.toLowerCase())
  );

  const currentMatchName = selectedMatch ? selectedMatch.name : matchQuery;
  const options6 = getProno6Options(currentMatchName);

  const handleSelectMatch = (match: { id: string | number; name: string; matchDate?: string | Date; league?: string }) => {
    setSelectedMatch(match);
    setMatchQuery(match.name);
    setShowDropdown(false);
    
    // Auto-update pick option based on newly selected match
    const opts = getProno6Options(match.name);
    const matchedOpt = opts.find(o => o.id === selectedOptionId) || opts[0];
    if (matchedOpt) {
      setPick(matchedOpt.fullPick);
    }
  };

  const handleSelectOption = (opt: PronoOption) => {
    setSelectedOptionId(opt.id);
    setPick(opt.fullPick);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMatch = selectedMatch ? selectedMatch.name : (matchQuery || 'Match Football');
    const finalMatchId = selectedMatch && typeof selectedMatch.id === 'number' ? selectedMatch.id : undefined;
    const finalMatchDate = selectedMatch?.matchDate || new Date(searchDate);
    
    const finalPick = pick || (options6[0]?.fullPick || 'V1');
    const formattedTitle = `${finalMatch} — ${finalPick} (⏳ en attente)`;

    onSubmit({
      match: finalMatch,
      market: selectedOptionId,
      pick: finalPick,
      confidence,
      analysis,
      formattedTitle,
      matchId: finalMatchId,
      matchDate: finalMatchDate
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
          
          {/* 1. Real-time Autocomplete Match Search Engine with Date Selector */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                1. Recherche & Sélection du match
              </label>
              <span className="text-[10px] text-brand-green font-semibold">
                {loadingMatches ? 'Chargement API...' : 'API Matchs Connectée'}
              </span>
            </div>

            {/* Date Selector Row */}
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => {
                    setSearchDate(e.target.value);
                    fetchMatchesForDate(e.target.value);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:outline-none focus:border-brand-green"
                />
              </div>
              <button
                type="button"
                onClick={() => fetchMatchesForDate(searchDate)}
                disabled={loadingMatches}
                className="bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border border-brand-green/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {loadingMatches ? '...' : 'Actualiser'}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Taper ou chercher un match (ex. Real, PSG, Chelsea...)"
                value={matchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setMatchQuery(e.target.value);
                  setSelectedMatch(null);
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
                      key={m.id}
                      onClick={() => handleSelectMatch(m)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${
                        selectedMatch?.id === m.id
                          ? 'bg-brand-green/20 text-brand-green font-bold'
                          : 'text-slate-200 hover:bg-slate-700/80 hover:text-white'
                      }`}
                    >
                      <span>⚽ {m.name}</span>
                      {selectedMatch?.id === m.id && <span>✓</span>}
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

          {/* 2. Simplified 6-Option Pronostics Grid */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                2. Issue Pronostiquée (6 Choix Automatisés)
              </label>
              <span className="text-[10px] text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20">
                100% Vérifiable
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
              {options6.map((opt) => {
                const isSelected = selectedOptionId === opt.id || pick === opt.fullPick;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-brand-green/15 border-brand-green shadow-lg shadow-green-500/10'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-black tracking-wider ${
                        isSelected ? 'bg-brand-green text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {opt.badge}
                      </span>
                      {isSelected && <span className="text-brand-green font-black text-xs">✓</span>}
                    </div>
                    <div>
                      <div className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {opt.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium leading-tight">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Editable Pick Text Field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Intitulé exact du pronostic
              </label>
              <input
                type="text"
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                placeholder="Ex. V1 - Victoire Barça"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-brand-green"
                required
              />
            </div>
          </div>

          {/* 4. Confidence */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              4. Confiance ({confidence}%)
            </label>
            <div className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-green focus:outline-none"
              />
              <span className="ml-auto text-xs font-bold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-lg min-w-[45px] text-center">
                {confidence}%
              </span>
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
