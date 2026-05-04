import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UpgradeProModal from '../components/UpgradeProModal';
import { usePayment } from '../hooks/usePayment';
import { Channel } from '../types/chat';
import { ChannelListItem } from '../components/box/ChannelListItem';
import { ChannelTabs } from '../components/box/ChannelTabs';
import { CreateChannelModal, NewChannelData } from '../components/box/CreateChannelModal';
import { SubscribeChannelModal } from '../components/box/SubscribeChannelModal';

const Box = () => {
  const { user, isPro } = useAuth();
  const { processPayment } = usePayment();
  const navigate = useNavigate();
  
  const [showProModal, setShowProModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isProcessingJoin, setIsProcessingJoin] = useState(false);
  const [editingChannel, setEditingChannel] = useState<number | string | null>(null);
  const [channelCreationStep, setChannelCreationStep] = useState(1);

  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 1,
      name: 'PronosBox Officiel',
      members: 15420,
      description: 'Canal officiel de PronosBox',
      premium: false,
      joined: true,
      lastMessage: 'Bienvenue sur le canal officiel de PronosBox!',
      avatar: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      price: 0,
      pinned: true,
      messages: [],
      category: 'official'
    },
    {
      id: 2,
      name: 'Pronos Premium',
      members: 5230,
      description: 'Accès exclusif aux meilleurs pronos',
      premium: true,
      joined: false,
      lastMessage: 'Nouveau prono: PSG vs Marseille',
      avatar: 'https://images.unsplash.com/photo-1590552515252-3a5a1bce7bed?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      price: 9.99,
      pinned: false,
      messages: [],
      category: 'premium'
    }
  ]);

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
    features: {
      voiceMessages: true,
      comments: true,
      paidCoupons: false
    }
  });

  const isAdmin = user?.role === 'admin';

  const handleOpenChannel = (channelId: string | number) => {
    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return;
    if (channel.joined || isPro || isAdmin) {
      navigate(`/channel/${channelId}`, { state: { activeTab, channelData: { ...channel, joined: true } } });
    } else {
      handleJoinChannel(channel);
    }
  };

  const handleJoinChannel = async (channel: Channel) => {
    if (isProcessingJoin) return;
    // Admin and Pro users bypass premium paywall
    if (channel.premium && !channel.joined && !isPro && !isAdmin) {
      setSelectedChannel(channel);
      setShowSubscribeModal(true);
      return;
    }

    setIsProcessingJoin(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setChannels(channels.map(c => c.id === channel.id ? { ...c, joined: true } : c));
      navigate(`/channel/${channel.id}`, { state: { activeTab, channelData: { ...channel, joined: true } } });
    } finally {
      setIsProcessingJoin(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedChannel) return;
    setIsProcessingJoin(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await processPayment({ amount: selectedChannel.price || 0, method: 'card', plan: 'subscription' });
      setChannels(channels.map(c => c.id === selectedChannel.id ? { ...c, joined: true } : c));
      setShowSubscribeModal(false);
      navigate(`/channel/${selectedChannel.id}`, { state: { activeTab, channelData: selectedChannel } });
    } finally {
      setIsProcessingJoin(false);
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

  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = channels.length + 1;
    const newChannelObj: Channel = {
      id: newId,
      name: newChannel.name,
      description: newChannel.description,
      premium: newChannel.type === 'premium',
      joined: true,
      lastMessage: 'Canal créé',
      avatar: 'https://via.placeholder.com/150',
      price: parseFloat(newChannel.price),
      pinned: false,
      members: 1,
      messages: [],
      category: 'user'
    };
    setChannels([...channels, newChannelObj]);
    setChannelFeatures({ ...channelFeatures, [newId]: newChannel.features });
    setShowCreateChannelModal(false);
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
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
              isProcessingJoin={isProcessingJoin}
              isEditing={editingChannel === channel.id}
              onToggleEdit={(id) => setEditingChannel(editingChannel === id ? null : id)}
              channelFeatures={channelFeatures}
              onFeatureToggle={handleFeatureToggle}
            />
          ))}
        </div>
      </div>

      <SubscribeChannelModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        channel={selectedChannel}
        onSubscribe={handleSubscribe}
        isProcessing={isProcessingJoin}
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
    </div>
  );
};

export default Box;