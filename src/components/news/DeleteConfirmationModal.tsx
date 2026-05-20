import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  description = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-modal rounded-2xl max-w-sm w-full shadow-2xl animate-scale-in border border-slate-200 dark:border-brand-slate overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-brand-slate flex justify-between items-center bg-red-600 text-white">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-red-700 transition-colors"
            title="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-700 dark:text-brand-text-2 text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-brand-slate flex justify-end gap-3 bg-slate-50 dark:bg-brand-navy-3/30">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-brand-slate text-slate-700 dark:text-brand-text-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-brand-navy-4 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95 transition-all"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
