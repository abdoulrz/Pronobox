import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Debate, Message, Reply } from '../../services/api';

interface DebateDetailViewProps {
  debate: Debate;
  currentUserId: number | string;
  activeImageIndex: number;
  replyToMessage: { id: number | string; user: string; text?: string } | null;
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
  onFavorite?: (debateId: string) => void;
  isAdmin?: boolean;
  onDeleteMessage?: (debateId: number | string, messageId: number | string) => void;
  onDeleteReply?: (debateId: number | string, messageId: number | string, replyId: number | string) => void;
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
  onFavorite,
  isAdmin,
  onDeleteMessage,
  onDeleteReply,
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
  const isFavorited = (debate.favoritedBy || []).some(id => String(id) === String(currentUserId));

  // Calculate hours remaining before expiry
  const getExpiryText = () => {
    if (debate.isFavorite || !debate.expiresAt) return null;
    const expiresAt = new Date(debate.expiresAt).getTime();
    const hoursLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / (1000 * 60 * 60)));
    const minsLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / (1000 * 60)) % 60);
    if (hoursLeft > 0) return `${hoursLeft}h${minsLeft > 0 ? minsLeft : ''}`;
    if (minsLeft > 0) return `${minsLeft}min`;
    return null;
  };

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

  const cleanDescription = debate.description ? debate.description.replace(/\n*Source:\s*.*$/is, '').trim() : '';

  return (
    <div className="animate-slide-up">
      {/* Facebook-style header */}
      <div className="flex flex-wrap items-start justify-between mb-4 border-b border-gray-100 dark:border-gray-700/50 pb-3 gap-y-3 gap-x-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-brand-slate shadow-sm flex-shrink-0">
            <img src={debate.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(debate.author?.username || 'U')}&background=10b981&color=fff&size=128`} alt={debate.author?.username || 'Auteur'} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{debate.author?.username || 'Anonyme'}</span>
              <span className="text-[10px] bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                {debate.category}
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 block">
              {debate.createdAt ? new Date(debate.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              }) : "À l'instant"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          {/* Author actions */}
          {String(debate.author.id) === String(currentUserId) && (
            <div className="flex flex-wrap justify-end gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onOpenEdit(debate.id); }}
                className="text-[11px] sm:text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-brand-text-2 px-2.5 py-1.5 rounded-full font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
              >
                Modifier
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRequestDelete(debate.id); }}
                className="text-[11px] sm:text-xs bg-red-500 text-white px-2.5 py-1.5 rounded-full font-medium hover:bg-red-600 transition-colors whitespace-nowrap"
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
          {showFullDesc || cleanDescription.length <= 250 ? (
            cleanDescription
          ) : (
            <>
              {cleanDescription.slice(0, 250)}...
              <button
                onClick={() => setShowFullDesc(true)}
                className="text-green-600 hover:underline ml-1 font-semibold focus:outline-none"
              >
                Voir plus
              </button>
            </>
          )}
          {showFullDesc && cleanDescription.length > 250 && (
            <button
              onClick={() => setShowFullDesc(false)}
              className="text-green-600 hover:underline ml-1 font-semibold focus:outline-none"
            >
              Voir moins
            </button>
          )}
        </div>

        {/* Source article link moved here */}
        {debate.sourceArticle && (
          <a
            href={debate.sourceArticle.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium hover:bg-blue-500/20 transition-colors mt-3"
          >
            <span>📰</span>
            <span>Source: {debate.sourceArticle.source}</span>
            <span>→</span>
          </a>
        )}
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

      {/* Action Bar: Likes, Favorite & Comments */}
      <div className="flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-800/60 py-3 mb-4 mt-2">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={(e) => onLikeDebate(e, debate.id)}
            className={`flex items-center gap-1.5 px-2 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
              isLiked
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
            }`}
            aria-label={isLiked ? 'Ne plus aimer ce débat' : "J'aime ce débat"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 flex-shrink-0 ${isLiked ? 'fill-current text-red-500 animate-pulse-heart' : 'fill-none'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-semibold hidden sm:inline">{isLiked ? 'Aimé' : "J'aime"}</span>
            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
              {debate.likes}
            </span>
          </button>

          {/* Favorite button */}
          <button
            onClick={() => onFavorite?.(String(debate.id || debate._id))}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${
              isFavorited
                ? 'bg-amber-500/10 text-amber-500'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-400'
            }`}
            title={isFavorited ? 'Retirer des favoris' : 'Sauvegarder (empêche la suppression auto)'}
          >
            <span className="text-lg">{isFavorited ? '⭐' : '☆'}</span>
            <span className="text-xs font-bold">{debate.favoritedBy?.length || 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 overflow-hidden">
          {/* Expiry indicator */}
          {getExpiryText() && (
            <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap" title="Temps restant avant suppression automatique">
              ⏱ {getExpiryText()}
            </span>
          )}
          {debate.isFavorite && (
            <span className="hidden sm:inline text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              ⭐ Sauvegardé
            </span>
          )}

          <button 
            onClick={() => document.getElementById('debate-input')?.focus()}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mr-1 sm:mr-2 whitespace-nowrap hover:text-brand-green transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{debate.messages.length} <span className="hidden sm:inline">{debate.messages.length > 1 ? 'commentaires' : 'commentaire'}</span></span>
          </button>
        </div>
      </div>

      {/* Messages list (WhatsApp Style - Flat) */}
      <div className="space-y-3 mb-4">
        {(() => {
          const flatMessages: any[] = [];
          debate.messages.forEach((message: Message) => {
            const msgUser = typeof message.user === 'object' && message.user !== null 
              ? (message.user as any).username 
              : (message.user || message.author || 'Anonyme');
            const msgAvatar = typeof message.user === 'object' && message.user !== null 
              ? (message.user as any).avatar 
              : (message.avatar || '');
            const msgUserId = typeof message.user === 'object' && message.user !== null 
              ? ((message.user as any).id || (message.user as any)._id) 
              : ((message as any).authorId || (message as any).userId || message.user);
            
            flatMessages.push({
              ...message,
              isReply: false,
              msgId: message.id || (message as any)._id,
              parentId: message.id || (message as any)._id,
              msgUser,
              msgAvatar,
              msgUserId,
              sortDate: new Date((message as any).createdAt || message.time || 0).getTime()
            });

            if (message.replies && message.replies.length > 0) {
              message.replies.forEach((reply: Reply) => {
                const rplUser = typeof reply.user === 'object' && reply.user !== null 
                  ? (reply.user as any).username 
                  : (reply.user || 'Anonyme');
                const rplAvatar = typeof reply.user === 'object' && reply.user !== null 
                  ? (reply.user as any).avatar 
                  : (reply.avatar || '');
                const rplUserId = typeof reply.user === 'object' && reply.user !== null 
                  ? ((reply.user as any).id || (reply.user as any)._id) 
                  : ((reply as any).authorId || (reply as any).userId || reply.user);

                flatMessages.push({
                  ...reply,
                  isReply: true,
                  msgId: reply.id || (reply as any)._id,
                  parentId: message.id || (message as any)._id,
                  msgUser: rplUser,
                  msgAvatar: rplAvatar,
                  msgUserId: rplUserId,
                  replyToUser: msgUser,
                  replyToText: message.text,
                  sortDate: new Date((reply as any).createdAt || reply.time || 0).getTime()
                });
              });
            }
          });

          flatMessages.sort((a, b) => a.sortDate - b.sortDate);

          return flatMessages.map((item) => {
            const msgTime = item.time || 
              (item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "à l'instant");
            
            return (
              <div
                key={`${item.isReply ? 'reply' : 'msg'}-${item.msgId}`}
                id={`msg-${item.msgId}`}
                className="card p-3 hover:border-brand-green/20 transition-all duration-500"
              >
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-brand-slate">
                    <img src={item.msgAvatar} alt={item.msgUser} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-brand-text-1">{item.msgUser}</span>
                      <span className="text-xs text-slate-400 dark:text-brand-text-3 ml-2 flex-shrink-0">{msgTime}</span>
                    </div>

                    {/* Reply Block (WhatsApp style quote) */}
                    {item.isReply && (
                      <div 
                        className="mb-2 p-2 rounded-lg border-l-4 bg-slate-50 dark:bg-white/5 border-green-500 text-left overflow-hidden cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          const parentEl = document.getElementById(`msg-${item.parentId}`);
                          if (parentEl) {
                            parentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Highlight effect
                            parentEl.classList.add('ring-2', 'ring-green-500', 'bg-green-50/50', 'dark:bg-green-900/20');
                            setTimeout(() => {
                              parentEl.classList.remove('ring-2', 'ring-green-500', 'bg-green-50/50', 'dark:bg-green-900/20');
                            }, 1500);
                          }
                        }}
                      >
                        <p className="text-[10px] font-bold text-green-500 truncate">{item.replyToUser}</p>
                        <p className="text-[11px] truncate text-slate-500 dark:text-slate-400">
                          {formatMessageText(item.replyToText)}
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-slate-700 dark:text-brand-text-2 mb-2 leading-relaxed">{formatMessageText(item.text)}</p>

                    {/* Message actions */}
                    <div className="flex items-center gap-4 text-xs">
                      <button
                        className={`flex items-center gap-1 transition-colors ${
                          item.likedBy?.some((id: any) => String(id) === String(currentUserId)) ? 'text-red-500 font-bold' : 'text-slate-400 dark:text-brand-text-3 hover:text-red-500'
                        }`}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (item.isReply) {
                            onLikeReply(debate.id, item.parentId, item.msgId);
                          } else {
                            onLikeMessage(debate.id, item.msgId); 
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${item.likedBy?.some((id: any) => String(id) === String(currentUserId)) ? 'fill-current animate-pulse-heart' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {item.likes}
                      </button>
                      <button
                        className="flex items-center gap-1 hover:text-brand-green transition-colors"
                        onClick={(e) => { e.stopPropagation(); onReply(debate.id, item.parentId, item.msgUser); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Répondre
                      </button>
                      {(String(item.msgUserId) === String(currentUserId) || isAdmin) && (
                        <button
                          className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors ml-auto font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
                              if (item.isReply) {
                                onDeleteReply?.(debate.id, item.parentId, item.msgId);
                              } else {
                                onDeleteMessage?.(debate.id, item.msgId);
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          });
        })()}
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
            <div className="absolute bottom-full right-0 mb-2 z-50" style={{ width: 'min(350px, 85vw)' }} ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled skinTonesDisabled width="100%" height={350} />
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
