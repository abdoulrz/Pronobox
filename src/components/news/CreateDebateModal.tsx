import React, { useState, useRef, useEffect } from 'react';

interface ImagePreview {
  id: number;
  file: string;
  preview: string;
}

interface CreateDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debate: { title: string; description: string; images: string[]; category: string }) => Promise<void>;
  initialData?: {
    title: string;
    description: string;
    images: string[];
    category: string;
  };
  currentUser: {
    username: string;
    avatar: string;
  };
  isEditing?: boolean;
}

const CreateDebateModal: React.FC<CreateDebateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentUser,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    images: [] as ImagePreview[],
    category: 'Général'
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          description: initialData.description,
          images: initialData.images.map((img, index) => ({
            id: index,
            file: `image-${index}`,
            preview: img
          })),
          category: initialData.category || 'Général'
        });
      } else {
        setFormData({
          title: '',
          description: '',
          images: [],
          category: 'Général'
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = [...formData.images];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            file: file.name,
            preview: reader.result as string
          });
          setFormData(prev => ({
            ...prev,
            images: [...newImages]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) return;
    
    setIsLoading(true);
    try {
      await onSave({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        images: formData.images.map(img => img.preview)
      });
      onClose();
    } catch (error) {
      console.error("Error saving debate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-modal rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col animate-scale-in border border-slate-200 dark:border-brand-slate overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-brand-slate flex justify-between items-center bg-brand-green/90 backdrop-blur-md text-white">
          <h3 className="text-lg font-medium">
            {isEditing ? 'Modifier le débat' : 'Créer un nouveau débat'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-green-700"
            title="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-brand-text-2 mb-1.5">
                Titre du débat
              </label>
              <input
                type="text"
                className="input-dark text-slate-900 dark:text-white"
                placeholder="Ex: La VAR a-t-elle amélioré le football?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-brand-text-2 mb-1.5">
                Description
              </label>
              <textarea
                className="input-dark text-slate-900 dark:text-white"
                rows={4}
                placeholder="Décrivez brièvement le sujet du débat..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-brand-text-2 mb-1.5">
                Images du débat
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                multiple
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-100 dark:bg-brand-navy-3 text-slate-700 dark:text-brand-text-1 border border-slate-200 dark:border-brand-slate rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-brand-navy-4 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Ajouter des images
                </button>
                <span className="text-sm text-slate-500 dark:text-brand-text-3">
                  {formData.images.length > 0 ? `${formData.images.length} image(s) sélectionnée(s)` : 'Aucune image sélectionnée'}
                </span>
              </div>
              
              {formData.images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {formData.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img src={img.preview} alt="Prévisualisation" className="h-20 w-full object-cover rounded-lg border border-gray-200" />
                      <button
                        onClick={() => handleRemoveImage(img.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer l'image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-brand-text-2 mb-1.5">
                Catégorie
              </label>
              <select
                className="input-dark appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Général">Général</option>
                <option value="Arbitrage">Arbitrage</option>
                <option value="Économie">Économie</option>
                <option value="Compétitions">Compétitions</option>
                <option value="Transferts">Transferts</option>
                <option value="Tactique">Tactique</option>
                <option value="Clubs">Clubs</option>
                <option value="Joueurs">Joueurs</option>
              </select>
            </div>
            
            <div className="flex items-center p-3 bg-slate-50 dark:bg-brand-navy-3 rounded-xl border border-slate-100 dark:border-brand-slate">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3 border border-slate-200 dark:border-brand-slate shadow-sm">
                <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-slate-500 dark:text-brand-text-3">
                Vous publiez en tant que <span className="font-bold text-slate-900 dark:text-brand-text-1">{currentUser.username}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-brand-slate flex justify-end gap-3 bg-slate-50/50 dark:bg-brand-navy-3/50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-brand-slate text-slate-700 dark:text-brand-text-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-brand-navy-4 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary py-2 px-6 text-sm"
            disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
          >
            {isLoading ? 'Envoi...' : (isEditing ? 'Enregistrer' : 'Créer le débat')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDebateModal;
