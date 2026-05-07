import React, { useState } from 'react';
import { useChannelData } from '../../../contexts/ChannelContext';

interface ProChannelManagerProps {
  user: any;
  userChannels: any[];
}

export const ProChannelManager: React.FC<ProChannelManagerProps> = ({ user, userChannels }) => {
  const { addChannel } = useChannelData();
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelIsPremium, setNewChannelIsPremium] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any | null>(null);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Veuillez entrer un nom pour le canal');
      return;
    }
    setIsCreatingChannel(true);
    
    const newChannelId = `channel-${Date.now()}`;
    const globalChannel = {
      id: newChannelId,
      name: newChannelName.trim(),
      description: newChannelDescription.trim(),
      premium: newChannelIsPremium,
      members: 1,
      views: 0,
      image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      owner: { id: user?.id, username: user?.username },
      posts: [
        {
          id: `post-${Date.now()}`,
          title: `Bienvenue sur ${newChannelName.trim()}!`,
          content: newChannelDescription.trim() || 'Canal créé avec PronosBox.'
        }
      ]
    };

    if (addChannel) {
      addChannel(globalChannel);
    }

    setNewChannelName('');
    setNewChannelDescription('');
    setNewChannelIsPremium(false);
    setIsCreatingChannel(false);
    setShowCreateChannelModal(false);
    alert('Canal créé avec succès!');
  };

  const handleEditChannelClick = (channel: any) => {
    setEditingChannel(channel);
    setNewChannelName(channel.name);
    setNewChannelDescription(channel.description || '');
    setNewChannelIsPremium(channel.subscriptions !== undefined && channel.subscriptions > 0);
    setShowCreateChannelModal(true);
  };

  const handleUpdateChannel = async () => {
    if (!editingChannel || !newChannelName.trim()) return;
    setIsCreatingChannel(true);
    // Simulation API update
    await new Promise(resolve => setTimeout(resolve, 500));
    setEditingChannel(null);
    setNewChannelName('');
    setNewChannelDescription('');
    setIsCreatingChannel(false);
    setShowCreateChannelModal(false);
    alert('Canal mis à jour avec succès!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">
          Gestion des Canaux
        </h3>
        <button
          onClick={() => {
            setEditingChannel(null);
            setNewChannelName('');
            setNewChannelDescription('');
            setNewChannelIsPremium(false);
            setShowCreateChannelModal(true);
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          <span>➕</span> Créer un canal
        </button>
      </div>

      {userChannels.length === 0 ? (
        <div className="text-center py-12 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl">
          <div className="text-5xl mb-4">📺</div>
          <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">Vous n'avez pas encore de canal</h4>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Créez votre premier canal pour commencer à partager vos pronostics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userChannels.map((channel) => (
            <div key={channel.id} className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-gray-700/50 p-6 flex flex-col justify-between hover:shadow-lg transition-all group">
              <div className="flex items-start gap-4">
                <img src={channel.image} alt={channel.name} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{channel.name}</h4>
                    {channel.premium && (
                      <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold rounded-lg shadow-sm">Premium</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{channel.description || 'Aucune description'}</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{channel.members}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Membres</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{channel.views}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Vues</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{channel.revenue?.toFixed(2) || '0.00'}€</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Revenus</div>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => handleEditChannelClick(channel)}
                  className="flex-1 py-2 bg-white/50 hover:bg-white/80 dark:bg-gray-700/50 dark:hover:bg-gray-600/80 text-gray-800 dark:text-white text-sm font-medium rounded-xl transition-colors backdrop-blur-sm"
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de création/édition de canal */}
      {showCreateChannelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
              <span className="text-3xl">{editingChannel ? '📝' : '📺'}</span>
              {editingChannel ? 'Modifier le canal' : 'Nouveau canal Pro'}
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du canal</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  placeholder="Ex: Mes Pronos VIP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  rows={3}
                  placeholder="Décrivez votre canal..."
                ></textarea>
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <input
                    type="radio"
                    name="channelType"
                    checked={!newChannelIsPremium}
                    onChange={() => setNewChannelIsPremium(false)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">Gratuit</span>
                    <span className="block text-xs text-gray-500">Accessible à tous les utilisateurs</span>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/20 transition-colors">
                  <input
                    type="radio"
                    name="channelType"
                    checked={newChannelIsPremium}
                    onChange={() => setNewChannelIsPremium(true)}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 border-yellow-300"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-bold text-yellow-800 dark:text-yellow-500">Premium (Payant)</span>
                    <span className="block text-xs text-yellow-600 dark:text-yellow-600">Nécessite un abonnement mensuel</span>
                  </div>
                </label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setShowCreateChannelModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={editingChannel ? handleUpdateChannel : handleCreateChannel}
                  disabled={isCreatingChannel || !newChannelName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
                >
                  {isCreatingChannel ? 'En cours...' : (editingChannel ? 'Mettre à jour' : 'Créer le canal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
