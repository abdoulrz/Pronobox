
import React, { useState } from 'react';
import UnifiedPaymentModal from './payment/UnifiedPaymentModal';
import { markdownToHtml } from '../utils/markdownToHtml';
import { useAuth } from '../contexts/AuthContext';

interface BetEducProps {
  onClose?: () => void;
}

interface EducReply {
  username: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

interface EducComment {
  _id?: string;
  id?: string;
  username: string;
  avatar?: string;
  text: string;
  createdAt: string;
  replies?: EducReply[];
}

interface EducResource {
  _id: string;
  id?: string;
  title: string;
  type: string;
  category: 'free' | 'premium';
  price: number;
  image: string;
  contentType: 'file' | 'link' | 'text';
  content: string;
  description: string;
  comments?: EducComment[];
}

const getUnsplashDirectUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('unsplash.com') && !url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      const segments = urlObj.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const lastSegment = segments[segments.length - 1];
        const idParts = lastSegment.split('-');
        const photoId = idParts[idParts.length - 1];
        if (photoId && photoId.length >= 8) {
          return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
        }
      }
    } catch (e) {
      console.error("Failed to parse Unsplash URL", e);
    }
  }
  return url;
};

const BetEduc: React.FC<BetEducProps> = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'free' | 'premium'>('free');
  const [resources, setResources] = useState<EducResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<EducResource | null>(null);
  const [viewingText, setViewingText] = useState<EducResource | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  React.useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('/api/beteduc');
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Failed to fetch beteduc data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const getTypeIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('book') || lower.includes('livre')) return '📖';
    if (lower.includes('vidéo') || lower.includes('film') || lower.includes('video')) return '🎬';
    if (lower.includes('article') || lower.includes('texte')) return '📝';
    if (lower.includes('formation') || lower.includes('cours')) return '🎓';
    return '📄';
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleAction = (resource: EducResource) => {
    setViewingText(resource);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !viewingText) return;
    setIsSubmittingComment(true);
    try {
      const resourceId = viewingText.id || viewingText._id;
      const response = await fetch(`/api/beteduc/${resourceId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: newComment })
      });
      if (response.ok) {
        const updatedResource = await response.json();
        setViewingText(updatedResource);
        setResources(prev => prev.map(r => (r.id === updatedResource.id || r._id === updatedResource.id) ? updatedResource : r));
        setNewComment('');
      } else {
        const errData = await response.json();
        alert(errData.message || "Impossible d'ajouter le commentaire.");
      }
    } catch (err) {
      console.error("Failed to add comment", err);
      alert("Une erreur s'est produite lors de l'envoi.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyText.trim() || !viewingText) return;
    setIsSubmittingReply(true);
    try {
      const resourceId = viewingText.id || viewingText._id;
      const response = await fetch(`/api/beteduc/${resourceId}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text: replyText })
      });
      if (response.ok) {
        const updatedResource = await response.json();
        setViewingText(updatedResource);
        setResources(prev => prev.map(r => (r.id === updatedResource.id || r._id === updatedResource.id) ? updatedResource : r));
        setReplyText('');
        setReplyingToCommentId(null);
      } else {
        const errData = await response.json();
        alert(errData.message || "Impossible d'ajouter la réponse.");
      }
    } catch (err) {
      console.error("Failed to add reply", err);
      alert("Une erreur s'est produite lors de l'envoi.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleBuyResource = (resource: EducResource) => {
    setSelectedResource(resource);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (method: string) => {
    setShowPaymentModal(false);
    if (!selectedResource) return;

    try {
      const resourceId = selectedResource.id || selectedResource._id;
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: selectedResource.price || 0,
          type: 'product',
          description: `Achat: ${selectedResource.title}`,
          method: method,
          itemId: resourceId,
          itemName: selectedResource.title
        })
      });

      if (response.ok) {
        if (user) {
          const currentUnlocked = user.unlockedResources || [];
          if (!currentUnlocked.includes(resourceId)) {
            await updateUser({
              unlockedResources: [...currentUnlocked, resourceId]
            });
          }
        }
        handleAction(selectedResource);
      } else {
        const err = await response.json();
        alert(err.message || "Erreur lors de la validation de la transaction.");
      }
    } catch (err) {
      console.error("Failed to process transaction", err);
      alert("Erreur lors de l'enregistrement de l'achat.");
    }
  };

  const filteredResources = resources.filter(r => r.category === activeTab);

  return (
    <div className={onClose 
      ? "h-full flex flex-col bg-slate-50 dark:bg-brand-navy-3 relative overflow-hidden"
      : "max-w-[1400px] mx-auto px-4 py-6 w-full flex flex-col animate-fade-in relative"
    }>
      {/* Premium Header */}
      <div className={onClose 
        ? "relative p-6 pb-4 border-b border-slate-200 dark:border-brand-slate/30 bg-white/80 dark:bg-brand-navy-2/80 backdrop-blur-xl z-20"
        : "relative pb-6 mb-6 border-b border-slate-200 dark:border-brand-slate/30"
      }>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">BET-EDUC</h2>
            <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] opacity-80">Centre d'apprentissage</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-brand-navy-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Tab System */}
        <div className="flex p-1 bg-slate-100 dark:bg-brand-navy-3 rounded-2xl border border-slate-200/50 dark:border-brand-slate/20">
          <button
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'free' ? 'bg-white dark:bg-brand-navy-2 text-brand-green shadow-lg shadow-black/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            onClick={() => setActiveTab('free')}
          >
            Gratuit
          </button>
          <button
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'premium' ? 'bg-white dark:bg-brand-navy-2 text-yellow-500 shadow-lg shadow-black/5' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            onClick={() => setActiveTab('premium')}
          >
            Premium
          </button>
        </div>
      </div>

      <div className={onClose ? "flex-1 overflow-y-auto no-scrollbar p-6" : "w-full"}>
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
            <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Chargement des ressources...</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-4 pb-20 ${onClose ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {filteredResources.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-3">
                <div className="text-4xl opacity-20">📭</div>
                <p className="text-sm font-bold text-slate-400 italic">Aucune ressource disponible pour le moment.</p>
              </div>
            ) : filteredResources.map((resource, index) => {
              const resourceId = resource.id || resource._id;
              const isUnlocked = resource.category !== 'premium' || 
                                 user?.role === 'admin' || 
                                 user?.isPro || 
                                 (user?.unlockedResources && user.unlockedResources.includes(resourceId));
              return (
                <div
                  key={resourceId || index}
                  className="group bg-white dark:bg-brand-navy-2 rounded-2xl border border-slate-200 dark:border-brand-slate/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-green/10 dark:hover:shadow-none transition-all duration-300"
                >
                  <div className="h-32 relative overflow-hidden">
                    <img
                      src={getUnsplashDirectUrl(resource.image)}
                      alt={resource.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/30 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-wider">
                      {getTypeIcon(resource.type)} {resource.type}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-black text-slate-800 dark:text-white text-sm leading-snug mb-1 line-clamp-1 group-hover:text-brand-green transition-colors">{resource.title}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">{resource.description}</p>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50 dark:border-brand-slate/20">
                      {resource.category === 'premium' ? (
                        <span className="text-sm font-black text-brand-green">
                          {isUnlocked ? (
                            <span className="text-[9px] uppercase tracking-widest text-brand-green bg-brand-green/10 px-2 py-1 rounded flex items-center gap-1">
                              🔓 Débloqué
                            </span>
                          ) : `${resource.price}€`}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-brand-green uppercase tracking-widest px-2 py-1 bg-brand-green/10 rounded">Offert</span>
                      )}
                      
                      <button
                        className="px-4 py-1.5 bg-brand-green text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-green/20"
                        onClick={() => isUnlocked ? handleAction(resource) : handleBuyResource(resource)}
                      >
                        {isUnlocked ? (resource.contentType === 'text' ? 'Lire' : 'Accéder') : 'Débloquer'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Content Reader Modal */}
      {viewingText && (
        <div className="absolute inset-0 bg-white dark:bg-brand-navy-2 z-[60] flex flex-col animate-slide-in-right">
          <div className="p-6 border-b border-slate-200 dark:border-brand-slate/30 flex justify-between items-center bg-white dark:bg-brand-navy-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTypeIcon(viewingText.type)}</span>
              <div>
                <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight truncate max-w-[200px]">{viewingText.title}</h3>
                <p className="text-[10px] font-black text-brand-green uppercase tracking-widest">Lecture en cours</p>
              </div>
            </div>
            <button 
              onClick={() => setViewingText(null)} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-brand-navy-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-prose mx-auto">
              
              {/* Dynamic Content Types */}
              {viewingText.contentType === 'text' ? (
                <div
                  className="prono-md text-slate-700 dark:text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(viewingText.content || '') || '<p class="italic text-slate-400 text-center py-10">Aucun contenu disponible.</p>' }}
                />
              ) : (viewingText.contentType === 'link' || (viewingText.content && viewingText.content.startsWith('http') && (viewingText.content.includes('youtube.com') || viewingText.content.includes('youtu.be') || viewingText.content.includes('vimeo.com')))) ? (
                <div className="space-y-6">
                  <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-brand-slate/30 bg-black relative shadow-lg">
                    <iframe 
                      src={getEmbedUrl(viewingText.content || '')} 
                      className="w-full h-full" 
                      title={viewingText.title}
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                      allowFullScreen
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-brand-navy-3 rounded-2xl border border-slate-200/50 dark:border-brand-slate/20">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-2xl">🌐</span>
                      <div>
                        <p className="text-xs font-black uppercase text-slate-700 dark:text-white">Lien externe associé</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Si l'affichage direct est bloqué, visitez le site externe.</p>
                      </div>
                    </div>
                    <a 
                      href={viewingText.content} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-2.5 bg-brand-green hover:bg-brand-green/80 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-lg shadow-brand-green/20"
                    >
                      Ouvrir le lien externe
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Local file resource */}
                  {(viewingText.content || '').toLowerCase().endsWith('.pdf') ? (
                    <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-brand-slate/30 bg-slate-900 relative shadow-lg">
                      <embed src={viewingText.content} type="application/pdf" className="w-full h-full" />
                    </div>
                  ) : (viewingText.content || '').toLowerCase().match(/\.(mp4|webm|ogg)$/) ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-brand-slate/30 bg-black relative shadow-lg">
                      <video controls src={viewingText.content} className="w-full h-auto max-h-[450px]" />
                    </div>
                  ) : (viewingText.content || '').toLowerCase().match(/\.(mp3|wav|ogg)$/) ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-brand-navy-3 rounded-2xl border border-slate-200/50 dark:border-brand-slate/20 shadow-md">
                      <span className="text-5xl mb-4 animate-bounce">🎵</span>
                      <p className="text-sm font-black text-slate-700 dark:text-white mb-4">Lecture audio de la ressource</p>
                      <audio controls src={viewingText.content} className="w-full max-w-md" />
                    </div>
                  ) : (viewingText.content || '').toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-brand-slate/30 bg-slate-900 relative shadow-lg">
                      <img src={viewingText.content} alt={viewingText.title} className="w-full h-auto object-contain mx-auto" />
                    </div>
                  ) : null}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-brand-navy-3 rounded-2xl border border-slate-200/50 dark:border-brand-slate/20">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-2xl">📁</span>
                      <div>
                        <p className="text-xs font-black uppercase text-slate-700 dark:text-white">Fichier de formation local</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Consultez ou conservez la ressource sur votre appareil.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = viewingText.content;
                        link.download = viewingText.title;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-brand-green hover:bg-brand-green/80 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center transition-all shadow-lg shadow-brand-green/20"
                    >
                      Télécharger le fichier
                    </button>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-brand-slate/30 text-left">
                <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span>💬</span> Commentaires ({viewingText.comments?.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0) || 0})
                </h4>

                {/* List of comments */}
                <div className="space-y-4 mb-6">
                  {!viewingText.comments || viewingText.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center">Aucun commentaire pour le moment. Soyez le premier à réagir !</p>
                  ) : (
                    viewingText.comments.map((comment, index) => {
                      const commentId = comment.id || comment._id;
                      return (
                        <div 
                          key={commentId || index} 
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/20 animate-fade-in"
                        >
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-sm font-bold text-brand-green overflow-hidden flex-shrink-0">
                              {comment.avatar ? (
                                <img src={comment.avatar} alt={comment.username} className="w-full h-full object-cover" />
                              ) : (
                                comment.username.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-black text-slate-700 dark:text-white">{comment.username}</span>
                                <span className="text-[8px] font-medium text-slate-400 uppercase">
                                  {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">{comment.text}</p>
                              
                              <div className="flex items-center gap-4 mt-2">
                                <button
                                  onClick={() => {
                                    if (commentId) {
                                      setReplyingToCommentId(replyingToCommentId === commentId ? null : commentId);
                                      setReplyText('');
                                    }
                                  }}
                                  className="text-[9px] font-black uppercase text-brand-green tracking-wider hover:underline flex items-center gap-1"
                                >
                                  <span>↳</span> {replyingToCommentId === commentId ? 'Annuler' : 'Répondre'}
                                </button>
                              </div>
                              
                              {/* Replies Render List */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-3 pl-3 border-l-2 border-slate-200 dark:border-brand-slate/30 space-y-2.5">
                                  {comment.replies.map((reply, rIdx) => (
                                    <div key={rIdx} className="flex gap-2.5 p-2.5 rounded-xl bg-slate-100/50 dark:bg-brand-navy-2 border border-slate-100/30 dark:border-brand-slate/10 animate-fade-in">
                                      <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center text-[9px] font-bold text-brand-green overflow-hidden flex-shrink-0">
                                        {reply.avatar ? (
                                          <img src={reply.avatar} alt={reply.username} className="w-full h-full object-cover" />
                                        ) : (
                                          reply.username.slice(0, 2).toUpperCase()
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-[10px] font-black text-slate-700 dark:text-white">{reply.username}</span>
                                          <span className="text-[7px] font-medium text-slate-400 uppercase">
                                            {new Date(reply.createdAt).toLocaleDateString('fr-FR', {
                                              day: 'numeric',
                                              month: 'short',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed break-words">{reply.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Reply Input Form */}
                              {replyingToCommentId === commentId && commentId && (
                                <div className="mt-3 flex gap-2 animate-slide-down">
                                  <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder={`Répondre à ${comment.username}...`}
                                    disabled={isSubmittingReply}
                                    className="flex-1 bg-slate-100 dark:bg-brand-navy-2 border border-slate-200/50 dark:border-brand-slate/20 rounded-xl px-3 py-2 text-[10px] outline-none focus:ring-2 focus:ring-brand-green/30 text-slate-700 dark:text-white transition-all placeholder:text-slate-400"
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmitReply(commentId);
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSubmitReply(commentId)}
                                    disabled={isSubmittingReply || !replyText.trim()}
                                    className="px-4 py-2 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center"
                                  >
                                    {isSubmittingReply ? '...' : 'Envoyer'}
                                  </button>
                                </div>
                              )}
                              
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Comment submission form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Partager votre avis ou poser une question..."
                    disabled={isSubmittingComment}
                    className="flex-1 bg-slate-50 dark:bg-brand-navy-3 border border-slate-100 dark:border-brand-slate/20 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-brand-green/30 text-slate-700 dark:text-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="px-5 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingComment ? '...' : (
                      <>
                        <span>Envoyer</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 rotate-45 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 dark:border-brand-slate/20 text-center">
                <button 
                  onClick={() => setViewingText(null)}
                  className="px-8 py-3 bg-slate-100 dark:bg-brand-navy-3 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-green hover:text-white transition-all"
                >
                  Revenir à la bibliothèque
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedResource && (
        <UnifiedPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          paymentDetails={{
            amount: selectedResource.price ?? 0,
            description: `Achat: ${selectedResource.title}`,
            type: 'product',
            itemName: selectedResource.title
          }}
        />
      )}
    </div>
  );
};

export default BetEduc;