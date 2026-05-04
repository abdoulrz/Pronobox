
import React from 'react';
import { Debate } from '../../types/news';

interface DebateCardProps {
  debate: Debate;
  activeImageIndex: number;
  onSelect: (id: number | string) => void;
  onLike: (e: React.MouseEvent, id: number | string) => void;
  onNavigateCarousel: (e: React.MouseEvent, id: number | string, direction: 'prev' | 'next', count: number) => void;
  onSetImageIndex: (e: React.MouseEvent, id: number | string, index: number) => void;
  currentUserId: number | string;
}

export const DebateCard: React.FC<DebateCardProps> = ({
  debate,
  activeImageIndex,
  onSelect,
  onLike,
  onNavigateCarousel,
  onSetImageIndex,
  currentUserId
}) => {
  const isLiked = debate.likedBy.some(id => String(id) === String(currentUserId));

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(debate.id)}
    >
      <div className="h-40 overflow-hidden relative bg-gray-100 dark:bg-gray-700">
        <img
          src={debate.images[activeImageIndex] || debate.images[0]}
          alt={debate.title}
          className="w-full h-full object-cover"
        />

        {/* Carousel controls */}
        {debate.images.length > 1 && (
          <>
            <button
              onClick={(e) => onNavigateCarousel(e, debate.id, 'prev', debate.images.length)}
              className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 z-10"
              title="Image précédente"
              aria-label="Image précédente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => onNavigateCarousel(e, debate.id, 'next', debate.images.length)}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 z-10"
              title="Image suivante"
              aria-label="Image suivante"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Pagination indicators */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
              {debate.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${index === activeImageIndex ? 'bg-white' : 'bg-gray-300 bg-opacity-70'}`}
                  onClick={(e) => onSetImageIndex(e, debate.id, index)}
                  aria-label={`Image ${index + 1}`}
                />
              ))}
            </div>
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded-md z-10">
              {activeImageIndex + 1}/{debate.images.length}
            </div>
          </>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
            {debate.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {debate.lastActivity}
          </span>
        </div>
        <h3 className="font-medium text-sm mb-1 text-slate-900 dark:text-white">{debate.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {debate.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="flex text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {debate.participants}
            </span>
            <span className="flex items-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {debate.messages.length}
            </span>
            
            <button
              className={`flex items-center transition-all ${isLiked ? 'text-red-500 animate-pulse-heart' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
              onClick={(e) => onLike(e, debate.id)}
              aria-label={isLiked ? 'Ne plus aimer ce débat' : "J'aime ce débat"}
              title={isLiked ? 'Ne plus aimer ce débat' : "J'aime ce débat"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 mr-1"
                fill={isLiked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={isLiked ? 'font-bold' : ''}>{debate.likes}</span>
            </button>
          </div>
          
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-200">
              <img src={debate.author.avatar} alt={debate.author.username} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs text-gray-600 ml-1">{debate.author.username}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
