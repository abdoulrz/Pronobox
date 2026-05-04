
import React, { useState } from 'react';
import UnifiedPaymentModal from './payment/UnifiedPaymentModal';

interface BetEducProps {
  onClose: () => void;
}

interface EducResource {
  id: number;
  title: string;
  type: string;
  image: string;
  price?: number;
}

const BetEduc: React.FC<BetEducProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('gratuits');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<EducResource | null>(null);

  // Mock data for free resources
  const freeResources = [
    {
      id: 1,
      title: 'Guide débutant des paris sportifs',
      type: 'E-Book',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'Les bases des statistiques sportives',
      type: 'Vidéo',
      image: 'https://images.unsplash.com/photo-1512020949297-fd0ec9a3a438?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'Comprendre les cotes et probabilités',
      type: 'Article',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ];

  // Mock data for pro resources
  const proResources = [
    {
      id: 1,
      title: 'Masterclass Trading Sportif',
      type: 'Formation',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1543286386-2e659306cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 2,
      title: 'Stratégies avancées de paris',
      type: 'E-Book Premium',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    },
    {
      id: 3,
      title: 'Analyse statistique approfondie',
      type: 'Webinaire',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    }
  ];

  const handleDownload = (resource: EducResource) => {
    // Simulation de téléchargement
    alert(`Téléchargement de "${resource.title}" en cours...`);
  };

  const handleBuyResource = (resource: EducResource) => {
    setSelectedResource(resource);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    if (selectedResource) {
      alert(`Félicitations! Vous avez acheté "${selectedResource.title}". Le contenu est maintenant disponible dans votre bibliothèque.`);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-green-600 text-white">
        <h2 className="text-xl font-bold">BET-EDUC</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-green-700"
          aria-label="Fermer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 font-medium text-sm ${activeTab === 'gratuits' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('gratuits')}
        >
          Gratuits
        </button>
        <button
          className={`flex-1 py-3 font-medium text-sm ${activeTab === 'pro' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('pro')}
        >
          Pro
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'gratuits' ? (
          <div className="space-y-4">
            {freeResources.map((resource) => (
              <div
                key={resource.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="h-32 overflow-hidden">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mb-2">
                    {resource.type}
                  </span>
                  <h3 className="font-medium">{resource.title}</h3>
                  <div className="mt-3 flex justify-end">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium"
                      onClick={() => handleDownload(resource)}
                    >
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {proResources.map((resource) => (
              <div
                key={resource.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="h-32 overflow-hidden">
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {resource.type}
                    </span>
                    <span className="font-bold text-green-600">
                      {resource.price} €
                    </span>
                  </div>
                  <h3 className="font-medium">{resource.title}</h3>
                  <div className="mt-3 flex justify-end">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium"
                      onClick={() => handleBuyResource(resource)}
                    >
                      Acheter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPaymentModal && selectedResource && (
        <UnifiedPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          paymentDetails={{
            amount: selectedResource.price ?? 0,
            description: `Achat: ${selectedResource.title}`,
            type: 'product',
            itemName: selectedResource.title
          }}
        />
      )}
    </div>
  );
};

export default BetEduc;