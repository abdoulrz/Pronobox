import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Debate, Message, Reply } from '../../services/api';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    onInputChange(debateInput + emojiData.emoji);
  };

  const isLiked = (debate.likedBy || []).some(id => String(id) === String(currentUserId));

  const formatMessageText = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(@[a-zA-Z0-9_.-]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 px-1 py-0.5 rounded cursor-pointer hover:underline"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

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

      {/* Facebook-style header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700/50 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-brand-slate shadow-sm">
            <img src={debate.author.avatar} alt={debate.author.username} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{debate.author.username}</span>
              <span className="text-[10px] bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">
                {debate.category}
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {debate.createdAt ? new Date(debate.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              }) : "À l'instant"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Author actions */}
          {debate.author.id === currentUserId && (
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onOpenEdit(debate.id); }}
                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-brand-text-2 px-2.5 py-1.5 rounded-full font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRequestDelete(debate.id); }}
                className="text-xs bg-red-500 text-white px-2.5 py-1.5 rounded-full font-medium hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Description with "Voir plus" toggle */}
      <div className="mb-4">
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-2">{debate.title}</h2>
        <div className="text-slate-700 dark:text-brand-text-2 text-sm whitespace-pre-line leading-relaxed">
          {showFullDesc || debate.description.length <= 250 ? (
            debate.description
          ) : (
            <>
              {debate.description.slice(0, 250)}...
              <button
                onClick={() => setShowFullDesc(true)}
                className="text-green-600 hover:underline ml-1 font-semibold focus:outline-none"
              >
                Voir plus
              </button>
            </>
          )}
          {showFullDesc && debate.description.length > 250 && (
            <button
              onClick={() => setShowFullDesc(false)}
              className="text-green-600 hover:underline ml-1 font-semibold focus:outline-none"
            >
              Voir moins
            </button>
          )}
        </div>
      </div>

      {/* Image carousel / Media section below text */}
      {debate.images && debate.images.length > 0 && (
        <div className="relative w-full max-h-[350px] mb-6 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
          <div
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchEnd={(e) => onTouchEnd(e, debate.images.length)}
          >
            <img
              src={debate.images[activeImageIndex]}
              alt={debate.title}
              className="max-h-[350px] w-full object-contain transition-opacity duration-300"
            />

            {debate.images.length > 1 && (
              <>
                {/* Dots pagination */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-black/40 px-2 py-1 rounded-full">
                  {debate.images.map((_: string, index: number) => (
                    <button
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                        index === activeImageIndex ? 'bg-white scale-110' : 'bg-white/50'
                      }`}
                      onClick={(e) => { e.stopPropagation(); onSetImageIndex(index); }}
                      aria-label={`Image ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Counter */}
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-semibold z-10">
                  {activeImageIndex + 1}/{debate.images.length}
                </div>
                {/* Arrow buttons */}
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); onNavigateCarousel('prev', debate.images.length); }}
                  aria-label="Image précédente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors z-10"
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
        </div>
      )}

      {/* Action Bar: Likes & Comments */}
      <div className="flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-800/60 py-3 mb-4 mt-2">
        <button
          onClick={(e) => onLikeDebate(e, debate.id)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
            isLiked
              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
          }`}
          aria-label={isLiked ? 'Ne plus aimer ce débat' : "J'aime ce débat"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isLiked ? 'fill-current text-red-500 animate-pulse-heart' : 'fill-none'}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="font-semibold">{isLiked ? 'Aimé' : "J'aime"}</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
            {debate.likes}
          </span>
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{debate.messages.length} {debate.messages.length > 1 ? 'commentaires' : 'commentaire'}</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="space-y-3 mb-4">
        {debate.messages.map((message: Message) => {
          // Robust user data extraction for messages (populated objects vs strings)
          const msgUser = typeof message.user === 'object' && message.user !== null 
            ? (message.user as any).username 
            : (message.user || message.author || 'Anonyme');
            
          const msgAvatar = typeof message.user === 'object' && message.user !== null 
            ? (message.user as any).avatar 
            : (message.avatar || '');
            
          const msgTime = message.time || 
            ((message as any).createdAt ? new Date((message as any).createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "à l'instant");

          const msgId = message.id || (message as any)._id;
          return (
            <div
              key={msgId}
              className="card p-3 hover:border-brand-green/20 transition-colors"
            >
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-brand-slate">
                  <img src={msgAvatar} alt={msgUser} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-brand-text-1">{msgUser}</span>
                    <span className="text-xs text-slate-400 dark:text-brand-text-3 ml-2 flex-shrink-0">{msgTime}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-brand-text-2 mb-2 leading-relaxed">{formatMessageText(message.text)}</p>

                  {/* Message actions */}
                  <div className="flex items-center gap-4 text-xs">
                    <button
                      className={`flex items-center gap-1 transition-colors ${
                        message.likedBy?.some(id => String(id) === String(currentUserId)) ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-brand-text-3 hover:text-red-500'
                      }`}
                      onClick={(e) => { e.stopPropagation(); onLikeMessage(debate.id, msgId); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${message.likedBy?.some(id => String(id) === String(currentUserId)) ? 'fill-current animate-pulse-heart' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {message.likes}
                    </button>
                    <button
                      className="flex items-center gap-1 hover:text-brand-green transition-colors"
                      onClick={(e) => { e.stopPropagation(); onReply(debate.id, msgId, msgUser); }}
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
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-brand-text-3 uppercase tracking-wider mb-1">Réponses</p>
                      {message.replies.map((reply: Reply) => {
                        // Robust user data extraction for replies
                        const replyUser = typeof reply.user === 'object' && reply.user !== null 
                          ? (reply.user as any).username 
                          : (reply.user || 'Anonyme');
                          
                        const replyAvatar = typeof reply.user === 'object' && reply.user !== null 
                          ? (reply.user as any).avatar 
                          : (reply.avatar || '');
                          
                        const replyTime = reply.time || 
                          ((reply as any).createdAt ? new Date((reply as any).createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "à l'instant");

                        const rplId = reply.id || (reply as any)._id;
                        return (
                          <div key={rplId} className="bg-slate-50/70 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate rounded-lg p-2.5">
                            <div className="flex gap-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-brand-slate">
                                <img src={replyAvatar} alt={replyUser} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1 flex-wrap gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-xs text-slate-900 dark:text-brand-text-1">{replyUser}</span>
                                    <span className="text-[9px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-1 py-0.2 rounded font-semibold whitespace-nowrap">
                                      En réponse à @{msgUser}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 dark:text-brand-text-3">{replyTime}</span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-brand-text-2 mb-1.5 leading-relaxed">{formatMessageText(reply.text)}</p>
                                <button
                                  className={`flex items-center gap-1 text-[10px] transition-colors ${
                                    reply.likedBy?.some(id => String(id) === String(currentUserId)) ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-brand-text-3 hover:text-red-500'
                                  }`}
                                  onClick={(e) => { e.stopPropagation(); onLikeReply(debate.id, msgId, rplId); }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${reply.likedBy?.some(id => String(id) === String(currentUserId)) ? 'fill-current animate-pulse-heart' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  {reply.likes}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply indicator (WhatsApp style quote preview) */}
      {replyToMessage && (
        <div className="mb-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-l-4 border-green-600 rounded-r-lg flex justify-between items-start text-xs">
          <div className="flex-1 min-w-0 pr-2">
            <span className="font-bold text-green-600 dark:text-green-400">@{replyToMessage.user}</span>
            <p className="text-slate-500 dark:text-slate-400 truncate mt-0.5">{replyToMessage.text || ''}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-red-500 transition-colors self-center"
            title="Annuler la réponse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Message input */}
      <div className="flex gap-2 relative">
        <div className="flex-1 relative">
          <input
            id="debate-input"
            type="text"
            className="w-full input-dark rounded-xl px-4 py-2.5 text-sm pr-10"
            placeholder={replyToMessage ? 'Écrivez votre réponse...' : 'Participez au débat...'}
            value={debateInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-green"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50" ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled skinTonesDisabled />
            </div>
          )}
        </div>
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
