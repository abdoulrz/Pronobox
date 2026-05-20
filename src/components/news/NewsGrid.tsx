import React, { useState } from 'react';
import { DebateCard } from './DebateCard';
import { Debate } from '../../services/api';

interface NewsGridProps {
  debates: Debate[];
  currentUserId: string | number;
  onSelect: (id: string | number) => void;
  onLike: (e: React.MouseEvent, id: string | number) => void;
}

const NewsGrid: React.FC<NewsGridProps> = ({
  debates,
  currentUserId,
  onSelect,
  onLike
}) => {
  // Stocker les index d'images actifs pour chaque débat dans la vue en grille
  const [gridActiveImageIndexes, setGridActiveImageIndexes] = useState<Record<string | number, number>>({});

  // Fonction pour naviguer dans le carousel d'images de la grille
  const navigateGridCarousel = (
    e: React.MouseEvent,
    debateId: number | string,
    direction: 'prev' | 'next',
    imageCount: number
  ) => {
    e.stopPropagation(); // Empêcher la propagation pour éviter d'ouvrir le débat
    setGridActiveImageIndexes((prev) => ({
      ...prev,
      [debateId]:
        direction === 'prev'
          ? ((prev[debateId] || 0) - 1 + imageCount) % imageCount
          : ((prev[debateId] || 0) + 1) % imageCount
    }));
  };

  // Fonction pour définir directement l'index d'image dans la grille
  const setGridImageIndex = (
    e: React.MouseEvent,
    debateId: number | string,
    index: number
  ) => {
    e.stopPropagation(); // Empêcher la propagation pour éviter d'ouvrir le débat
    setGridActiveImageIndexes((prev) => ({
      ...prev,
      [debateId]: index
    }));
  };

  if (debates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Aucun débat trouvé dans cette catégorie.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {debates.map((debate) => (
        <DebateCard
          key={debate.id}
          debate={debate}
          activeImageIndex={gridActiveImageIndexes[debate.id] || 0}
          onSelect={onSelect}
          onLike={onLike}
          onNavigateCarousel={(e, id, dir, count) => navigateGridCarousel(e, id, dir, count)}
          onSetImageIndex={(e, id, idx) => setGridImageIndex(e, id, idx)}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default NewsGrid;
