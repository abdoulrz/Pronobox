import React from 'react';
import { NewsArticle } from '../../services/api';
import SafeImage from '../common/SafeImage';

interface NewsDetailOverlayProps {
  article: NewsArticle;
  existingDebateId?: string;
  isChannelOwner: boolean;
  onClose: () => void;
  onDebattre: (article: NewsArticle) => void;
  onViewDebate: (debateId: string) => void;
}

const NewsDetailOverlay: React.FC<NewsDetailOverlayProps> = ({
  article,
  existingDebateId,
  isChannelOwner,
  onClose,
  onDebattre,
  onViewDebate
}) => {
  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
          title="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Image */}
        <div className="w-full h-64 sm:h-80 relative flex-shrink-0 bg-slate-100 dark:bg-slate-900">
          <SafeImage 
            src={article.image || 'https://images.unsplash.com/photo-1508098682722-e99c643e7f76?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            {article.source && (
              <span className="bg-blue-600/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                {article.source}
              </span>
            )}
            {article.pubDate && (
              <span className="bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-md">
                {new Date(article.pubDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {article.title}
          </h2>
          
          <div className="prose dark:prose-invert max-w-none mb-8">
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-line">
              {article.description}
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Lire sur {article.source || 'le site'}
          </a>

          {existingDebateId ? (
            <button
              onClick={() => {
                onViewDebate(existingDebateId);
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Voir le débat existant
            </button>
          ) : isChannelOwner ? (
            <button
              onClick={() => {
                onDebattre(article);
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 bg-brand-green hover:bg-green-500 text-white transition-colors shadow-md shadow-brand-green/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Lancer un débat
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NewsDetailOverlay;
