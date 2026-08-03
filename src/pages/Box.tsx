import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import UpgradeProModal from '../components/UpgradeProModal';
import { usePayment } from '../hooks/usePayment';
import { Channel } from '../types/chat';
import { ChannelListItem } from '../components/box/ChannelListItem';
import { ChannelTabs } from '../components/box/ChannelTabs';
import { CreateChannelModal, NewChannelData } from '../components/box/CreateChannelModal';
import { SubscribeChannelModal } from '../components/box/SubscribeChannelModal';
import { useChannelData } from '../contexts/ChannelContext';

// Debates (Débats) imports
import { useNotifications } from '../contexts/NotificationContext';
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
  addDebateReply,
  likeDebate,
  likeDebateMessage,
  likeDebateReply,
  joinChannel,
  getActualites,
  favoriteDebate,
  deleteDebateMessage,
  deleteDebateReply,
  Debate,
  Reply,
  NewsArticle
} from '../services/api';
import NewsCarousel from '../components/news/NewsCarousel';
import NewsDetailOverlay from '../components/news/NewsDetailOverlay';

const Box = () => {
  const { user, isPro } = useAuth();
  const { processPayment } = usePayment();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
  const { channelData, addChannel, setChannelJoined, refreshChannels } = useChannelData();

  useEffect(() => {
    if (refreshChannels) {
      refreshChannels();
    }
  }, []);
  
  const [mainView, setMainView] = useState<'canaux' | 'debats'>(() => {
    return (localStorage.getItem('pronobox_mainView') as 'canaux' | 'debats') || 'canaux';
  });

  useEffect(() => {
    localStorage.setItem('pronobox_mainView', mainView);
  }, [mainView]);
  
  const [showProModal, setShowProModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [processingChannelId, setProcessingChannelId] = useState<number | string | null>(null);
  const [editingChannel, setEditingChannel] = useState<number | string | null>(null);
  const [channelCreationStep, setChannelCreationStep] = useState(1);

  // Channels state
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (channelData?.channels) {
      setChannels(channelData.channels as unknown as Channel[]);
    }
  }, [channelData]);

  const [channelFeatures, setChannelFeatures] = useState<Record<string | number, unknown>>({
    1: { voiceMessages: true, comments: true, paidCoupons: false },
    2: { voiceMessages: true, comments: true, paidCoupons: true }
  });

  const [newChannel, setNewChannel] = useState<NewChannelData>({
    name: '',
    description: '',
    type: 'free',
    price: '4.99',
    isPrivate: false,
    avatar: '',
    features: {
      voiceMessages: true,
      comments: true,
      paidCoupons: false
    }
  });

  // Debates state
  const [debates, setDebates] = useState<Debate[]>([]);
  const [activeDebate, setActiveDebate] = useState<number | string | null>(null);
  const [debateInput, setDebateInput] = useState('');
  const [showCreateDebateModal, setShowCreateDebateModal] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<{
    id: number | string;
    user: string;
    text?: string;
  } | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditingDebate, setIsEditingDebate] = useState(false);
  const [editingDebateId, setEditingDebateId] = useState<number | string | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [debateToDeleteId, setDebateToDeleteId] = useState<number | string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Actualites state
  const [actualites, setActualites] = useState<NewsArticle[]>([]);
  const [newsDetailArticle, setNewsDetailArticle] = useState<NewsArticle | null>(null);
  const [sourceArticleForDebate, setSourceArticleForDebate] = useState<NewsArticle | null>(null);

  const currentUser = {
    id: user?.id || 1,
    username: user?.username ?? 'PronosUser',
    avatar: user?.avatar ?? 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    isPro: user?.isPro ?? false,
    role: user?.role ?? 'user'
  };

  const isAdmin = user?.role === 'admin';

  // Handle navigation state from notification clicks
  useEffect(() => {
    const state = location.state as any;
    if (!state) return;
    if (state.activeDebateId) {
      setMainView('debats');
      setActiveDebate(state.activeDebateId);
    } else if (state.mainView === 'debats') {
      setMainView('debats');
    }
    // Clear state so it doesn't retrigger on re-render
    window.history.replaceState({}, '');
  }, [location.state]);

  // Load debates on mount
  useEffect(() => {
    getDebates()
      .then((data: Debate[]) => setDebates(data))
      .catch((err: Error) => console.error('Failed to load debates', err));
  }, []);

  // Fetch actualites when view changes
  useEffect(() => {
    if (mainView === 'debats') {
      getActualites().then(data => {
        setActualites(data);
      }).catch(console.error);
    }
  }, [mainView]);

  // Determine if the user is a channel owner or admin
  const isChannelOwner = channels.some(
    (c) => String(c.owner?.id || c.owner) === String(user?.id)
  ) || user?.role === 'admin';

  // Pro/Admin/ChannelOwner can create a debate
  const canCreateDebate = isChannelOwner || isPro;

  const proLimitReached = isPro && !isAdmin && debates.some(d => {
    const authorId = d.author?.id || (d.author as any)?._id || d.author || d.authorId;
    const isActive = !d.expiresAt || new Date(d.expiresAt) > new Date();
    return String(authorId) === String(user?.id) && isActive;
  });

  const handleOpenChannel = (channelId: string | number) => {
    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return;
    // Always open the channel - if not joined, join first then open
    if (channel.joined || isPro || isAdmin) {
      navigate(`/channel/${channelId}`, { state: { activeTab, channelData: { ...channel, joined: true } } });
    } else {
      handleJoinChannel(channel);
    }
  };

  const handleJoinChannel = async (channel: Channel) => {
    if (processingChannelId) return;
    // Premium paywall check for non-pro, non-admin users
    if (channel.premium && !channel.joined && !isPro && !isAdmin) {
      setSelectedChannel(channel);
      setShowSubscribeModal(true);
      return;
    }

    setProcessingChannelId(channel.id);

    // Update state and open channel immediately — do NOT wait for the API
    setChannelJoined(channel.id, true);
    navigate(`/channel/${channel.id}`, { state: { activeTab, channelData: { ...channel, joined: true } } });

    // Persist in background — UI is already updated regardless of outcome
    joinChannel(channel.id)
      .catch((err) => console.error('Failed to persist channel join:', err))
      .finally(() => setProcessingChannelId(null));
  };

  const handleSubscribe = async () => {
    if (!selectedChannel) return;
    setProcessingChannelId(selectedChannel.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await processPayment({ amount: selectedChannel.price || 0, method: 'card', plan: 'subscription' });
      setChannelJoined(selectedChannel.id, true);
      setShowSubscribeModal(false);
      navigate(`/channel/${selectedChannel.id}`, { state: { activeTab, channelData: selectedChannel } });
    } finally {
      setProcessingChannelId(null);
    }
  };

  const handleTogglePin = (channelId: string | number) => {
    setChannels(channels.map(c => c.id === channelId ? { ...c, pinned: !c.pinned } : c));
  };

  const handleFeatureToggle = (channelId: string | number, feature: string) => {
    setChannelFeatures(prev => {
      const channelFeats = (prev[channelId] || {}) as Record<string, boolean>;
      return {
        ...prev,
        [channelId]: { ...channelFeats, [feature]: !channelFeats[feature] }
      };
    });
  };

  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addChannel({
        name: newChannel.name,
        description: newChannel.description,
        premium: newChannel.type === 'premium',
        subscriptionPrice: parseFloat(newChannel.price) || 0,
        avatar: newChannel.avatar || undefined
      });
    } catch (err) {
      console.error('Erreur création canal:', err);
    } finally {
      setShowCreateChannelModal(false);
    }
  };

  const filteredChannels = channels.filter((channel) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'premium') return channel.premium;
    if (activeTab === 'free') return !channel.premium;
    if (activeTab === 'joined') return channel.joined;
    if (activeTab === 'pinned') return channel.pinned && channel.joined;
    if (activeTab === 'owned') return channel.owner?.id === user?.id;
    return true;
  });

  // Debates logic
  const handleSaveDebate = async (debateData: { title: string; description: string; images: string[]; category: string }) => {
    try {
      if (isEditingDebate && editingDebateId) {
        const updatedDebate = await updateDebate(editingDebateId, debateData);
        setDebates(debates.map((d: Debate) => String(d.id) === String(editingDebateId) ? { ...d, ...updatedDebate, id: d.id } : d));
        
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
        const normalizedDebate = { ...newDebateObj, id: newDebateObj.id || newDebateObj._id };
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

  const handleOpenEditModal = (debateId: number | string) => {
    setEditingDebateId(debateId);
    setIsEditingDebate(true);
    setShowCreateDebateModal(true);
  };

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

  const navigateCarousel = (direction: 'prev' | 'next', imageCount: number) => {
    if (direction === 'prev') {
      setActiveImageIndex((prev: number) => (prev - 1 + imageCount) % imageCount);
    } else {
      setActiveImageIndex((prev: number) => (prev + 1) % imageCount);
    }
  };

  useEffect(() => {
    if (activeDebate !== null) {
      const debate = debates.find((d: Debate) => d.id === activeDebate);
      if (debate && debate.images.length > 1) {
        const interval = setInterval(() => {
          navigateCarousel('next', debate.images.length);
        }, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [activeDebate, debates]);

  const handleTouchStart = useRef({ x: 0, y: 0 });
  const handleTouchEnd = useRef({ x: 0, y: 0 });

  const handleSwipe = (imageCount: number) => {
    const touchThreshold = 50;
    const touchDiffX = handleTouchStart.current.x - handleTouchEnd.current.x;
    const touchDiffY = handleTouchStart.current.y - handleTouchEnd.current.y;
    if (Math.abs(touchDiffX) > Math.abs(touchDiffY) && Math.abs(touchDiffX) > touchThreshold) {
      if (touchDiffX > 0) {
        navigateCarousel('next', imageCount);
      } else {
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

  const handleDetailedViewTouchEnd = (e: React.TouchEvent, imageCount: number) => {
    handleTouchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    if (activeDebate !== null) {
      handleSwipe(imageCount);
    }
  };

  const handleAddDebateMessage = async () => {
    if (debateInput.trim() && activeDebate !== null) {
      try {
        const debateToUpdate = debates.find(d => String(d.id) === String(activeDebate));
        if (!debateToUpdate) return;
        
        let result: any;
        let updatedDebates;
        let debateTitle = debateToUpdate.title;

        if (replyToMessage) {
          // If we are replying to a specific message, call the nested reply API
          result = await addDebateReply(activeDebate, replyToMessage.id, debateInput);
          
          updatedDebates = debates.map(d => {
            if (String(d.id) === String(activeDebate)) {
              return {
                ...d,
                messages: d.messages.map(m => {
                  if (String(m.id) === String(replyToMessage.id)) {
                    const normalizedReply = {
                      ...result,
                      id: result.id || result._id,
                      user: typeof result.user === 'object' && result.user !== null ? result.user.username : (result.user || currentUser.username),
                      avatar: typeof result.user === 'object' && result.user !== null ? result.user.avatar : (result.avatar || currentUser.avatar),
                      time: result.time || "à l'instant"
                    };
                    return {
                      ...m,
                      replies: [...(m.replies || []), normalizedReply]
                    };
                  }
                  return m;
                })
              };
            }
            return d;
          });
        } else {
          // Send top-level comment
          result = await addDebateMessage(activeDebate, debateInput);
          
          if (result && result.text && !result.title) {
            // Live mode: returned object is the new message/comment
            const newMessage = {
              ...result,
              id: result.id || result._id,
              // Normalize user/avatar fields for robust rendering
              user: typeof result.user === 'object' && result.user !== null ? result.user.username : (result.user || currentUser.username),
              avatar: typeof result.user === 'object' && result.user !== null ? result.user.avatar : (result.avatar || currentUser.avatar),
              time: result.time || "à l'instant",
              replies: []
            };
            
            updatedDebates = debates.map(d => {
              if (String(d.id) === String(activeDebate)) {
                return {
                  ...d,
                  messages: [...(d.messages || []), newMessage]
                };
              }
              return d;
            });
          } else {
            // Fallback/mock mode: returned object is the full updated debate
            updatedDebates = debates.map(d => String(d.id) === String(activeDebate) ? { ...d, ...result, id: d.id } : d);
            
            const updatedDebateObj = updatedDebates.find(d => String(d.id) === String(activeDebate));
            if (updatedDebateObj) {
              debateTitle = updatedDebateObj.title;
            }
          }
        }
        
        setDebates(updatedDebates);
        setDebateInput('');
        setReplyToMessage(null);
        
        // Trigger notification only if commenter is NOT the debate author
        const debateAuthorId = debateToUpdate.authorId || 
          (debateToUpdate.author && typeof debateToUpdate.author === 'object' ? (debateToUpdate.author as any).id || (debateToUpdate.author as any)._id : null) ||
          debateToUpdate.author;
          
        if (debateAuthorId && String(debateAuthorId) !== String(currentUser.id)) {
          addNotification({
            type: replyToMessage ? 'reply' : 'new_comment',
            title: replyToMessage ? 'Nouvelle réponse' : 'Nouveau commentaire',
            message: replyToMessage ?
              `${currentUser.username} a répondu à ${replyToMessage.user} dans un débat` :
              `${currentUser.username} a commenté le débat "${debateTitle}"`,
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

  const handleLikeMessage = async (debateId: number | string, messageId: number | string) => {
    try {
      const response = await likeDebateMessage(String(debateId), String(messageId));
      const updatedDebates = debates.map((debate) => {
        if (String(debate.id) === String(debateId)) {
          return {
            ...debate,
            messages: debate.messages.map((message) => {
              if (String(message.id) === String(messageId)) {
                return {
                  ...message,
                  likes: response.likes,
                  likedBy: response.likedBy
                };
              }
              return message;
            })
          };
        }
        return debate;
      });
      setDebates(updatedDebates);
    } catch (error) {
      console.error('Failed to like message:', error);
    }
  };

  const handleLikeReply = async (debateId: number | string, messageId: number | string, replyId: number | string) => {
    try {
      const response = await likeDebateReply(String(debateId), String(messageId), String(replyId));
      const updatedDebates = debates.map((debate) => {
        if (String(debate.id) === String(debateId)) {
          return {
            ...debate,
            messages: debate.messages.map((message) => {
              if (String(message.id) === String(messageId)) {
                return {
                  ...message,
                  replies: (message.replies || []).map((reply: Reply) => {
                    if (String(reply.id) === String(replyId)) {
                      return {
                        ...reply,
                        likes: response.likes,
                        likedBy: response.likedBy
                      };
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
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  const handleReplyToMessage = (_debateId: number | string, messageId: number | string, user: string) => {
    // Look up parent comment text preview for quote box display
    const debate = debates.find(d => String(d.id) === String(activeDebate));
    const message = debate?.messages.find(m => String(m.id) === String(messageId));

    setReplyToMessage({
      id: messageId,
      user,
      text: message?.text
    });
    document.getElementById('debate-input')?.focus();
  };

  const handleLikeDebate = async (e: React.MouseEvent, debateId: number | string) => {
    e.stopPropagation();
    try {
      const updatedDebate = await likeDebate(debateId);
      setDebates(debates.map((d: Debate) => (String(d.id) === String(debateId) || String(d._id) === String(debateId)) ? { ...d, ...updatedDebate, id: d.id || d._id } : d));
    } catch (err) {
      console.error("Failed to like debate", err);
    }
  };

  const handleFavoriteDebate = async (debateId: string) => {
    try {
      const updated = await favoriteDebate(debateId);
      setDebates(prev => prev.map(d => (String(d.id) === String(debateId) || String(d._id) === String(debateId)) ? { ...d, ...updated, id: d.id || d._id } : d));
    } catch (error) {
      console.error('Error favoriting debate:', error);
    }
  };

  const handleDeleteDebateMessage = async (debateId: number | string, messageId: number | string) => {
    try {
      const updatedDebate = await deleteDebateMessage(debateId, messageId);
      setDebates(debates.map((d: Debate) => (String(d.id) === String(debateId) || String(d._id) === String(debateId)) ? { ...d, ...updatedDebate, id: d.id || d._id } : d));
    } catch (error) {
      console.error('Error deleting debate message:', error);
    }
  };

  const handleDeleteDebateReply = async (debateId: number | string, messageId: number | string, replyId: number | string) => {
    try {
      const updatedDebate = await deleteDebateReply(debateId, messageId, replyId);
      setDebates(debates.map((d: Debate) => (String(d.id) === String(debateId) || String(d._id) === String(debateId)) ? { ...d, ...updatedDebate, id: d.id || d._id } : d));
    } catch (error) {
      console.error('Error deleting debate reply:', error);
    }
  };



  const handleDirectDebateFromArticle = async (article: NewsArticle) => {
    try {
      const newDebateObj = await createDebate({
        title: article.title,
        description: article.description,
        images: article.image ? [article.image] : [],
        category: 'Actualités'
      });
      const normalizedDebate = { ...newDebateObj, id: newDebateObj.id || newDebateObj._id };
      setDebates([normalizedDebate, ...debates]);
      setActiveDebate(normalizedDebate.id);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Debate already exists, navigate to it
        setActiveDebate(err.response.data.debateId);
      } else {
        console.error("Failed to create debate from article", err);
      }
    }
  };

  const filteredDebates = activeCategory === 'all' ? debates : debates.filter((d: Debate) => d.category === activeCategory);
  const categories = ['all', ...new Set(debates.map((d: Debate) => d.category))];

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Top Toggle for Canaux vs Débats */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:max-w-md mx-auto mb-6">
        <button
          onClick={() => setMainView('canaux')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            mainView === 'canaux'
              ? 'bg-white dark:bg-slate-700 text-brand-green shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Canaux
        </button>
        <button
          onClick={() => setMainView('debats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
            mainView === 'debats'
              ? 'bg-white dark:bg-slate-700 text-brand-green shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Débats
        </button>
      </div>

      <div className="w-full">
        {mainView === 'canaux' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold dark:text-white">Canaux</h2>
              <button
                onClick={() => isPro ? setShowCreateChannelModal(true) : setShowProModal(true)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
              >
                <span className="mr-1">+</span> Créer un canal
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
              <ChannelTabs activeTab={activeTab} setActiveTab={setActiveTab} isPro={isPro} />
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredChannels.map((channel) => (
                  <ChannelListItem
                    key={channel.id}
                    channel={channel}
                    currentUserId={user?.id || ''}
                    isPro={isPro}
                    onOpen={handleOpenChannel}
                    onTogglePin={handleTogglePin}
                    onJoin={handleJoinChannel}
                    isProcessingJoin={processingChannelId === channel.id}
                    isEditing={editingChannel === channel.id}
                    onToggleEdit={(id) => setEditingChannel(editingChannel === id ? null : id)}
                    channelFeatures={channelFeatures}
                    onFeatureToggle={handleFeatureToggle}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              
              <NewsCarousel 
                articles={actualites} 
                debates={debates}
                isChannelOwner={isChannelOwner}
                onArticleClick={setNewsDetailArticle}
                onDebattre={handleDirectDebateFromArticle}
              />

              <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  Débats récents
              </h3>
              {/* Le bouton Nouveau est affiché pour les propriétaires, admins et membres Pro */}
              {canCreateDebate && (
                <button
                  onClick={() => {
                    if (proLimitReached) {
                      alert("Vous avez déjà un débat actif. Les abonnés Pro sont limités à 1 débat actif à la fois.");
                      return;
                    }
                    setIsEditingDebate(false);
                    setEditingDebateId(null);
                    setShowCreateDebateModal(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded text-xs font-semibold transition"
                >
                  + Nouveau
                </button>
              )}
            </div>

            {/* Catégories de débats dans la Sidebar */}
            <div className="mb-4">
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onChange={setActiveCategory}
              />
            </div>

            {/* Liste des débats */}
            {filteredDebates.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8">Aucun débat dans cette catégorie.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredDebates.map((debate) => {
                  const debateImage = debate.images && debate.images[0]
                    ? debate.images[0]
                    : 'https://images.unsplash.com/photo-1508098682722-e99c643e7f76?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80';

                  return (
                    <div
                      key={debate.id}
                      onClick={() => {
                        setActiveDebate(debate.id);
                        setActiveImageIndex(0);
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg cursor-pointer transition border border-slate-100 dark:border-slate-800 flex gap-3 items-start"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-brand-slate shadow-sm">
                        <img
                          src={debateImage}
                          alt={debate.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">{debate.title}</h4>
                          <span className="text-[10px] bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {debate.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{debate.description}</p>
                        <div className="flex justify-between items-center mt-3 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                          <span className="truncate max-w-[120px]">Par {debate.author?.username || 'Anonyme'}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5">❤️ {debate.likes}</span>
                            <span className="flex items-center gap-0.5">💬 {debate.messages?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      <SubscribeChannelModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        channel={selectedChannel}
        onSubscribe={handleSubscribe}
        isProcessing={processingChannelId === selectedChannel?.id}
      />

      <CreateChannelModal
        isOpen={showCreateChannelModal}
        onClose={() => setShowCreateChannelModal(false)}
        step={channelCreationStep}
        setStep={setChannelCreationStep}
        newChannel={newChannel}
        setNewChannel={setNewChannel}
        onTypeSelect={(type) => {
          setNewChannel({ ...newChannel, type });
          setChannelCreationStep(2);
        }}
        onSubmit={handleCreateChannelSubmit}
        onFeatureToggle={(feature) => setNewChannel({
          ...newChannel,
          features: { ...newChannel.features, [feature]: !newChannel.features[feature as keyof typeof newChannel.features] }
        })}
      />

      <UpgradeProModal isOpen={showProModal} onClose={() => setShowProModal(false)} />

      {/* Debate creation/edition modal */}
      <CreateDebateModal
        isOpen={showCreateDebateModal}
        onClose={() => {
          setShowCreateDebateModal(false);
          setSourceArticleForDebate(null);
        }}
        onSave={handleSaveDebate}
        currentUser={currentUser}
        isEditing={isEditingDebate}
        initialData={editingDebateId ? debates.find(d => d.id === editingDebateId) : undefined}
        sourceArticle={sourceArticleForDebate}
      />

      {/* Delete Debate Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDeleteDebate}
        description="Êtes-vous sûr de vouloir supprimer ce débat ? Cette action est irréversible et supprimera également tous les messages associés."
      />

      {/* Immersive detailed view modal with backdrop-blur */}
      {activeDebate !== null && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col relative border border-slate-200 dark:border-slate-700">
            {/* Sticky Header */}
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-gray-800 rounded-t-xl z-20 shrink-0">
               <button
                 onClick={() => { setActiveDebate(null); setReplyToMessage(null); }}
                 className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-brand-text-2 hover:text-brand-green transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                 </svg>
                 Retour aux débats
               </button>
               <button
                 onClick={() => { setActiveDebate(null); setReplyToMessage(null); }}
                 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 bg-slate-100 dark:bg-slate-700 rounded-full"
                 title="Fermer"
               >
                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>
            {/* Scrollable Content */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1">
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
                  onLikeDebate={(e, id) => handleLikeDebate(e, id)}
                  onLikeMessage={handleLikeMessage}
                  onLikeReply={handleLikeReply}
                  onReply={handleReplyToMessage}
                  onCancelReply={() => setReplyToMessage(null)}
                  onNavigateCarousel={(dir, count) =>
                    setActiveImageIndex((prev) => (dir === 'next' ? (prev + 1) % count : (prev - 1 + count) % count))
                  }
                  onSetImageIndex={setActiveImageIndex}
                  onOpenEdit={(id) => handleOpenEditModal(id)}
                  onRequestDelete={(id) => { setDebateToDeleteId(id); setShowDeleteConfirmModal(true); }}
                  onTouchStart={handleDetailedViewTouchStart}
                  onTouchEnd={handleDetailedViewTouchEnd}
                  onFavorite={handleFavoriteDebate}
                  isAdmin={currentUser.role === 'admin'}
                  onDeleteMessage={handleDeleteDebateMessage}
                  onDeleteReply={handleDeleteDebateReply}
                />
              );
            })()}
            </div>
          </div>
        </div>
      )}

      {/* Article Detail Overlay */}
      {newsDetailArticle && (
        <NewsDetailOverlay
          article={newsDetailArticle}
          isChannelOwner={isChannelOwner}
          existingDebateId={debates.find(d => d.sourceArticle?.articleId === newsDetailArticle.id)?.id as string | undefined}
          onClose={() => setNewsDetailArticle(null)}
          onDebattre={(article) => {
            setNewsDetailArticle(null);
            handleDirectDebateFromArticle(article);
          }}
          onViewDebate={(debateId) => {
            setNewsDetailArticle(null);
            setActiveDebate(debateId);
          }}
        />
      )}
    </div>
  );
};

export default Box;