import React from 'react';
import { Debate, Message, Reply } from '../../types/news';

interface DebateDetailViewProps {
  debate: Debate;
  currentUserId: number | string;
  activeImageIndex: number;
  replyToMessage: { id: number | string; user: string } | null;
  debateInput: string;
  onBack: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onLikeDebate: (e: React.MouseEvent, debateId: number | string) => void;
  onLikeMessage: (debateId: number | string, messageId: number | string) => void;
  onLikeReply: (debateId: number | string, messageId: number | string, replyId: number | string) => void;
  onReply: (debateId: number | string, messageId: number | string, user: string) => void;
  onCancelReply: () => void;
  onNavigateCarousel: (direction: 'prev' | 'next', imageCount: number) => void;
  onSetImageIndex: (index: number) => void;
  onOpenEdit: (debateId: number | string) => void;
  onRequestDelete: (debateId: number | string) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent, imageCount: number) => void;
}

const DebateDetailView: React.FC<DebateDetailViewProps> = ({
  debate,
  currentUserId,
  activeImageIndex,
  replyToMessage,
  debateInput,
  onBack,
  onInputChange,
  onSend,
  onLikeDebate,
  onLikeMessage,
  onLikeReply,
  onReply,
  onCancelReply,
  onNavigateCarousel,
  onSetImageIndex,
  onOpenEdit,
  onRequestDelete,
  onTouchStart,
  onTouchEnd,
}) => {
  const isLiked = debate.likedBy.some(id => String(id) === String(currentUserId));

  return (
    <div className="animate-slide-up">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-brand-text-2 hover:text-brand-green transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour aux débats
      </button>

      {/* Image carousel */}
      <div className="relative h-48 mb-4 rounded-xl overflow-hidden shadow-lg">
        <div
          className="relative w-full h-full"
          onTouchStart={onTouchStart}
          onTouchEnd={(e) => onTouchEnd(e, debate.images.length)}
        >
          <img
            src={debate.images[activeImageIndex]}
            alt={debate.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {debate.images.length > 1 && (
            <>
              {/* Dots pagination */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {debate.images.map((_: string, index: number) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === activeImageIndex ? 'bg-white scale-110' : 'bg-white/50'
                    }`}
                    onClick={(e) => { e.stopPropagation(); onSetImageIndex(index); }}
                    aria-label={`Image ${index + 1}`}
                  />
                ))}
              </div>
              {/* Counter */}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                {activeImageIndex + 1}/{debate.images.length}
              </div>
              {/* Arrow buttons */}
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
                onClick={(e) => { e.stopPropagation(); onNavigateCarousel('prev', debate.images.length); }}
                aria-label="Image précédente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
                onClick={(e) => { e.stopPropagation(); onNavigateCarousel('next', debate.images.length); }}
                aria-label="Image suivante"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Gradient overlay with debate info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4 pointer-events-none">
          <div className="flex items-center justify-between mb-2 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-green/20 text-green-300 border border-brand-green/30">
                {debate.category}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/60">
                  <img src={debate.author.avatar} alt={debate.author.username} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-white">{debate.author.username}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Like button */}
              <button
                className={`flex items-center gap-1.5 ${
                  isLiked ? 'bg-red-500/20 text-red-500' : 'bg-white/20 hover:bg-white/30 text-white'
                } px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95`}
                onClick={(e) => onLikeDebate(e, debate.id)}
                aria-label={isLiked ? 'Ne plus aimer ce débat' : "J'aime ce débat"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${isLiked ? 'fill-current animate-pulse-heart' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {debate.likes}
              </button>

              {/* Author actions */}
              {debate.author.id === currentUserId && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenEdit(debate.id); }}
                    className="text-xs bg-white text-brand-green-dark px-2 py-1 rounded-full font-medium hover:bg-gray-100 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRequestDelete(debate.id); }}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-medium hover:bg-red-600 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-white text-xl font-bold leading-tight">{debate.title}</h2>
          <p className="text-white/80 text-sm mt-1">{debate.description}</p>
        </div>
      </div>

      {/* Messages list */}
      <div className="space-y-3 mb-4">
        {debate.messages.map((message: Message) => (
          <div
            key={message.id}
            className="card p-3 hover:border-brand-green/20 transition-colors"
          >
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-brand-slate">
                <img src={message.avatar} alt={message.user} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-slate-900 dark:text-brand-text-1">{message.user}</span>
                  <span className="text-xs text-slate-400 dark:text-brand-text-3 ml-2 flex-shrink-0">{message.time}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-brand-text-2 mb-2">{message.text}</p>

                {/* Message actions */}
                <div className="flex items-center gap-4 text-xs">
                  <button
                    className={`flex items-center gap-1 transition-colors ${
                      message.likedBy?.some(id => String(id) === String(currentUserId)) ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-brand-text-3 hover:text-red-500'
                    }`}
                    onClick={(e) => { e.stopPropagation(); onLikeMessage(debate.id, message.id); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${message.likedBy?.some(id => String(id) === String(currentUserId)) ? 'fill-current animate-pulse-heart' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {message.likes}
                  </button>
                  <button
                    className="flex items-center gap-1 hover:text-brand-green transition-colors"
                    onClick={(e) => { e.stopPropagation(); onReply(debate.id, message.id, message.user); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Répondre
                  </button>
                </div>

                {/* Replies */}
                {message.replies && message.replies.length > 0 && (
                  <div className="mt-3 pl-3 border-l-2 border-slate-200 dark:border-brand-slate space-y-2">
                    <p className="text-xs text-slate-400 dark:text-brand-text-3 mb-1">Réponses</p>
                    {message.replies.map((reply: Reply) => (
                      <div key={reply.id} className="bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate rounded-lg p-2">
                        <div className="flex gap-1.5">
                          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-brand-slate">
                            <img src={reply.avatar} alt={reply.user} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <span className="font-semibold text-xs text-slate-900 dark:text-brand-text-1">{reply.user}</span>
                              <span className="text-xs text-slate-400 dark:text-brand-text-3">{reply.time}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-brand-text-2 mb-1">{reply.text}</p>
                            <button
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                reply.likedBy?.some(id => String(id) === String(currentUserId)) ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-brand-text-3 hover:text-red-500'
                              }`}
                              onClick={(e) => { e.stopPropagation(); onLikeReply(debate.id, message.id, reply.id); }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${reply.likedBy?.some(id => String(id) === String(currentUserId)) ? 'fill-current animate-pulse-heart' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {reply.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply indicator */}
      {replyToMessage && (
        <div className="mb-2 px-3 py-2 bg-brand-green/10 border border-brand-green/20 rounded-lg flex justify-between items-center text-sm">
          <span className="text-slate-700 dark:text-brand-text-2">
            Répondre à <strong className="text-brand-green">{replyToMessage.user}</strong>
          </span>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-brand-red transition-colors"
            title="Annuler la réponse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="flex gap-2">
        <input
          id="debate-input"
          type="text"
          className="flex-1 input-dark rounded-xl px-4 py-2.5 text-sm"
          placeholder={replyToMessage ? 'Écrivez votre réponse...' : 'Participez au débat...'}
          value={debateInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
        />
        <button
          className="btn-primary text-sm px-4 py-2 rounded-xl"
          onClick={onSend}
          aria-label="Envoyer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DebateDetailView;
