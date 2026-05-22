import React, { useRef, useState } from 'react';

export interface NewChannelData {
  name: string;
  description: string;
  type: string;
  price: string;
  isPrivate: boolean;
  avatar: string; // URL or base64
  features: {
    voiceMessages: boolean;
    comments: boolean;
    paidCoupons: boolean;
  };
}

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  setStep: (step: number) => void;
  newChannel: NewChannelData;
  setNewChannel: (channel: NewChannelData) => void;
  onTypeSelect: (type: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFeatureToggle: (feature: string) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  step,
  setStep,
  newChannel,
  setNewChannel,
  onTypeSelect,
  onSubmit,
  onFeatureToggle
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>(newChannel.avatar || '');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setNewChannel({
      ...newChannel,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setNewChannel({ ...newChannel, avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const featureLabels: Record<string, string> = {
    voiceMessages: 'Messages vocaux',
    comments: 'Commentaires',
    paidCoupons: 'Coupons payants'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-modal rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-white/10">
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-green-700 to-green-500 text-white flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-tight">Créer un nouveau canal</h3>
          <button title="Fermer" onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {step === 1 ? (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Choisissez le type de canal que vous souhaitez créer&nbsp;:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => onTypeSelect('free')}
                  className="group flex flex-col items-center gap-2 border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">Gratuit</h4>
                  <p className="text-xs text-gray-500 text-center">Accessible à tous les membres</p>
                </button>
                <button
                  type="button"
                  onClick={() => onTypeSelect('premium')}
                  className="group flex flex-col items-center gap-2 border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/10"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">Premium</h4>
                  <p className="text-xs text-gray-500 text-center">Abonnement mensuel</p>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="space-y-4">

                {/* Image upload */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-green-500 cursor-pointer overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] font-medium">Photo</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                  <p className="text-xs text-slate-400">Cliquez pour ajouter une image</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Nom du canal *</label>
                  <input
                    type="text"
                    name="name"
                    title="Nom du canal"
                    value={newChannel.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-green-500/30 outline-none transition-all"
                    required
                    placeholder="Ex: Pronos Ligue 1"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Description *</label>
                  <textarea
                    name="description"
                    title="Description du canal"
                    value={newChannel.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-green-500/30 outline-none transition-all"
                    rows={2}
                    required
                    placeholder="Décrivez votre canal..."
                  />
                </div>

                {/* Price for premium */}
                {newChannel.type === 'premium' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Prix mensuel (€) *</label>
                    <input
                      type="number"
                      name="price"
                      title="Prix mensuel"
                      min="0.99"
                      step="0.50"
                      value={newChannel.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-green-500/30 outline-none transition-all"
                      required
                    />
                  </div>
                )}

                {/* Features */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Fonctionnalités</h4>
                  <div className="space-y-2.5">
                    {['voiceMessages', 'comments', 'paidCoupons'].map((feature) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{featureLabels[feature] || feature}</span>
                        <label className="relative inline-block w-10 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            title={feature}
                            checked={newChannel.features[feature as keyof typeof newChannel.features]}
                            onChange={() => onFeatureToggle(feature)}
                          />
                          <div className="w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Retour
                </button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20">
                  Créer le canal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
