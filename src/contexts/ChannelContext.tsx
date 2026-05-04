
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

export interface ChannelContextValue {
  channelData: ChannelData | null;
  navigateToChannel: (channelId: string, navigate: NavigateFunction, activeTab?: string) => void;
  addChannel: (channel: Channel) => string;
  saveChannelsToStorage: (data: ChannelData) => void;
}

const ChannelDataContext = createContext<ChannelContextValue | null>(null);

export const useChannelData = () => {
  const context = useContext(ChannelDataContext);
  if (!context) {
    throw new Error('useChannelData must be used within a ChannelDataProvider');
  }
  return context;
};

export const ChannelDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [channelData, setChannelData] = useState<ChannelData | null>(null);

  const saveChannelsToStorage = useCallback((data: ChannelData) => {
    localStorage.setItem('pronosbox_channels', JSON.stringify(data));
    setChannelData(data);
  }, []);

  const initializeDefaultChannels = useCallback(() => {
    const defaultData: ChannelData = {
      channels: [
        {
          id: 'channel-1',
          name: 'Communauté Ligue 1',
          members: 5430,
          views: 32000,
          image: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          description: 'Canal dédié aux discussions et pronostics sur la Ligue 1',
          posts: [
            { id: 'post-1', title: 'Analyse PSG vs OM', content: '...' },
            { id: 'post-2', title: 'Prédictions weekend', content: '...' }
          ]
        },
        {
          id: 'channel-2',
          name: 'PronosBox Officiel',
          members: 15000,
          views: 120000,
          image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          description: "Canal officiel de l'équipe PronosBox",
          posts: [
            { id: 'post-3', title: 'Mises à jour de la semaine', content: '...' },
            { id: 'post-4', title: 'Nouveautés à venir', content: '...' }
          ]
        }
      ],
      channelDetails: {
        'channel-1': {
          id: 'channel-1',
          name: 'Communauté Ligue 1',
          image: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          description: 'Canal dédié aux discussions et pronostics sur la Ligue 1',
          fullDescription: 'Le canal de référence pour tous les passionnés de la Ligue 1. Analyses approfondies, statistiques détaillées et pronostics de qualité.',
          members: 5430,
          views: 32000,
          posts: [
            { id: 'post-1', title: 'Analyse PSG vs OM', content: '...' },
            { id: 'post-2', title: 'Prédictions weekend', content: '...' }
          ],
          created: '2022-09-15',
          owner: {
            id: 'user-123',
            name: 'FootballExpert',
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          }
        },
        'channel-2': {
          id: 'channel-2',
          name: 'PronosBox Officiel',
          image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          description: "Canal officiel de l'équipe PronosBox",
          fullDescription: "Le canal officiel de l'équipe PronosBox. Suivez toutes les actualités, mises à jour et conseils directement de notre équipe.",
          members: 15000,
          views: 120000,
          posts: [
            { id: 'post-3', title: 'Mises à jour de la semaine', content: '...' },
            { id: 'post-4', title: 'Nouveautés à venir', content: '...' }
          ],
          created: '2022-01-10',
          owner: {
            id: 'user-admin',
            name: 'PronosBox Team',
            avatar: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
          }
        }
      }
    };
    saveChannelsToStorage(defaultData);
  }, [saveChannelsToStorage]);

  useEffect(() => {
    const storedChannels = localStorage.getItem('pronosbox_channels');
    if (storedChannels) {
      try {
        const parsedData = JSON.parse(storedChannels);
        setChannelData(parsedData);
      } catch (error) {
        console.error('Erreur lors du chargement des canaux:', error);
        initializeDefaultChannels();
      }
    } else {
      initializeDefaultChannels();
    }
  }, [initializeDefaultChannels]);

  const addChannel = useCallback((newChannel: Channel) => {
    if (!channelData) return '';
    
    const newDetails: ChannelDetails = {
      ...newChannel,
      fullDescription: newChannel.description,
      created: new Date().toISOString(),
      owner: {
        id: user?.id || 'user-id',
        name: user?.username || 'Utilisateur',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
      }
    };

    const updatedData: ChannelData = {
      ...channelData,
      channels: [...channelData.channels, newChannel],
      channelDetails: {
        ...channelData.channelDetails,
        [newChannel.id]: newDetails
      }
    };
    saveChannelsToStorage(updatedData);
    return newChannel.id;
  }, [channelData, saveChannelsToStorage, user]);

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
        saveChannelsToStorage
      }}>
      {children}
    </ChannelDataContext.Provider>
  );
};
