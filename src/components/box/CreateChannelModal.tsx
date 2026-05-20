import React from 'react';

export interface NewChannelData {
  name: string;
  description: string;
  type: string;
  price: string;
  isPrivate: boolean;
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
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setNewChannel({
      ...newChannel,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass-modal rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="relative px-4 py-3 bg-green-600 text-white">
          <h3 className="text-lg font-medium">Créer un nouveau canal</h3>
          <button
            title="Fermer"
            onClick={onClose}
            className="absolute right-4 top-3 text-white hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {step === 1 ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Choisissez le type de canal que vous souhaitez créer:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="border rounded-lg p-4 cursor-pointer border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                  onClick={() => onTypeSelect('free')}
                >
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Gratuit</h4>
                  <p className="text-xs text-gray-500 mt-2">Accessible à tous</p>
                </div>
                <div
                  className="border rounded-lg p-4 cursor-pointer border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700"
                  onClick={() => onTypeSelect('premium')}
                >
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">Premium</h4>
                  <p className="text-xs text-gray-500 mt-2">Abonnement mensuel</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du canal*
                  </label>
                  <input
                    type="text"
                    name="name"
                    title="Nom du canal"
                    value={newChannel.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description*
                  </label>
                  <textarea
                    name="description"
                    title="Description du canal"
                    value={newChannel.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                    rows={3}
                    required
                  />
                </div>
                {newChannel.type === 'premium' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prix mensuel (€)*
                    </label>
                    <input
                      type="number"
                      name="price"
                      title="Prix mensuel"
                      min="0.99"
                      step="0.50"
                      value={newChannel.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                      required
                    />
                  </div>
                )}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fonctionnalités</h4>
                  <div className="space-y-2">
                    {['voiceMessages', 'comments', 'paidCoupons'].map((feature) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{feature}</span>
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
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                >
                  Retour
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm">
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
