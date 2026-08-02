import React, { useState, useRef } from 'react';

interface ProProfileProps {
  user: any;
  updateUser: (updates: any) => Promise<void>;
}

export const ProProfile: React.FC<ProProfileProps> = ({ user, updateUser }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (updateUser) {
          updateUser({ avatar: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;

    try {
      if (updateUser) {
        await updateUser({ username, email, bio });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 mb-6">
        Profil Pro
      </h3>
      
      <form onSubmit={handleProfileSubmit} className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-3xl p-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8">
          <div className="relative w-32 h-32 mb-6 md:mb-0 md:mr-8 group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500/30 shadow-xl">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'}
                alt={user?.username || 'Utilisateur Pro'}
                className="w-full h-full object-cover"
              />
            </div>
            <label
              htmlFor="pro-avatar-upload"
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 cursor-pointer hover:scale-110 active:scale-95 transition-all"
              title="Modifier la photo de profil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" id="pro-avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom d'utilisateur</label>
                <input
                  name="username"
                  type="text"
                  defaultValue={user?.username || ''}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none backdrop-blur-sm transition-all text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={user?.email || ''}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none backdrop-blur-sm transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio professionnelle</label>
              <textarea
                name="bio"
                defaultValue={user?.bio || ''}
                rows={4}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none backdrop-blur-sm transition-all text-gray-900 dark:text-white"
                placeholder="Parlez de votre expertise..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200/50 dark:border-gray-700/50 mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-green-500/30 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? 'Enregistrement...' : saveSuccess ? '✅ Enregistré' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};
