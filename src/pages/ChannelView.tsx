import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChannelData } from '../contexts/ChannelContext';
import { Message, Channel } from '../types/chat';
import { useUserFeatures } from '../hooks/useUserFeatures';
import { ChannelHeader } from '../components/channel/ChannelHeader';
import { MessageCard } from '../components/channel/MessageCard';
import { MessageInput } from '../components/channel/MessageInput';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

const ChannelView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { channelData } = useChannelData();
  const userFunctions = useUserFeatures(user);

  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [showChannelInfo, setShowChannelInfo] = useState(false);

  // Staged attachments (WhatsApp/Telegram style: preview before sending)
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [stagedAudio, setStagedAudio] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!id) return;

    // Try to get channel data from multiple sources
    const stateData = location.state?.channelData || location.state?.preloadedData;

    if (stateData) {
      // Data passed via navigation state — convert to Channel format
      const channelObj: Channel = {
        id: stateData.id,
        name: stateData.name,
        description: stateData.description || '',
        avatar: stateData.avatar || stateData.image || 'https://via.placeholder.com/150',
        category: stateData.category || 'general',
        members: stateData.members || 0,
        messages: stateData.messages || [],
        joined: stateData.joined !== undefined ? stateData.joined : true,
        owner: stateData.owner,
        premium: stateData.premium || false,
        price: stateData.price || 0,
      };
      setChannel(channelObj);
      setLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (channelData) {
      // Fallback: load from ChannelContext
      const details = channelData.channelDetails[id];
      const basicChannel = channelData.channels.find(c => c.id === id);

      if (details || basicChannel) {
        const source = details || basicChannel;
        const channelObj: Channel = {
          id: source.id,
          name: source.name,
          description: source.description || '',
          avatar: source.image || 'https://via.placeholder.com/150',
          category: 'general',
          members: source.members || 0,
          messages: [],
          joined: true,
          owner: details?.owner ? {
            id: details.owner.id,
            username: details.owner.name,
            avatar: details.owner.avatar
          } : undefined,
          premium: false,
          price: 0,
        };
        setChannel(channelObj);
        setLoading(false);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [id, location.state, channelData]);

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

  const handleSendMessage = (text: string, image?: string | null, audio?: string | null, replyTo?: Message | null) => {
    const newMessage: Message = {
      id: Date.now(),
      user: {
        id: user.id,
        username: user.username || 'Utilisateur',
        avatar: user.avatar || 'https://via.placeholder.com/150',
        role: user.role,
        isPro: user.isPro
      },
      text: text,
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
    setChannel({ ...channel, messages: [...channel.messages, newMessage] });
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // handleSendWithAttachments is now absorbed into handleSendMessage via MessageInput
  // but we keep the wrapper if needed or just use handleSendMessage directly.

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
      const audioUrl = URL.createObjectURL(audioBlob);
      setStagedAudio(audioUrl);
      
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

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-gray-100 dark:bg-gray-900 z-50">
      <ChannelHeader
        channel={channel}
        onBack={() => navigate('/box', { state: { activeTab: location.state?.activeTab || 'all' } })}
        userFunctions={userFunctions}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={() => setNotificationsEnabled(!notificationsEnabled)}
        onShare={(platform) => console.log(`Share on ${platform}`)}
        onLeave={() => navigate('/box')}
        onOpenSettings={() => setShowChannelInfo(true)}
        onOpenMonetization={() => setShowChannelInfo(true)}
        currentUserId={user.id}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {channel.messages.map((msg) => (
          <MessageCard
            key={msg.id}
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
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={handleSendMessage}
        userFunctions={userFunctions}
        stagedImage={stagedImage}
        stagedAudio={stagedAudio}
        onClearStaged={() => { setStagedImage(null); setStagedAudio(null); }}
        onImageSelected={(imageUrl) => setStagedImage(imageUrl)}
        isRecording={isRecording}
        recordingTime={recordingTime}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        replyTo={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
      />

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
                <div className="flex items-end space-x-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                    <img src={channel.avatar} alt={channel.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-white pb-1">
                    <h3 className="font-bold text-lg">{channel.name}</h3>
                    <p className="text-sm text-green-100">{channel.members.toLocaleString()} membres</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Description */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h4>
              <p className="text-sm text-gray-800 dark:text-gray-200">{channel.description || 'Aucune description'}</p>
            </div>

            {/* Channel Owner */}
            {channel.owner && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Propriétaire</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src={channel.owner.avatar} alt={channel.owner.username} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{channel.owner.username}</span>
                </div>
              </div>
            )}

            {/* Channel Settings (only for owners/admins) */}
            {(userFunctions.canManageAllChannels || channel.owner?.id === user.id) && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Paramètres</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Notifications</span>
                    <button
                      title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
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
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setShowChannelInfo(false);
                  navigate('/box');
                }}
                className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Quitter le canal
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
                onClick={() => {
                  setChannel({ ...channel, messages: channel.messages.filter(m => m.id !== selectedMessageId) });
                  setShowDeleteModal(false);
                }} 
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showReactionPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowReactionPicker(false)}>
          <div onClick={e => e.stopPropagation()}>
            <EmojiPicker
              onEmojiClick={(emojiData: EmojiClickData) => {
                if (selectedMessageId) {
                  addReaction(selectedMessageId, emojiData.emoji);
                }
              }}
              searchDisabled
              skinTonesDisabled
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelView;