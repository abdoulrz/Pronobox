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

export interface ChannelContextValue {
  channelData: ChannelData | null;
  navigateToChannel: (channelId: string, navigate: NavigateFunction, activeTab?: string) => void;
  addChannel: (payload: { name: string; description: string; premium: boolean; subscriptionPrice?: number; avatar?: string }) => Promise<string>;
  refreshChannels: () => void;
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
const mapApiChannel = (c: any): Channel => ({
  id: c._id,
  name: c.name,
  description: c.description,
  premium: c.premium,
  joined: false,
  lastMessage: '',
  avatar: c.avatar || '',
  price: c.subscriptionPrice || 0,
  pinned: false,
  members: c.members?.length || 0,
  messages: c.messages || [],
  category: c.premium ? 'premium' : 'free',
  owner: c.owner
    ? { id: c.owner._id || c.owner, username: c.owner.username || '', avatar: c.owner.avatar || '' }
    : { id: '', username: '', avatar: '' }
});

const mapApiChannelDetails = (c: any): ChannelDetails => ({
  id: c._id,
  name: c.name,
  image: c.avatar || '',
  description: c.description,
  fullDescription: c.description,
  members: c.members?.length || 0,
  views: c.statistics?.totalViews || 0,
  posts: [],
  created: c.createdAt || '',
  owner: c.owner
    ? { id: c.owner._id || c.owner, name: c.owner.username || '', avatar: c.owner.avatar || '' }
    : { id: '', name: '', avatar: '' }
});

export const ChannelDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch('/api/channels');
      const data = await res.json();
      if (!Array.isArray(data)) {
        setChannelData({ channels: [], channelDetails: {} });
        return;
      }

      const channels: Channel[] = data.map(mapApiChannel);
      const channelDetails: Record<string, ChannelDetails> = {};
      data.forEach((c: any) => {
        channelDetails[c._id] = mapApiChannelDetails(c);
      });

      setChannelData({ channels, channelDetails });
    } catch (error) {
      console.error('Erreur lors du chargement des canaux:', error);
      setChannelData({ channels: [], channelDetails: {} });
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

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
      return created._id;
    } catch (error) {
      console.error('Erreur création canal:', error);
      return '';
    }
  }, [fetchChannels]);

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
        refreshChannels: fetchChannels
      }}>
      {children}
    </ChannelDataContext.Provider>
  );
};
