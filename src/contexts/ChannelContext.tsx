import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode
} from 'react';
import { NavigateFunction } from 'react-router-dom';
import { ChannelData, Channel, ChannelDetails } from '../types/channel';
import { useAuth } from './AuthContext';
import { getChannels } from '../services/api';

export interface ChannelContextValue {
  channelData: ChannelData | null;
  navigateToChannel: (channelId: string, navigate: NavigateFunction, activeTab?: string) => void;
  addChannel: (payload: { name: string; description: string; premium: boolean; subscriptionPrice?: number; avatar?: string }) => Promise<string>;
  refreshChannels: () => void;
  setChannelJoined: (channelId: string | number, joined: boolean) => void;
}

const ChannelDataContext = createContext<ChannelContextValue | null>(null);

export const useChannelData = () => {
  const context = useContext(ChannelDataContext);
  if (!context) {
    throw new Error('useChannelData must be used within a ChannelDataProvider');
  }
  return context;
};

// Map a raw MongoDB channel doc to our internal Channel type
const mapApiChannel = (c: any, currentUserId?: string): Channel => {
  const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
  let msgText = '';
  if (lastMsg) {
    if (lastMsg.isImage) msgText = '📷 Image';
    else if (lastMsg.isAudio || lastMsg.isVoiceMessage) msgText = '🎙️ Message vocal';
    else msgText = lastMsg.text || 'Message';
  }

  return {
    id: c.id || c._id,
    name: c.name,
    description: c.description,
    premium: c.premium,
    joined: currentUserId ? (c.members || []).some((m: any) => String(m._id || m.id || m) === String(currentUserId)) : false,
    lastMessage: c.lastMessage || msgText,
    avatar: c.avatar || '',
    price: c.subscriptionPrice || 0,
    pinned: false,
    members: c.members?.length || 0,
    messages: c.messages || [],
    category: c.premium ? 'premium' : 'free',
    allowVoiceMessages: c.allowVoiceMessages !== false,
    owner: c.owner
      ? { 
          id: c.owner.id || c.owner._id || c.owner, 
          username: c.owner.username || '', 
          avatar: c.owner.avatar || '',
          isCertified: Boolean(c.owner.isCertified),
          role: c.owner.role || 'user'
        }
      : { id: '', username: '', avatar: '', isCertified: false, role: 'user' },
    winRate: c.winRate ?? null,
    lastWonProno: c.lastWonProno ?? null,
    lastProno: c.lastProno ?? null
  };
};

const mapApiChannelDetails = (c: any): ChannelDetails => ({
  id: c.id || c._id,
  name: c.name,
  image: c.avatar || '',
  description: c.description,
  fullDescription: c.description,
  members: c.members?.length || 0,
  views: c.statistics?.totalViews || 0,
  posts: [],
  created: c.createdAt || '',
  owner: c.owner
    ? { id: c.owner.id || c.owner._id || c.owner, name: c.owner.username || '', avatar: c.owner.avatar || '' }
    : { id: '', name: '', avatar: '' }
});

export const ChannelDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [channelData, setChannelData] = useState<ChannelData | null>(() => {
    try {
      const cached = localStorage.getItem('pronobox_channels_cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch { /* ignore */ }
    return null;
  });
  const { user } = useAuth();

  const fetchChannels = useCallback(async () => {
    try {
      const data = await getChannels();
      if (!Array.isArray(data)) {
        setChannelData(prev => prev || { channels: [], channelDetails: {} });
        return;
      }


      const channels: Channel[] = data.map((c: any) => {
        const mapped = mapApiChannel(c, user?.id);
        return mapped;
      });

      // Rebuild the membership cache purely from the server response.
      // The server is the source of truth — do NOT merge stale local IDs.
      const freshMembership: Record<string, string[]> = {};
      data.forEach((c: any) => {
        const channelId = String(c.id || c._id);
        const serverMemberIds = (c.members || []).map((m: any) => String(m._id || m.id || m));
        freshMembership[channelId] = serverMemberIds;
      });
      try {
        localStorage.setItem('pronobox_membership', JSON.stringify(freshMembership));
      } catch { /* quota exceeded — silently skip, in-memory state is still correct */ }

      const channelDetails: Record<string, ChannelDetails> = {};
      data.forEach((c: any) => {
        const id = c.id || c._id;
        if (id) channelDetails[id] = mapApiChannelDetails(c);
      });

      setChannelData({ channels, channelDetails });
      try {
        localStorage.setItem('pronobox_channels_cache', JSON.stringify({ channels, channelDetails }));
      } catch { /* ignore */ }
    } catch (error) {
      console.error('Erreur lors du chargement des canaux:', error);
      setChannelData(prev => prev || { channels: [], channelDetails: {} });
    }
  }, [user?.id]);


  useEffect(() => {
    fetchChannels();
  }, [fetchChannels, user?.id]);

  const addChannel = useCallback(async (payload: { name: string; description: string; premium: boolean; subscriptionPrice?: number; avatar?: string }): Promise<string> => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: payload.name,
          description: payload.description,
          premium: payload.premium,
          allowComments: true,
          subscriptionPrice: payload.subscriptionPrice || 0,
          ...(payload.avatar ? { avatar: payload.avatar } : {})
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create channel');
      }
      const created = await res.json();
      await fetchChannels();
      return created.id || created._id || '';
    } catch (error) {
      console.error('Erreur création canal:', error);
      return '';
    }
  }, [fetchChannels]);

  // Directly mutate the joined state for a single channel in memory
  // This is the reliable way to update UI without a full refetch
  const setChannelJoined = useCallback((channelId: string | number, joined: boolean) => {
    setChannelData(prev => {
      if (!prev) return prev;
      const updatedChannels = prev.channels.map(c => {
        if (String(c.id) === String(channelId)) {
          const currentMembers = typeof c.members === 'number' ? c.members : 0;
          return {
            ...c,
            joined,
            members: joined ? currentMembers + 1 : Math.max(0, currentMembers - 1)
          };
        }
        return c;
      });
      return { ...prev, channels: updatedChannels };
    });
  }, []);

  const navigateToChannel = useCallback(
    (channelId: string, navigate: NavigateFunction, activeTab = 'all') => {
      if (!channelData) return;
      navigate(`/channel/${channelId}`, {
        state: {
          preloadedData: channelData.channelDetails[channelId],
          instantLoad: true,
          activeTab: activeTab
        }
      });
    },
    [channelData]
  );

  if (!channelData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400">Chargement des canaux...</p>
        </div>
      </div>
    );
  }

  return (
    <ChannelDataContext.Provider
      value={{
        channelData,
        navigateToChannel,
        addChannel,
        refreshChannels: fetchChannels,
        setChannelJoined
      }}>
      {children}
    </ChannelDataContext.Provider>
  );
};
