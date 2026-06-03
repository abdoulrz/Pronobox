import React, { useRef } from 'react';
import { NewsArticle, Debate } from '../../services/api';
import SafeImage from '../common/SafeImage';

interface NewsCarouselProps {
  articles: NewsArticle[];
  debates: Debate[];
  isChannelOwner: boolean;
  onArticleClick: (article: NewsArticle) => void;
  onDebattre: (article: NewsArticle) => void;
}

const NewsCarousel: React.FC<NewsCarouselProps> = ({
  articles,
  debates,
  isChannelOwner,
  onArticleClick,
  onDebattre
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (articles.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 px-1">
          <span className="text-xl">📰</span> À la Une
        </h3>
        <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
          Aucune actualité disponible pour le moment.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 relative group">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">📰</span> À la Une
        </h3>
        
        {/* Desktop navigation arrows */}
        <div className="hidden sm:flex items-center gap-1">
          <button 
            onClick={scrollLeft}
            className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={scrollRight}
            className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-1 px-1 -mx-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map((article, index) => {
          const hasExistingDebate = debates.some(d => d.sourceArticle?.articleId === article.id);

          return (
            <div 
              key={article.id || index}
              className="flex-shrink-0 w-[240px] sm:w-[280px] h-[160px] snap-start relative rounded-xl overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02] hover:shadow-lg shadow-sm bg-slate-200 dark:bg-slate-700"
              onClick={() => onArticleClick(article)}
            >
              {/* Image */}
              <SafeImage 
                src={article.image || 'https://images.unsplash.com/photo-1508098682722-e99c643e7f76?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Badges top */}
              <div className="absolute top-2 left-2 flex gap-1">
                {article.source && (
                  <span className="bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {article.source}
                  </span>
                )}
                {hasExistingDebate && (
                  <span className="bg-brand-green/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </span>
                )}
              </div>

              {/* Content bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end">
                <h4 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-2 text-shadow-sm">
                  {article.title}
                </h4>
                
                {isChannelOwner && !hasExistingDebate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDebattre(article);
                    }}
                    className="self-start text-[11px] font-semibold bg-brand-green hover:bg-green-500 text-white px-2.5 py-1 rounded-full shadow-md transition-colors"
                  >
                    💬 Débattre
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsCarousel;
