import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Message, Channel } from '../types/chat';
import { useUserFeatures } from '../hooks/useUserFeatures';
import { useChannelData } from '../contexts/ChannelContext';
import { ChannelHeader } from '../components/channel/ChannelHeader';
import { MessageCard } from '../components/channel/MessageCard';
import { MessageInput } from '../components/channel/MessageInput';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import api, { joinChannel, leaveChannel, deleteChannel, updateChannel, uploadMedia, deleteChannelMessage, sendMessage } from '../services/api';
import ChannelLeaveConfirmation from '../components/ChannelLeaveConfirmation';
import CreatePronoModal, { PronoSubmissionData } from '../components/predictions/CreatePronoModal';
import UnifiedPaymentModal from '../components/payment/UnifiedPaymentModal';

const ChannelView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userFunctions = useUserFeatures(user);

  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'smooth') => {
    if (messageListRef.current) {
      const container = messageListRef.current;
      if (behavior === 'auto') {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    } else {
      if (behavior === 'smooth') {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }
    }
  };

  useEffect(() => {
    if (channel && channel.messages.length > 0) {
      scrollToBottom('auto');
      const timer = setTimeout(() => scrollToBottom('auto'), 150);
      return () => clearTimeout(timer);
    }
  }, [channel?.id]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem(`channel_notifications_${id}`) === 'true';
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [showDeleteChannelConfirm, setShowDeleteChannelConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showCreatePronoModal, setShowCreatePronoModal] = useState(false);

  // Build member list from REAL populated user data returned by the backend
  const memberList = useMemo(() => {
    if (!channel) return [];

    const list: Array<{
      id: string | number;
      username: string;
      avatar: string;
      role: string;
      isOnline: boolean;
    }> = [];

    const seen = new Set<string>();

    // Use real populated member users from the database
    const realMembers = channel.memberUsers || [];
    const ownerId = channel.owner?.id ? String(channel.owner.id) : '';
    const ownerUsername = channel.owner?.username ? channel.owner.username.toLowerCase() : '';

    realMembers.forEach(member => {
      if (!member || !member.username) return;
      const key = member.username.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);

      const isOwner = !!(
        (ownerId && String(member.id) === ownerId) ||
        (ownerUsername && key === ownerUsername)
      );
      list.push({
        id: member.id,
        username: member.username,
        avatar: member.avatar || '',
        role: isOwner ? 'Propriétaire' : 'Membre',
        isOnline: isOwner // only owner shown as online for now
      });
    });

    // If owner is not in the members array, add them at position 0
    if (channel.owner && channel.owner.username && !seen.has(channel.owner.username.toLowerCase())) {
      list.unshift({
        id: channel.owner.id || 'owner',
        username: channel.owner.username,
        avatar: channel.owner.avatar || '',
        role: 'Propriétaire',
        isOnline: true
      });
    }

    // Sort: owner first, then alphabetically
    list.sort((a, b) => {
      if (a.role === 'Propriétaire') return -1;
      if (b.role === 'Propriétaire') return 1;
      return a.username.localeCompare(b.username);
    });

    return list;
  }, [channel]);


  const handlePronoSubmitted = async (data: PronoSubmissionData) => {
    if (!channel) return;
    const textContent = data.formattedTitle + (data.analysis ? `\n\n💡 Analyse: ${data.analysis}` : '');

    const newMsg: Message = {
      id: Date.now(),
      text: textContent,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      user: {
        id: user?.id || 'tipster',
        username: user?.username || 'Tipster',
        avatar: user?.avatar || ''
      },
      timestamp: new Date(),
      likes: 0,
      likedBy: [],
      pronoMatchId: typeof data.matchId === 'number' ? data.matchId : undefined,
      pronoStatus: 'pending'
    };

    setChannel(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        lastMessage: data.formattedTitle,
        messages: [...prev.messages, newMsg]
      };
    });

    setTimeout(() => scrollToBottom('smooth'), 100);

    try {
      await sendMessage(channel.id, textContent);

      // Sync pronostic to main /pronos page feed so users can view it on the Pronostics page!
      const teams = (data.match || 'Match Football').split(' vs ');
      const homeTeamName = teams[0] ? teams[0].trim() : 'Équipe 1';
      const awayTeamName = teams[1] ? teams[1].trim() : 'Équipe 2';
      const isPremium = Boolean(channel.premium);
      const pronoMatchDate = data.matchDate ? new Date(data.matchDate) : new Date();

      await api.post('/pronos', {
        matchId: data.matchId || Date.now(),
        homeTeamName,
        awayTeamName,
        league: channel.name ? `Canal ${channel.name}` : 'PronosBox Channel',
        matchDate: pronoMatchDate,
        channelId: channel.id,
        freeExpectedResult: isPremium ? '' : data.pick,
        freeConfidence: isPremium ? 0 : (data.confidence || 80),
        freeObservation: isPremium ? '' : (data.analysis || 'Publication Canal'),
        premiumExpectedResult: isPremium ? data.pick : '',
        premiumOdds: isPremium ? (data.odds || 0) : 0,
        premiumConfidence: isPremium ? (data.confidence || 80) : 0,
        premiumObservation: isPremium ? (data.analysis || 'Publication Canal Premium') : '',
        status: 'pending',
        freeStatus: 'pending',
        premiumStatus: 'pending'
      });
    } catch (err) {
      console.warn('Failed to persist pronostic via API:', err);
    }
  };

  // Staged attachments (WhatsApp/Telegram style: preview before sending)
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [stagedImageFile, setStagedImageFile] = useState<File | null>(null);
  const [stagedAudio, setStagedAudio] = useState<string | null>(null);
  const [stagedAudioBlob, setStagedAudioBlob] = useState<Blob | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  // Edit states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  useEffect(() => {
    if (channel) {
      setEditName(channel.name);
      setEditDesc(channel.description || '');
    }
  }, [channel]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/channel/${id}`;
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => alert('Lien copié !'));
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}`);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`);
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    }
  };

  const { setChannelJoined, refreshChannels } = useChannelData();

  const handleLeaveChannel = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    // Immediately update the in-memory context state — no network round-trip needed
    if (channel) setChannelJoined(channel.id, false);
    try {
      if (channel) await leaveChannel(channel.id);
    } catch (err) {
      console.error('Failed to persist leave channel:', err);
      // Even if backend fails, the local state is already updated
    } finally {
      setIsLeaving(false);
    }
    setShowChannelInfo(false);
    setShowLeaveConfirmation(false);
    navigate('/box');
  };

  const handleDeleteChannel = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    // Remove from context immediately
    if (channel) setChannelJoined(channel.id, false);
    try {
      if (channel) await deleteChannel(channel.id);
    } catch (err) {
      console.error('Failed to persist delete channel:', err);
    } finally {
      setIsLeaving(false);
    }
    setShowChannelInfo(false);
    setShowDeleteChannelConfirm(false);
    navigate('/box');
  };


  useEffect(() => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Always fetch from the API to get fresh data including saved messages
    api.get(`/channels/${id}`)
      .then(res => {
        const data = res.data;

        let cachedMsgs: any[] = [];
        try {
          cachedMsgs = JSON.parse(localStorage.getItem(`pronobox_channel_messages_${id}`) || '[]');
        } catch (e) {}

        const serverMessages = (data.messages || []).map((m: any) => ({
          id: m._id || m.id || Date.now(),
          user: {
            id: m.user?._id || m.user?.id || m.user || '',
            username: m.user?.username || 'Utilisateur',
            avatar: m.user?.avatar || 'https://via.placeholder.com/150',
            role: m.user?.role || 'user',
            isPro: m.user?.isPro || false
          },
          text: m.text || '',
          imageUrl: m.imageUrl,
          audioUrl: m.audioUrl,
          isImage: m.isImage || false,
          isVoiceMessage: m.isVoiceMessage || false,
          replyTo: m.replyTo,
          timestamp: new Date(m.time || m.createdAt || Date.now()),
          likes: m.likes || 0,
          reactions: m.reactions || [],
          pronoMatchId: m.pronoMatchId,
          pronoStatus: m.pronoStatus,
          pronoActualResult: m.pronoActualResult
        }));

        const existingTexts = new Set(serverMessages.map((m: any) => m.text));
        const extraCached = cachedMsgs.filter((m: any) => !existingTexts.has(m.text));
        const combinedMessages = [...serverMessages, ...extraCached];

        const userIdStr = user?.id ? String(user.id) : '';
        const ownerIdStr = data.owner ? String(data.owner._id || data.owner.id || data.owner) : '';
        const isOwner = Boolean(userIdStr && ownerIdStr && userIdStr === ownerIdStr);
        const isAdmin = user?.role === 'admin';
        const isMemberInApi = Array.isArray(data.members) && data.members.some((m: any) => String(m._id || m.id || m) === userIdStr);

        const membership: Record<string, string[]> = JSON.parse(localStorage.getItem('pronobox_membership') || '{}');
        const channelKey = String(data._id || data.id);
        const isJoinedLocal = Boolean(membership[channelKey] && membership[channelKey].includes(userIdStr));

        const isUserJoined = !data.premium || isOwner || isAdmin || isMemberInApi || isJoinedLocal;

        const channelObj: Channel = {
          id: data._id || data.id,
          name: data.name,
          description: data.description || '',
          avatar: data.avatar || 'https://via.placeholder.com/150',
          category: data.premium ? 'premium' : 'free',
          members: Array.isArray(data.members) ? data.members.length : (data.members || 0),
          memberUsers: Array.isArray(data.members)
            ? data.members
                .filter((m: any) => m && (m._id || m.id) && (m.username || m.name))
                .map((m: any) => ({
                  id: m._id || m.id,
                  username: m.username || m.name || '',
                  avatar: m.avatar || ''
                }))
            : [],
          messages: combinedMessages,
          joined: isUserJoined,
          owner: data.owner ? {
            id: data.owner._id || data.owner.id || data.owner,
            username: data.owner.username || '',
            avatar: data.owner.avatar || ''
          } : undefined,
          premium: data.premium || false,
          price: data.subscriptionPrice || 0
        };
        setChannel(channelObj);
        setTimeout(() => scrollToBottom('auto'), 50);
        setTimeout(() => scrollToBottom('auto'), 150);
      })
      .catch(err => {
        console.error('Erreur chargement canal:', err);
        // Fallback: try context data without messages
        const stateData = location.state?.channelData || location.state?.preloadedData;
        if (stateData) {
          setChannel({
            id: stateData.id,
            name: stateData.name,
            description: stateData.description || '',
            avatar: stateData.avatar || stateData.image || 'https://via.placeholder.com/150',
            category: stateData.category || 'general',
            members: stateData.members || 0,
            messages: [],
            joined: true,
            owner: stateData.owner,
            premium: stateData.premium || false,
            price: stateData.price || 0
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (!user) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900 z-50">
        <p className="text-gray-600 dark:text-gray-400">Veuillez vous connecter pour accéder aux canaux.</p>
        <button
          onClick={() => navigate('/auth')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Se connecter
        </button>
      </div>
    );
  }

  if (loading || !channel) {
    return (
      <div className="fixed inset-0 w-full h-full flex justify-center items-center bg-gray-100 dark:bg-gray-900 z-50">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Canal non trouvé</p>
            <button onClick={() => navigate('/box')} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Retour aux canaux
            </button>
          </div>
        )}
      </div>
    );
  }

  const handleSendMessage = async (text: string, image?: string | null, audio?: string | null, replyTo?: Message | null) => {
    // Optimistic UI update
    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      user: {
        id: user.id,
        username: user.username || 'Utilisateur',
        avatar: user.avatar || 'https://via.placeholder.com/150',
        role: user.role,
        isPro: user.isPro
      },
      text: text || (image ? '[Image]' : audio ? '[Audio]' : ''),
      imageUrl: image || undefined,
      audioUrl: audio || undefined,
      isImage: !!image,
      isVoiceMessage: !!audio,
      timestamp: new Date(),
      likes: 0,
      reactions: [],
      replyTo: replyTo ? {
        id: replyTo.id,
        text: replyTo.text,
        username: replyTo.user.username
      } : undefined
    };
    setChannel(prev => prev ? { ...prev, messages: [...prev.messages, optimisticMessage] } : prev);
    setTimeout(() => scrollToBottom('smooth'), 50);

    // Persist to backend
    try {
      let finalImageUrl = image;
      let finalAudioUrl = audio;

      // Upload files first if they exist
      if (stagedImageFile) {
        const res = await uploadMedia(stagedImageFile);
        finalImageUrl = res.url;
      }
      if (stagedAudioBlob) {
        const res = await uploadMedia(stagedAudioBlob);
        finalAudioUrl = res.url;
      }

      const response = await api.post(`/channels/${id}/messages`, {
        text: optimisticMessage.text,
        imageUrl: finalImageUrl,
        audioUrl: finalAudioUrl,
        isImage: optimisticMessage.isImage,
        isVoiceMessage: optimisticMessage.isVoiceMessage,
        replyTo: optimisticMessage.replyTo
      });
      const savedMsg = response.data;
        // Replace the optimistic message with the server-confirmed one
        setChannel(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(m =>
              m.id === tempId
                ? {
                    ...m,
                    id: savedMsg._id || savedMsg.id || tempId
                  }
                : m
            )
          };
        });
        
        // Reset staged media previews/files so they are not sent again
        setStagedImage(null);
        setStagedImageFile(null);
        setStagedAudio(null);
        setStagedAudioBlob(null);

        // Sync channel list globally
        if (refreshChannels) refreshChannels();
    } catch (err) {
      console.error('Erreur envoi message:', err);
      // Keep optimistic message in UI even if save failed (graceful degradation)
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Erreur: Impossible d'accéder au microphone.");
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Audio = event.target?.result as string;
        setStagedAudio(base64Audio);
        setStagedAudioBlob(audioBlob);
      };
      reader.readAsDataURL(audioBlob);
      
      // Stop all tracks to release microphone
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const addReaction = (messageId: number, emoji: string) => {
    setChannel({
      ...channel,
      messages: channel.messages.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const existing = reactions.find(r => r.emoji === emoji);
          if (existing) {
            const hasReacted = existing.users.includes(user.id);
            const users = hasReacted ? existing.users.filter(u => u !== user.id) : [...existing.users, user.id];
            return {
              ...msg,
              reactions: users.length === 0 
                ? reactions.filter(r => r.emoji !== emoji)
                : reactions.map(r => r.emoji === emoji ? { ...r, users, count: users.length } : r)
            };
          }
          return { ...msg, reactions: [...reactions, { emoji, count: 1, users: [user.id] }] };
        }
        return msg;
      })
    });
    setShowReactionPicker(false);
  };

  const handleScrollToMessage = (messageId: number | string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('message-highlight');
      setTimeout(() => {
        element.classList.remove('message-highlight');
      }, 2000);
    }
  };


  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-gray-100 dark:bg-gray-900 z-50">
      <ChannelHeader
        channel={{...channel, members: memberList.length}}
        onBack={() => navigate('/box', { state: { activeTab: location.state?.activeTab || 'all' } })}
        userFunctions={userFunctions}
        onOpenSettings={() => setShowChannelInfo(true)}
        onOpenMonetization={() => setShowChannelInfo(true)}
        currentUserId={user.id}
      />

      <div ref={messageListRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {(channel.premium && !channel.joined ? channel.messages.slice(0, 1) : channel.messages).map((msg, index) => {
          const messageDate = new Date(msg.timestamp);
          const prevMsg = channel.messages[index - 1];
          const prevDate = prevMsg ? new Date(prevMsg.timestamp) : null;
          
          let showDateSeparator = false;
          let dateLabel = "";
          
          if (!prevDate || messageDate.toDateString() !== prevDate.toDateString()) {
            showDateSeparator = true;
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (messageDate.toDateString() === today.toDateString()) {
              dateLabel = "Aujourd'hui";
            } else if (messageDate.toDateString() === yesterday.toDateString()) {
              dateLabel = "Hier";
            } else {
              dateLabel = messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            }
          }

          return (
          <div key={msg.id} className="space-y-4">
            {showDateSeparator && (
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full shadow-sm">
                  {dateLabel}
                </span>
              </div>
            )}
            <div id={`message-${msg.id}`}>
              <MessageCard
                message={msg}
                currentUserId={user.id}
                onReaction={(emoji) => addReaction(msg.id, emoji)}
                onLongPress={() => {
                  setSelectedMessageId(msg.id);
                  setShowDeleteModal(true);
                }}
                onShowReactionPicker={() => {
                  setSelectedMessageId(msg.id);
                  setShowReactionPicker(true);
                }}
                onReply={() => setReplyToMessage(msg)}
                onScrollToMessage={handleScrollToMessage}
                onImageClick={(url) => setFullscreenImage(url)}
                onImageLoad={() => scrollToBottom('auto')}
              />
            </div>
          </div>
        )})}

        {channel.premium && !channel.joined && (
          <div className="my-6 p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-amber-500/50 backdrop-blur-xl shadow-2xl text-center max-w-xl mx-auto space-y-4 animate-fade-in relative z-20">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/10">
              🔒
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                Canal Premium Exclusif
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Accès Réservé aux Abonnés
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-md mx-auto">
                Ce canal regroupe les pronostics certifiés et les conseils exclusifs de <span className="font-bold text-amber-400">{channel.owner?.username || 'ce tipster'}</span>. Abonnez-vous pour débloquer l'accès complet à l'ensemble du contenu.
              </p>
            </div>

            <div className="py-2">
              <div className="text-3xl font-black text-amber-400">
                {(channel.price || 9.99).toFixed(2)}€ <span className="text-xs text-slate-400 font-semibold">/ mois</span>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/20 transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>👑</span> S'abonner pour {(channel.price || 9.99).toFixed(2)}€/mois
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {channel.premium && !channel.joined ? (
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>🔒</span> L'accès aux messages et publications est réservé aux abonnés.
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-950 font-black rounded-xl text-xs shadow-md transform active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            S'abonner ({(channel.price || 9.99).toFixed(2)}€/mois)
          </button>
        </div>
      ) : (
        <MessageInput
          onSend={handleSendMessage}
          userFunctions={userFunctions}
          stagedImage={stagedImage}
          stagedAudio={stagedAudio}
          onClearStaged={() => { setStagedImage(null); setStagedImageFile(null); setStagedAudio(null); setStagedAudioBlob(null); }}
          onImageSelected={(imageUrl, file) => { setStagedImage(imageUrl); if (file) setStagedImageFile(file); }}
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          replyTo={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
          allowVoiceMessages={channel.allowVoiceMessages !== false}
        />
      )}

      {showPaymentModal && (
        <UnifiedPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={async () => {
            setShowPaymentModal(false);
            if (channel) {
              try {
                await joinChannel(channel.id);
              } catch { /* skip */ }
              setChannel(prev => prev ? { ...prev, joined: true } : prev);
              if (setChannelJoined) {
                setChannelJoined(channel.id, true);
              }
            }
          }}
          paymentDetails={{
            description: `Abonnement - ${channel.name}`,
            amount: channel.price || 9.99,
            type: 'subscription',
            itemName: channel.name
          }}
        />
      )}

      {/* Channel Info Panel (Telegram-style) */}
      {showChannelInfo && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={() => setShowChannelInfo(false)}>
          <div
            className="w-full max-w-sm h-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Channel Info Header */}
            <div className="relative">
              <div className="h-40 bg-gradient-to-br from-green-600 to-green-800 flex items-end p-4">
                <button
                  title="Fermer"
                  onClick={() => setShowChannelInfo(false)}
                  className="absolute top-4 left-4 text-white hover:bg-white/20 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-end space-x-3 w-full">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white flex-shrink-0 relative group">
                    <img 
                      src={channel.avatar || 'https://via.placeholder.com/150'}
                      alt={channel.name} 
                      className="w-full h-full object-cover bg-gray-200" 
                    />
                    {isEditingInfo && (
                      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const res = await uploadMedia(file);
                              setChannel(prev => prev ? { ...prev, avatar: res.url } : prev);
                              await updateChannel(channel.id, { avatar: res.url });
                              if (refreshChannels) refreshChannels();
                            } catch (err) {
                              console.error('Erreur upload avatar:', err);
                            }
                          }
                        }} />
                      </label>
                    )}
                  </div>
                  <div className="text-white pb-1 w-full">
                    {isEditingInfo ? (
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="font-bold text-lg bg-white/20 text-white rounded px-2 py-1 w-full outline-none placeholder-white/70"
                        placeholder="Nom du canal"
                      />
                    ) : (
                      <h3 className="font-bold text-lg">{channel.name}</h3>
                    )}
                    <p className="text-sm text-green-100">{channel.members.toLocaleString()} membres</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Description */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h4>
                {(userFunctions.canManageAllChannels || channel.owner?.id === user.id) && !isEditingInfo && (
                  <button onClick={() => setIsEditingInfo(true)} className="text-xs text-blue-500 hover:text-blue-600">Modifier</button>
                )}
                {isEditingInfo && (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingInfo(false)} className="text-xs text-gray-500 hover:text-gray-600">Annuler</button>
                    <button 
                      onClick={async () => { 
                        setIsEditingInfo(false); 
                        setChannel(prev => prev ? { ...prev, name: editName, description: editDesc } : prev); 
                        try {
                          await updateChannel(channel.id, { name: editName, description: editDesc });
                          if (refreshChannels) refreshChannels();
                        } catch (err) {
                          console.error('Erreur lors de la mise à jour des paramètres', err);
                        }
                      }} 
                      className="text-xs text-green-600 font-bold hover:text-green-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>
              {isEditingInfo ? (
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 border border-gray-200 dark:border-gray-600 outline-none focus:ring-1 focus:ring-green-500"
                  rows={3}
                  placeholder="Description du canal"
                />
              ) : (
                <p className="text-sm text-gray-800 dark:text-gray-200">{channel.description || 'Aucune description'}</p>
              )}
            </div>

            {/* Channel Owner */}
            {/* Channel Owner — only from channel.owner, never guessed */}
            {channel.owner && channel.owner.username && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Propriétaire</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src={channel.owner.avatar || 'https://via.placeholder.com/150'}
                      alt={channel.owner.username} 
                      className="w-full h-full object-cover bg-gray-200" 
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{channel.owner.username}</span>
                </div>
              </div>
            )}
            
            {/* Espace Tipster / Admin (Publication button inside Channel Parameters) */}
            {(userFunctions.canManageAllChannels || channel.owner?.id === user.id || channel.owner?.username === user.username) && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-green-500/10">
                <h4 className="text-xs font-black text-green-600 dark:text-brand-green uppercase tracking-wider mb-2.5">Espace Tipster / Admin</h4>
                <button
                  onClick={() => {
                    setShowChannelInfo(false);
                    setShowCreatePronoModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-green hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-green-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>🎯</span>
                  <span>Publier un pronostic</span>
                </button>
              </div>
            )}

            {/* Telegram-style Members List */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Membres ({memberList.length})
                </h4>
                {memberList.length > 0 && (
                  <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    En ligne
                  </span>
                )}
              </div>

              {memberList.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {memberList.map((member, idx) => (
                    <div key={String(member.id) + idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 shrink-0">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                              {member.username?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                          )}
                          <span className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
                            member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                            {member.username}
                            {member.role === 'Propriétaire' && <span className="text-amber-400 text-[10px]">★</span>}
                          </p>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">{member.role}</span>
                        </div>
                      </div>
                      {member.role === 'Propriétaire' && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Aucun membre abonné pour le moment</p>
              )}
            </div>

            {/* Channel Settings (only for owners/admins) */}
            {(userFunctions.canManageAllChannels || channel.owner?.id === user.id) && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Paramètres</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Notifications</span>
                    <button
                      title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
                      onClick={() => {
                        const newVal = !notificationsEnabled;
                        setNotificationsEnabled(newVal);
                        localStorage.setItem(`channel_notifications_${id}`, newVal.toString());
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Type</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${channel.premium ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                      {channel.premium ? 'Premium' : 'Gratuit'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Autoriser vocaux</span>
                    <button
                      title={channel.allowVoiceMessages ? 'Désactiver les vocaux' : 'Activer les vocaux'}
                      onClick={async () => {
                        const newVal = !channel.allowVoiceMessages;
                        try {
                          await updateChannel(channel.id, { allowVoiceMessages: newVal });
                          setChannel(prev => prev ? { ...prev, allowVoiceMessages: newVal } : prev);
                          if (refreshChannels) refreshChannels();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${channel.allowVoiceMessages ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${channel.allowVoiceMessages ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 space-y-2">
              {/* Share */}
              <div className="relative">
                <button
                  onClick={() => setShowSharePanel(prev => !prev)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Partager le canal
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showSharePanel ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {showSharePanel && (
                  <div className="mt-1 ml-4 grid grid-cols-2 gap-2 px-2 pb-2">
                    {[
                      { key: 'copy', label: 'Copier le lien', icon: '🔗' },
                      { key: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                      { key: 'telegram', label: 'Telegram', icon: '✈️' },
                      { key: 'twitter', label: 'Twitter/X', icon: '🐦' },
                      { key: 'facebook', label: 'Facebook', icon: '👍' },
                    ].map(p => (
                      <button
                        key={p.key}
                        onClick={() => { handleShare(p.key); setShowSharePanel(false); }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-700 dark:text-gray-300 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                      >
                        <span>{p.icon}</span>{p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {channel.owner?.id === user?.id ? (
                <button
                  onClick={() => setShowDeleteChannelConfirm(true)}
                  disabled={isLeaving}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLeaving ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  Supprimer le canal
                </button>
              ) : (
                <button
                  onClick={() => setShowLeaveConfirmation(true)}
                  disabled={isLeaving}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isLeaving ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  Quitter le canal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ChannelLeaveConfirmation
        isOpen={showLeaveConfirmation}
        onClose={() => setShowLeaveConfirmation(false)}
        onConfirm={handleLeaveChannel}
        channelName={channel.name}
      />

      {showDeleteChannelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Supprimer le canal</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Êtes-vous sûr de vouloir supprimer définitivement ce canal ? Cette action est irréversible et supprimera tous les messages et données associés.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteChannelConfirm(false)} 
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium text-sm transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleDeleteChannel} 
                disabled={isLeaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center transition-colors disabled:opacity-50"
              >
                {isLeaving ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Supprimer le message ?</h3>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border rounded-md">Annuler</button>
              <button 
                onClick={async () => {
                  if (selectedMessageId && channel) {
                    const targetIdStr = String(selectedMessageId);
                    
                    // Instant optimistic removal from UI
                    setChannel(prev => prev ? {
                      ...prev,
                      messages: prev.messages.filter(m => String(m.id) !== targetIdStr)
                    } : prev);

                    setShowDeleteModal(false);

                    try {
                      await deleteChannelMessage(String(channel.id), targetIdStr);
                      if (refreshChannels) refreshChannels();
                    } catch (error) {
                      console.error('Erreur lors de la suppression du message:', error);
                    }
                  }
                }} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 font-bold text-white rounded-xl shadow-md transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showReactionPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowReactionPicker(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex gap-4 animate-scale-up" onClick={e => e.stopPropagation()}>
            <EmojiPicker
              onEmojiClick={(emojiData: EmojiClickData) => {
                if (selectedMessageId) addReaction(selectedMessageId, emojiData.emoji);
                setShowReactionPicker(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-[101] bg-black/50 p-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setFullscreenImage(null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img 
            src={fullscreenImage} 
            alt="Zoomed media" 
            className="max-w-[95vw] max-h-[90vh] object-contain cursor-zoom-out select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Structured Pronostic Creation Modal */}
      <CreatePronoModal
        isOpen={showCreatePronoModal}
        onClose={() => setShowCreatePronoModal(false)}
        onSubmit={handlePronoSubmitted}
      />
    </div>
  );
};

export default ChannelView;