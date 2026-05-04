import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Debate, Message, Reply } from '../types/news';
import { DebateCard } from '../components/news/DebateCard';
import CategoryFilter from '../components/news/CategoryFilter';
import DebateDetailView from '../components/news/DebateDetailView';

const News = () => {
  const location = useLocation();
  // Récupérer le contexte de notifications
  const { addNotification } = useNotifications();
  // Débat state
  const [activeDebate, setActiveDebate] = useState<number | string | null>(null);
  const [debateInput, setDebateInput] = useState('');
  const [showCreateDebateModal, setShowCreateDebateModal] = useState(false);
  const [newDebate, setNewDebate] = useState({
    title: '',
    description: '',
    images: [] as {
      id: number;
      file: string;
      preview: string;
    }[],
    category: 'Général'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  // État pour la réponse aux commentaires
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
    avatar: authUser?.avatar ?? 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  };
  // Stocker les index d'images actifs pour chaque débat dans la vue en grille
  const [gridActiveImageIndexes, setGridActiveImageIndexes] = useState<
    Record<string | number, number>>(
    {});

  // Initial data for debates
  const initialDebates: Debate[] = [
    {
      id: 1,
      title: 'La VAR a-t-elle amélioré le football?',
      description: "Débattez sur l'impact de la technologie d'assistance vidéo dans le football moderne.",
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1508098682722-e99c643e7f76?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
      ],
      category: 'Arbitrage',
      participants: 48,
      lastActivity: 'Il y a 15 minutes',
      likes: 23,
      likedBy: [2, 3, 5],
      author: {
        id: 2,
        username: 'ArbitragePro',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
      },
      messages: [
        {
          id: 1,
          user: 'ArbitragePro',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          text: "La VAR a considérablement réduit les erreurs d'arbitrage flagrantes, mais ralentit trop le jeu.",
          time: 'Il y a 2 heures',
          likes: 15,
          likedBy: [],
          replies: []
        },
        {
          id: 2,
          user: 'FootballTradition',
          avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          text: 'Je préférais le football avant la VAR. Les erreurs font partie du jeu et créaient des moments de discussion passionnés.',
          time: 'Il y a 1 heure',
          likes: 8,
          likedBy: [],
          replies: []
        },
        {
          id: 3,
          user: 'ModernGame',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          text: "Les statistiques montrent une réduction de 74% des décisions incorrectes sur les buts, pénaltys et cartons rouges. C'est indéniablement positif.",
          time: 'Il y a 45 minutes',
          likes: 23,
          likedBy: [],
          replies: []
        },
        {
          id: 4,
          user: 'FanPassionné',
          avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          text: "Le problème n'est pas la VAR elle-même, mais son application. Il faut des règles plus claires et des décisions plus rapides.",
          time: 'Il y a 15 minutes',
          likes: 17,
          likedBy: [],
          replies: []
        }
      ]
    },
    {
      id: 2,
      title: 'Faut-il limiter les salaires des joueurs?',
      description: 'Échangez vos opinions sur les salaires astronomiques dans le football et leur impact sur le sport.',
      images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],
      category: 'Économie',
      participants: 36,
      lastActivity: 'Il y a 1 heure',
      likes: 17,
      likedBy: [1, 4, 5],
      author: {
        id: 3,
        username: 'EconoFoot',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
      },
      messages: [
        {
          id: 1,
          user: 'ÉconomisteSport',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          text: 'Un plafond salarial comme en NBA pourrait rendre la compétition plus équitable entre les clubs.',
          time: 'Il y a 3 heures',
          likes: 21,
          likedBy: [],
          replies: []
        },
        {
          id: 2,
          user: 'MarketLibre',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          text: "Les joueurs devraient être payés selon ce que le marché est prêt à offrir. C'est la base de l'économie de marché.",
          time: 'Il y a 2 heures',
          likes: 14,
          likedBy: [],
          replies: []
        }
      ]
    }
  ];

  // Débats data with Persistence
  const [debates, setDebates] = useState<Debate[]>(() => {
    const saved = localStorage.getItem('pronobox_debates');
    return saved ? JSON.parse(saved) : initialDebates;
  });

  useEffect(() => {
    localStorage.setItem('pronobox_debates', JSON.stringify(debates));
  }, [debates]);

  // Vérifier s'il y a un debateId dans le state de navigation
  useEffect(() => {
    const navState = location.state as { activeDebateId?: number | string } | null;
    if (navState && navState.activeDebateId) {
      setActiveDebate(navState.activeDebateId);
    }
  }, [location.state]);
  // Fonction pour gérer l'importation d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = [...newDebate.images];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            file: file.name,
            preview: reader.result as string
          });
          setNewDebate({
            ...newDebate,
            images: newImages
          });
        };
        reader.readAsDataURL(file);
      });
    }
    // Réinitialiser l'input pour permettre de sélectionner les mêmes fichiers
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  // Fonction pour supprimer une image
  const handleRemoveImage = (imageId: number | string) => {
    setNewDebate({
      ...newDebate,
      images: newDebate.images.filter((img: { id: number }) => img.id !== imageId)
    });
  };
  // Fonction pour ouvrir le sélecteur de fichier
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };
  // Fonction pour créer un nouveau débat
  const handleCreateDebate = () => {
    if (newDebate.title.trim() && newDebate.description.trim()) {
      const nextId = debates.length > 0
        ? Math.max(...debates.map((d: Debate) => typeof d.id === 'number' ? d.id : 0)) + 1
        : Date.now();
      const newDebateObj: Debate = {
        id: nextId,
        title: newDebate.title,
        description: newDebate.description,
        images:
        newDebate.images.length > 0 ?
        newDebate.images.map((img: { preview: string }) => img.preview) :
        [
        'https://images.unsplash.com/photo-1508098682722-e99c643e7f76?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'],

        category: newDebate.category,
        participants: 1,
        messages: [],
        lastActivity: "à l'instant",
        likes: 0,
        likedBy: [],
        author: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar
        }
      };
      setDebates([newDebateObj, ...debates]);
      setShowCreateDebateModal(false);
      setNewDebate({
        title: '',
        description: '',
        images: [],
        category: 'Général'
      });
      // Créer une notification pour le nouveau débat
      addNotification({
        type: 'new_debate',
        title: 'Nouveau débat créé',
        message: `${currentUser.username} a créé un nouveau débat: "${newDebateObj.title}"`,
        time: "à l'instant",
        read: false,
        user: currentUser.username,
        avatar: currentUser.avatar,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        debateId: newDebateObj.id as any
      });
      // Ouvrir automatiquement le nouveau débat
      setActiveDebate(newDebateObj.id);
    }
  };
  // Fonction pour modifier un débat existant
  const handleEditDebate = () => {
    if (
    editingDebateId &&
    newDebate.title.trim() &&
    newDebate.description.trim())
    {
      setDebates(
        debates.map((debate: Debate) => {
          if (debate.id === editingDebateId) {
            return {
              ...debate,
              title: newDebate.title,
              description: newDebate.description,
              images:
              newDebate.images.length > 0 ?
              newDebate.images.map((img: { preview: string }) => img.preview) :
              debate.images,
              category: newDebate.category,
              lastActivity: "Modifié à l'instant"
            };
          }
          return debate;
        })
      );
      setShowCreateDebateModal(false);
      setIsEditingDebate(false);
      setEditingDebateId(null);
      setNewDebate({
        title: '',
        description: '',
        images: [],
        category: 'Général'
      });
      // Créer une notification pour la modification du débat
      addNotification({
        type: 'new_debate',
        title: 'Débat modifié',
        message: `${currentUser.username} a modifié son débat: "${newDebate.title}"`,
        time: "à l'instant",
        read: false,
        user: currentUser.username,
        avatar: currentUser.avatar,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        debateId: editingDebateId as any
      });
    }
  };
  // Fonction pour ouvrir le modal de modification
  const handleOpenEditModal = (debateId: number | string) => {
    const debateToEdit = debates.find((d) => d.id === debateId);
    if (debateToEdit) {
      setNewDebate({
        title: debateToEdit.title,
        description: debateToEdit.description,
        images: debateToEdit.images.map((img: string, index: number) => ({
          id: index,
          file: `image-${index}`,
          preview: img
        })),
        category: debateToEdit.category
      });
      setEditingDebateId(debateId);
      setIsEditingDebate(true);
      setShowCreateDebateModal(true);
    }
  };
  // Fonction pour confirmer la suppression d'un débat
  const handleConfirmDeleteDebate = () => {
    if (debateToDeleteId) {
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
  const handleAddDebateMessage = () => {
    if (debateInput.trim() && activeDebate !== null) {
      const newMessage = {
        id: Date.now(),
        user: currentUser.username,
        avatar: currentUser.avatar,
        text: debateInput,
        time: "à l'instant",
        likes: 0,
        replies: []
      };
      const updatedDebates = debates.map((debate: Debate) => {
        if (debate.id === activeDebate) {
          // Si on répond à un message
          if (replyToMessage) {
            return {
              ...debate,
              messages: debate.messages.map((message: Message) => {
                if (message.id === replyToMessage.id) {
                  return {
                    ...message,
                    replies: [
                    ...(message.replies || []),
                    {
                      id: Date.now(),
                      user: currentUser.username,
                      avatar: currentUser.avatar,
                      text: debateInput,
                      time: "à l'instant",
                      likes: 0
                    }]

                  };
                }
                return message;
              }),
              lastActivity: "à l'instant"
            };
          } else {
            // Si on ajoute un nouveau message
            return {
              ...debate,
              messages: [...debate.messages, newMessage],
              lastActivity: "à l'instant"
            };
          }
        }
        return debate;
      });
      setDebates(updatedDebates);
      setDebateInput('');
      setReplyToMessage(null);
      // Ajouter une notification pour le nouveau commentaire
      const currentDebate = debates.find((d: Debate) => d.id === activeDebate);
      if (currentDebate && currentDebate.author.id !== currentUser.id) {
        addNotification({
          type: replyToMessage ? 'reply' : 'new_comment',
          title: replyToMessage ? 'Nouvelle réponse' : 'Nouveau commentaire',
          message: replyToMessage ?
          `${currentUser.username} a répondu à ${replyToMessage.user} dans un débat` :
          `${currentUser.username} a commenté le débat "${currentDebate.title}"`,
          time: "à l'instant",
          read: false,
          user: currentUser.username,
          avatar: currentUser.avatar,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          debateId: activeDebate as any
        });
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
              message.likedBy && message.likedBy.some(id => String(id) === String(currentUser.id));
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  debateId: debate.id as any // Conversion temporaire pour NotificationContext si nécessaire
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
                    reply.likedBy && reply.likedBy.some(id => String(id) === String(currentUser.id));
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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        debateId: debate.id as any
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
  const handleLikeDebate = (e: React.MouseEvent, debateId: number | string) => {
    e.stopPropagation(); // Empêcher l'ouverture du débat quand on clique sur le bouton j'aime
    const updatedDebates = debates.map((debate) => {
      if (debate.id === debateId) {
        // Vérifier si l'utilisateur a déjà aimé ce débat
        const userLiked = debate.likedBy.some(id => String(id) === String(currentUser.id));
        // Créer une notification pour le like (seulement si c'est un nouveau like)
        if (!userLiked && debate.author.id !== currentUser.id) {
          addNotification({
            type: 'like',
            title: "J'aime sur votre débat",
            message: `${currentUser.username} a aimé votre débat "${debate.title}"`,
            time: "à l'instant",
            read: false,
            user: currentUser.username,
            avatar: currentUser.avatar,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            debateId: debate.id as any
          });
        }
        if (userLiked) {
          // Si l'utilisateur a déjà aimé, retirer son like
          return {
            ...debate,
            likes: Math.max(0, debate.likes - 1),
            likedBy: debate.likedBy.filter((id) => String(id) !== String(currentUser.id))
          };
        } else {
          // Sinon, ajouter son like
          return {
            ...debate,
            likes: debate.likes + 1,
            likedBy: [...debate.likedBy, currentUser.id]
          };
        }
      }
      return debate;
    });
    setDebates(updatedDebates);
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
                setNewDebate({
                  title: '',
                  description: '',
                  images: [],
                  category: 'Général'
                });
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
    {/* Modal pour créer ou modifier un débat */}
    {showCreateDebateModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-brand-navy-2 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl animate-scale-in border border-slate-200 dark:border-brand-slate overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-brand-slate flex justify-between items-center bg-brand-green text-white">
              <h3 className="text-lg font-medium">
                {isEditingDebate ?
              'Modifier le débat' :
              'Créer un nouveau débat'}
              </h3>
              <button
              onClick={() => setShowCreateDebateModal(false)}
              className="p-1 rounded-full hover:bg-green-700"
              title="Fermer">

                <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">

                  <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />

                </svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-brand-text-2 mb-1.5">
                    Titre du débat
                  </label>
                  <input
                    type="text"
                    className="input-dark text-slate-900 dark:text-white"
                    placeholder="Ex: La VAR a-t-elle amélioré le football?"
                  value={newDebate.title}
                  onChange={(e) =>
                  setNewDebate({
                    ...newDebate,
                    title: e.target.value
                  })
                  } />

                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-brand-text-2 mb-1.5">
                    Description
                  </label>
                  <textarea
                    className="input-dark text-slate-900 dark:text-white"
                    rows={4}
                    placeholder="Décrivez brièvement le sujet du débat..."
                  value={newDebate.description}
                  onChange={(e) =>
                  setNewDebate({
                    ...newDebate,
                    description: e.target.value
                  })
                  } />

                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-brand-text-2 mb-1.5">
                    Images du débat
                  </label>
                  <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  title="Télécharger des images"
                  multiple />

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSelectImage}
                      className="px-4 py-2 bg-slate-100 dark:bg-brand-navy-3 text-slate-700 dark:text-brand-text-1 border border-slate-200 dark:border-brand-slate rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-brand-navy-4 transition-colors flex items-center"
                    >

                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">

                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />

                      </svg>
                      Ajouter des images
                    </button>
                    <span className="text-sm text-slate-500 dark:text-brand-text-3">
                      {newDebate.images.length > 0 ?
                        `${newDebate.images.length} image(s) sélectionnée(s)` :
                        'Aucune image sélectionnée'}
                    </span>
                  </div>
                  {/* Prévisualisation des images */}
                  {newDebate.images.length > 0 &&
                <div className="mt-2 grid grid-cols-3 gap-2">
                      {newDebate.images.map((img: { id: number, preview: string }) => (
                  <div key={img.id} className="relative group">
                          <img
                      src={img.preview}
                      alt="Prévisualisation"
                      className="h-20 w-full object-cover rounded-lg border border-gray-200" />

                          <button
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Supprimer l'image">

                            <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">

                              <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12" />

                            </svg>
                          </button>
                        </div>
                  ))}
                    </div>
                }
                  <p className="text-xs text-slate-400 dark:text-brand-text-3 mt-1.5">
                    Si aucune image n'est sélectionnée, une image par défaut sera utilisée.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-brand-text-2 mb-1.5">
                    Catégorie
                  </label>
                  <select
                    className="input-dark appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                    value={newDebate.category}
                    title="Choisir une catégorie"
                    onChange={(e) =>
                      setNewDebate({
                        ...newDebate,
                        category: e.target.value
                      })
                    }
                  >

                    <option value="Général">Général</option>
                    <option value="Arbitrage">Arbitrage</option>
                    <option value="Économie">Économie</option>
                    <option value="Compétitions">Compétitions</option>
                    <option value="Transferts">Transferts</option>
                    <option value="Tactique">Tactique</option>
                    <option value="Clubs">Clubs</option>
                    <option value="Joueurs">Joueurs</option>
                  </select>
                </div>
                <div className="flex items-center p-3 bg-slate-50 dark:bg-brand-navy-3 rounded-xl border border-slate-100 dark:border-brand-slate">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border border-slate-200 dark:border-brand-slate shadow-sm">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-brand-text-3">
                    Vous publiez en tant que{' '}
                    <span className="font-bold text-slate-900 dark:text-brand-text-1">{currentUser.username}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-brand-slate flex justify-end gap-3 bg-slate-50/50 dark:bg-brand-navy-3/50">
              <button
                onClick={() => setShowCreateDebateModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-brand-slate text-slate-700 dark:text-brand-text-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-brand-navy-4 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={isEditingDebate ? handleEditDebate : handleCreateDebate}
                className="btn-primary py-2 px-6 text-sm"
                disabled={!newDebate.title.trim() || !newDebate.description.trim()}
              >
                {isEditingDebate ? 'Enregistrer' : 'Créer le débat'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmation pour la suppression d'un débat */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-brand-navy-2 rounded-2xl max-w-sm w-full shadow-2xl animate-scale-in border border-slate-200 dark:border-brand-slate overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-brand-slate flex justify-between items-center bg-red-600 text-white">
              <h3 className="text-lg font-bold">Confirmer la suppression</h3>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="p-1 rounded-full hover:bg-red-700 transition-colors"
                title="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 dark:text-brand-text-2 text-sm leading-relaxed">
                Êtes-vous sûr de vouloir supprimer ce débat ? Cette action est irréversible et supprimera également tous les messages associés.
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-brand-slate flex justify-end gap-3 bg-slate-50 dark:bg-brand-navy-3/30">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-brand-slate text-slate-700 dark:text-brand-text-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-brand-navy-4 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDeleteDebate}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>);

};
export default News;
