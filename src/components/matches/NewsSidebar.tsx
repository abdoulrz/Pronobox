import React, { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  image: string;
}

const NewsSidebar: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        setNews(data.slice(0, 5)); // Show top 5
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="w-80 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pl-4 pb-8 hidden xl:block">
      
      {/* PronosBox Pro Ad / Widget */}
      <div className="card p-4 mb-6 bg-gradient-to-br from-brand-green/20 to-brand-green/5 dark:from-brand-green/10 dark:to-brand-navy-2 border border-brand-green/20">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Passe au niveau supérieur</h3>
        <p className="text-xs text-slate-700 dark:text-brand-text-2 mb-3">Débloque les Pronos et les canaux VIP.</p>
        <button className="w-full btn-primary py-1.5 text-xs">Devenir Pro</button>
      </div>

      {/* News List */}
      <div className="card bg-white dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-brand-slate">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Actualités</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-brand-slate/50">
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">Chargement...</div>
          ) : news.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">Aucune actualité disponible</div>
          ) : (
            news.map((item, index) => (
              <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-slate-50 dark:hover:bg-brand-navy-2 transition-colors group">
                <div className="w-full h-32 rounded-lg overflow-hidden mb-3 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug mb-2 group-hover:text-brand-green transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center text-[11px] text-slate-500 dark:text-brand-text-3 gap-2">
                  <span className="font-medium">Sports.fr</span>
                  <span>•</span>
                  <span>{new Date(item.pubDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </a>
            ))
          )}
        </div>
        <a href="https://www.sports.fr/football/" target="_blank" rel="noopener noreferrer" className="block text-center py-3 text-xs font-semibold text-brand-green hover:bg-brand-green/5 transition-colors border-t border-slate-100 dark:border-brand-slate">
          Voir toutes les actualités
        </a>
      </div>

    </div>
  );
};

export default NewsSidebar;
