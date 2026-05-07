import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { DebateCard } from '../components/news/DebateCard';
import CategoryFilter from '../components/news/CategoryFilter';
import CreateDebateModal from '../components/news/CreateDebateModal';
import DeleteConfirmationModal from '../components/news/DeleteConfirmationModal';
import DebateDetailView from '../components/news/DebateDetailView';
import { 
  getDebates, 
  createDebate, 
  updateDebate, 
  deleteDebate, 
  addDebateMessage, 
  likeDebate,
  Debate,
  Reply
} from '../services/api';

const News = () => {
  const location = useLocation();
  // Récupérer le contexte de notifications
  const { addNotification } = useNotifications();
  // Débat state
  const [activeDebate, setActiveDebate] = useState<number | string | null>(null);
  const [debateInput, setDebateInput] = useState('');
  const [showCreateDebateModal, setShowCreateDebateModal] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<{
    id: number | string;
    user: string;
  } | null>(null);
  // État pour le carousel d'images
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // État pour la modification d'un débat
  const [isEditingDebate, setIsEditingDebate] = useState(false);
  const [editingDebateId, setEditingDebateId] = useState<number | string | null>(null);
  // État pour la confirmation de suppression
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [debateToDeleteId, setDebateToDeleteId] = useState<number | string | null>(null);
  // Utilisateur actuel (from auth context)
  const { user: authUser } = useAuth();
  const currentUser = {
    id: authUser?.id || 1,
    username: authUser?.username ?? 'PronosUser',
    avatar: authUser?.avatar ?? 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    isPro: authUser?.isPro ?? false,
    role: authUser?.role ?? 'user'
  };
  // Stocker les index d'images actifs pour chaque débat dans la vue en grille
  const [gridActiveImageIndexes, setGridActiveImageIndexes] = useState<
    Record<string | number, number>>(
    {});

  // Débats data from API
  const [debates, setDebates] = useState<Debate[]>([]);

  useEffect(() => {
    getDebates()
      .then((data: Debate[]) => setDebates(data))
      .catch((err: Error) => console.error('Failed to load debates', err));
  }, []);

  // Vérifier s'il y a un debateId dans le state de navigation
  useEffect(() => {
    const navState = location.state as { activeDebateId?: number | string } | null;
    if (navState && navState.activeDebateId) {
      setActiveDebate(navState.activeDebateId);
    }
  }, [location.state]);
  // Fonction pour enregistrer un débat (création ou modification)
  const handleSaveDebate = async (debateData: { title: string; description: string; images: string[]; category: string }) => {
    try {
      if (isEditingDebate && editingDebateId) {
        const updatedDebate = await updateDebate(editingDebateId, debateData);
        const normalizedDebate = { ...updatedDebate, id: updatedDebate._id || updatedDebate.id };
        setDebates(debates.map((d: Debate) => d.id === editingDebateId ? normalizedDebate : d));
        
        addNotification({
          type: 'new_debate',
          title: 'Débat modifié',
          message: `${currentUser.username} a modifié son débat: "${debateData.title}"`,
          time: "à l'instant",
          read: false,
          user: currentUser.username,
          avatar: currentUser.avatar,
          debateId: editingDebateId as string | number
        });
      } else {
        const newDebateObj = await createDebate(debateData);
        const normalizedDebate = { ...newDebateObj, id: newDebateObj._id || newDebateObj.id };
        setDebates([normalizedDebate, ...debates]);
        
        addNotification({
          type: 'new_debate',
          title: 'Nouveau débat créé',
          message: `${currentUser.username} a créé un nouveau débat: "${normalizedDebate.title}"`,
          time: "à l'instant",
          read: false,
          user: currentUser.username,
          avatar: currentUser.avatar,
          debateId: normalizedDebate.id as string | number
        });
        setActiveDebate(normalizedDebate.id);
      }
    } catch (err) {
      console.error("Failed to save debate", err);
      throw err;
    }
  };

  // Fonction pour ouvrir le modal de modification
  const handleOpenEditModal = (debateId: number | string) => {
    setEditingDebateId(debateId);
    setIsEditingDebate(true);
    setShowCreateDebateModal(true);
  };
  // Fonction pour confirmer la suppression d'un débat
  const handleConfirmDeleteDebate = async () => {
    if (debateToDeleteId) {
      try {
        await deleteDebate(debateToDeleteId);
        
        setDebates(debates.filter((debate: Debate) => debate.id !== debateToDeleteId));
        setShowDeleteConfirmModal(false);
        setDebateToDeleteId(null);
        if (activeDebate === debateToDeleteId) {
          setActiveDebate(null);
        }
        // Notification pour la suppression
        addNotification({
          type: 'warning',
          title: 'Débat supprimé',
          message: `${currentUser.username} a supprimé un débat`,
          time: "à l'instant",
          read: false,
          user: currentUser.username,
          avatar: currentUser.avatar
        });
      } catch (err) {
        console.error("Failed to delete debate", err);
      }
    }
  };
  // Fonction pour naviguer dans le carousel d'images (vue détaillée)
  const navigateCarousel = (direction: 'prev' | 'next', imageCount: number) => {
    if (direction === 'prev') {
      setActiveImageIndex((prev: number) => (prev - 1 + imageCount) % imageCount);
    } else {
      setActiveImageIndex((prev: number) => (prev + 1) % imageCount);
    }
  };
  // Effet pour le défilement automatique des images dans la vue détaillée
  useEffect(() => {
    // Ne démarrer le défilement automatique que si un débat est actif et qu'il a plusieurs images
    if (activeDebate !== null) {
      const debate = debates.find((d: Debate) => d.id === activeDebate);
      if (debate && debate.images.length > 1) {
        const interval = setInterval(() => {
          navigateCarousel('next', debate.images.length);
        }, 5000); // Défilement toutes les 5 secondes au lieu de 1 seconde
        // Nettoyer l'intervalle quand le composant se démonte ou quand le débat change
        return () => clearInterval(interval);
      }
    }
  }, [activeDebate, debates]);
  // Fonction pour permettre de swiper les images avec le toucher
  const handleTouchStart = useRef({
    x: 0,
    y: 0
  });
  const handleTouchEnd = useRef({
    x: 0,
    y: 0
  });
  const handleSwipe = (imageCount: number) => {
    const touchThreshold = 50; // Seuil minimal de déplacement pour considérer comme un swipe
    const touchDiffX = handleTouchStart.current.x - handleTouchEnd.current.x;
    const touchDiffY = handleTouchStart.current.y - handleTouchEnd.current.y;
    // S'assurer que le swipe est plus horizontal que vertical
    if (
    Math.abs(touchDiffX) > Math.abs(touchDiffY) &&
    Math.abs(touchDiffX) > touchThreshold)
    {
      if (touchDiffX > 0) {
        // Swipe vers la gauche - image suivante
        navigateCarousel('next', imageCount);
      } else {
        // Swipe vers la droite - image précédente
        navigateCarousel('prev', imageCount);
      }
    }
  };
  const handleDetailedViewTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };
  const handleDetailedViewTouchEnd = (
  e: React.TouchEvent,
  imageCount: number) =>
  {
    handleTouchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    if (activeDebate !== null) {
      handleSwipe(imageCount);
    }
  };
  // Fonction pour naviguer dans le carousel d'images de la grille
  const navigateGridCarousel = (
  e: React.MouseEvent,
  debateId: number | string,
  direction: 'prev' | 'next',
  imageCount: number) =>
  {
    e.stopPropagation(); // Empêcher la propagation pour éviter d'ouvrir le débat
    setGridActiveImageIndexes((prev) => ({
      ...prev,
      [debateId]:
      direction === 'prev' ?
      ((prev[debateId] || 0) - 1 + imageCount) % imageCount :
      ((prev[debateId] || 0) + 1) % imageCount
    }));
  };
  // Fonction pour définir directement l'index d'image dans la grille
  const setGridImageIndex = (
  e: React.MouseEvent,
  debateId: number | string,
  index: number) =>
  {
    e.stopPropagation(); // Empêcher la propagation pour éviter d'ouvrir le débat
    setGridActiveImageIndexes((prev) => ({
      ...prev,
      [debateId]: index
    }));
  };
  // Fonction pour ajouter un message dans un débat
  const handleAddDebateMessage = async () => {
    if (debateInput.trim() && activeDebate !== null) {
      try {
        const debateToUpdate = debates.find(d => d.id === activeDebate);
        if (!debateToUpdate) return;
        
        let updatedDebate;
        if (replyToMessage) {
          // Note: Full API for addDebateMessageReply can be added later.
          // For now, if fallback mode is active, it might not support replies properly.
          // We'll mimic the UI update for replies if API doesn't support it yet.
          updatedDebate = await addDebateMessage(activeDebate, debateInput);
        } else {
          updatedDebate = await addDebateMessage(activeDebate, debateInput);
        }
        
        const normalizedDebate = { ...updatedDebate, id: updatedDebate._id || updatedDebate.id };
        setDebates(debates.map(d => d.id === activeDebate ? normalizedDebate : d));
        setDebateInput('');
        setReplyToMessage(null);
        
        if (normalizedDebate.author.id !== currentUser.id) {
          addNotification({
            type: replyToMessage ? 'reply' : 'new_comment',
            title: replyToMessage ? 'Nouvelle réponse' : 'Nouveau commentaire',
            message: replyToMessage ?
            `${currentUser.username} a répondu à ${replyToMessage.user} dans un débat` :
            `${currentUser.username} a commenté le débat "${normalizedDebate.title}"`,
            time: "à l'instant",
            read: false,
            user: currentUser.username,
            avatar: currentUser.avatar,
            debateId: activeDebate as string | number
          });
        }
      } catch (err) {
        console.error("Failed to add message", err);
      }
    }
  };
  // Fonction pour aimer un message
  const handleLikeMessage = (debateId: number | string, messageId: number | string) => {
    const updatedDebates = debates.map((debate) => {
      if (debate.id === debateId) {
        return {
          ...debate,
          messages: debate.messages.map((message) => {
            if (message.id === messageId) {
              // Vérifier si l'utilisateur a déjà aimé ce message
              const userLiked =
              message.likedBy && message.likedBy.some((id: string | number) => String(id) === String(currentUser.id));
              // Créer une notification pour le like (seulement si c'est un nouveau like)
              if (!userLiked && message.user !== currentUser.username) {
                addNotification({
                  type: 'like',
                  title: "J'aime sur votre message",
                  message: `${currentUser.username} a aimé votre message dans le débat "${debate.title}"`,
                  time: "à l'instant",
                  read: false,
                  user: currentUser.username,
                  avatar: currentUser.avatar,
                  debateId: debate.id as Debate['id']
                });
              }
              // Mettre à jour les likes et le tableau likedBy
              const likedBy = message.likedBy || [];
                if (userLiked) {
                  // Si l'utilisateur a déjà aimé, retirer son like
                  return {
                    ...message,
                    likes: Math.max(0, message.likes - 1),
                    likedBy: (likedBy as (number | string)[]).filter((id) => String(id) !== String(currentUser.id))
                  };
                } else {
                  // Sinon, ajouter son like
                  return {
                    ...message,
                    likes: message.likes + 1,
                    likedBy: [...likedBy, currentUser.id]
                  };
                }
            }
            return message;
          })
        };
      }
      return debate;
    });
    setDebates(updatedDebates);
  };
  // Fonction pour aimer une réponse
  const handleLikeReply = (
  debateId: number | string,
  messageId: number | string,
  replyId: number | string) =>
  {
    const updatedDebates = debates.map((debate) => {
      if (debate.id === debateId) {
        return {
          ...debate,
          messages: debate.messages.map((message) => {
            if (message.id === messageId) {
              return {
                ...message,
                replies: (message.replies || []).map((reply: Reply) => {
                  if (reply.id === replyId) {
                    // Vérifier si l'utilisateur a déjà aimé cette réponse
                    const userLiked =
                    reply.likedBy && reply.likedBy.some((id: string | number) => String(id) === String(currentUser.id));
                    // Créer une notification pour le like (seulement si c'est un nouveau like)
                    if (!userLiked && reply.user !== currentUser.username) {
                      addNotification({
                        type: 'like',
                        title: "J'aime sur votre réponse",
                        message: `${currentUser.username} a aimé votre réponse dans le débat "${debate.title}"`,
                        time: "à l'instant",
                        read: false,
                        user: currentUser.username,
                        avatar: currentUser.avatar,
                        debateId: debate.id as Debate['id']
                      });
                    }
                    // Mettre à jour les likes et le tableau likedBy
                    const likedBy = reply.likedBy || [];
                      if (userLiked) {
                        // Si l'utilisateur a déjà aimé, retirer son like
                        return {
                          ...reply,
                          likes: Math.max(0, reply.likes - 1),
                          likedBy: (likedBy as (number | string)[]).filter((id) => String(id) !== String(currentUser.id))
                        };
                      } else {
                        // Sinon, ajouter son like
                        return {
                          ...reply,
                          likes: reply.likes + 1,
                          likedBy: [...likedBy, currentUser.id]
                        };
                      }
                  }
                  return reply;
                })
              };
            }
            return message;
          })
        };
      }
      return debate;
    });
    setDebates(updatedDebates);
  };
  // Fonction pour répondre à un message
  const handleReplyToMessage = (_debateId: number | string, messageId: number | string, user: string) =>
  {
    setReplyToMessage({
      id: messageId,
      user
    });
    document.getElementById('debate-input')?.focus();
  };
  // Fonction pour aimer un débat
  const handleLikeDebate = async (e: React.MouseEvent, debateId: number | string) => {
    e.stopPropagation(); // Empêcher l'ouverture du débat quand on clique sur le bouton j'aime
    try {
      const updatedDebate = await likeDebate(debateId);
      const normalizedDebate = { ...updatedDebate, id: updatedDebate._id || updatedDebate.id };
      
      setDebates(debates.map((d: Debate) => d.id === debateId ? normalizedDebate : d));
      
      const userLiked = normalizedDebate.likedBy.some((id: string | number) => String(id) === String(currentUser.id));
      if (userLiked && normalizedDebate.author.id !== currentUser.id) {
        addNotification({
          type: 'like',
          title: "J'aime sur votre débat",
          message: `${currentUser.username} a aimé votre débat "${normalizedDebate.title}"`,
          time: "à l'instant",
          read: false,
          user: currentUser.username,
          avatar: currentUser.avatar,
          debateId: normalizedDebate.id as Debate['id']
        });
      }
    } catch (err) {
      console.error("Failed to like debate", err);
    }
  };
  // Fonction pour filtrer les débats par catégorie
  const [activeCategory, setActiveCategory] = useState('all');
  const filteredDebates =
  activeCategory === 'all' ?
  debates :
  debates.filter((debate: Debate) => debate.category === activeCategory);
  // Obtenir toutes les catégories uniques
  const categories = [
  'all',
  ...new Set(debates.map((debate: Debate) => debate.category))];

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Débats</h2>
        {(currentUser.isPro || currentUser.role === 'admin') && (
          <button
            onClick={() => { setIsEditingDebate(false); setShowCreateDebateModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Nouveau débat
          </button>
        )}
      </div>
      {/* Catégories de débats */}
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />
      {/* Zone de débat */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white flex justify-between items-center">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">

              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <h3 className="font-bold">Exprimez-vous</h3>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                setIsEditingDebate(false);
                setEditingDebateId(null);
                setShowCreateDebateModal(true);
              }}
              className="text-xs bg-white text-green-700 px-3 py-1 rounded-full font-medium hover:bg-gray-100 mr-3">

              Nouveau débat
            </button>
          </div>
        </div>
        <div className="p-4">
          {activeDebate === null ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDebates.map((debate) => (
                <DebateCard
                  key={debate.id}
                  debate={debate}
                  activeImageIndex={gridActiveImageIndexes[debate.id] || 0}
                  onSelect={(id: string | number) => setActiveDebate(id)}
                  onLike={(e: React.MouseEvent, id: string | number) => handleLikeDebate(e, id)}
                  onNavigateCarousel={(e: React.MouseEvent, id: string | number, dir: 'prev' | 'next', count: number) => navigateGridCarousel(e, id, dir, count)}
                  onSetImageIndex={(e: React.MouseEvent, id: string | number, idx: number) => setGridImageIndex(e, id, idx)}
                  currentUserId={currentUser.id}
                />
              ))}
            </div> :

          <div>
            {(() => {
              const activeDebateObj = debates.find((d) => String(d.id) === String(activeDebate));
              if (!activeDebateObj) return null;
              return (
                <DebateDetailView
                  debate={activeDebateObj}
                  currentUserId={currentUser.id}
                  activeImageIndex={activeImageIndex}
                  replyToMessage={replyToMessage}
                  debateInput={debateInput}
                  onBack={() => { setActiveDebate(null); setReplyToMessage(null); setActiveImageIndex(0); }}
                  onInputChange={setDebateInput}
                  onSend={handleAddDebateMessage}
                  onLikeDebate={(e: React.MouseEvent, id: string | number) => handleLikeDebate(e, id)}
                  onLikeMessage={(debateId: string | number, messageId: string | number) => handleLikeMessage(debateId, messageId)}
                  onLikeReply={(debateId: string | number, messageId: string | number, replyId: string | number) => handleLikeReply(debateId, messageId, replyId)}
                  onReply={(debateId: string | number, messageId: string | number, user: string) => handleReplyToMessage(debateId, messageId, user)}
                  onCancelReply={() => setReplyToMessage(null)}
                  onNavigateCarousel={(dir: 'prev' | 'next', count: number) =>
                    setActiveImageIndex((prev) => (dir === 'next' ? (prev + 1) % count : (prev - 1 + count) % count))
                  }
                  onSetImageIndex={setActiveImageIndex}
                  onOpenEdit={(id: string | number) => handleOpenEditModal(id)}
                  onRequestDelete={(id: string | number) => { setDebateToDeleteId(id); setShowDeleteConfirmModal(true); }}
                  onTouchStart={handleDetailedViewTouchStart}
                  onTouchEnd={handleDetailedViewTouchEnd}
                />
              );
            })()}
          </div>
          }
        </div>
      </div>
      <CreateDebateModal
        isOpen={showCreateDebateModal}
        onClose={() => setShowCreateDebateModal(false)}
        onSave={handleSaveDebate}
        currentUser={currentUser}
        isEditing={isEditingDebate}
        initialData={editingDebateId ? debates.find(d => d.id === editingDebateId) : undefined}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDeleteDebate}
        description="Êtes-vous sûr de vouloir supprimer ce débat ? Cette action est irréversible et supprimera également tous les messages associés."
      />
    </div>);

};
export default News;
