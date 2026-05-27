import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types/chat';

interface MessageCardProps {
  message: Message;
  currentUserId: string | number;
  onReaction: (emoji: string) => void;
  onLongPress: () => void;
  onShowReactionPicker: () => void;
  onReply: () => void;
  onScrollToMessage: (messageId: number | string) => void;
  onImageClick?: (imageUrl: string) => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  currentUserId,
  onReaction,
  onLongPress,
  onShowReactionPicker,
  onReply,
  onScrollToMessage,
  onImageClick
}) => {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => {
          console.error("Audio play failed:", e);
          setIsPlaying(false);
        });
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleError = () => {
      setIsPlaying(false);
      console.error("Audio playback error");
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    startLongPress();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStart;
    
    // Only allow swiping to the right for reply
    if (diff > 0) {
      setSwipeX(Math.min(diff, 100)); // Cap the swipe distance
    }
  };

  const handleTouchEnd = () => {
    if (swipeX > 50) {
      onReply();
    }
    setSwipeX(0);
    setTouchStart(null);
    cancelLongPress();
  };

  const startLongPress = () => {
    const timer = setTimeout(() => {
      onLongPress();
    }, 500);
    setLongPressTimer(timer);
  };

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const isOwnMessage = message.user.id === currentUserId;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group animate-fade-in relative overflow-hidden`}>
      {/* Swipe Reply Icon */}
      {swipeX > 20 && (
        <div 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 z-0 flex flex-col items-center justify-center message-swipe-overlay"
          style={{ '--swipe-opacity': Math.min(swipeX / 50, 1) } as React.CSSProperties}
        >
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
        </div>
      )}

      <div 
        className={`flex max-w-[85%] sm:max-w-[75%] relative z-10 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} message-swipe-content`}
        style={{ '--swipe-x': `${swipeX}px` } as React.CSSProperties}
      >
        <div className={`relative w-8 h-8 rounded-full flex-shrink-0 self-end ${isOwnMessage ? 'ml-2' : 'mr-2'}`}>
          <div className="w-full h-full rounded-full overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm">
            <img
              src={message.user.avatar}
              alt={message.user.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${message.user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        </div>

        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-3 py-2 rounded-2xl transition-all duration-200 ${
              isOwnMessage 
                ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-br-none shadow-sm' 
                : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'
            }`}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sender Name & Badges */}
            <div className="flex items-center space-x-1 mb-1 opacity-90">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isOwnMessage ? 'text-emerald-700 dark:text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {message.user.username}
              </span>
              {message.user.role === 'admin' && (
                <span className="inline-flex items-center px-1 py-0.25 rounded text-[9px] font-bold bg-purple-500 text-white uppercase tracking-tighter">
                  Admin
                </span>
              )}
              {message.user.isPro && (
                <span className="inline-flex items-center px-1 py-0.25 rounded text-[9px] font-bold bg-yellow-500 text-white uppercase tracking-tighter">
                  Pro
                </span>
              )}
            </div>

            {/* Reply Block */}
            {message.replyTo && (
              <div className={`mb-2 p-2 rounded-lg border-l-4 bg-black/5 dark:bg-white/5 border-green-500 text-left overflow-hidden cursor-pointer hover:bg-black/10 transition-colors`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (message.replyTo?.id) {
                    onScrollToMessage(message.replyTo.id);
                  }
                }}
              >
                <p className="text-[10px] font-bold text-green-500 truncate">{message.replyTo.username}</p>
                <p className={`text-[11px] truncate ${isOwnMessage ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {message.replyTo.text}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {/* Image Content */}
              {(message.isImage || message.imageUrl) && (
                <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                  <img
                    src={message.imageUrl || message.text}
                    alt="Shared media"
                    className="w-full max-h-80 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onImageClick) {
                        onImageClick(message.imageUrl || message.text);
                      }
                    }}
                  />
                </div>
              )}

              {/* Audio Content */}
              {(message.isVoiceMessage || message.audioUrl) && (
                <div className={`flex flex-col p-2 rounded-xl ${isOwnMessage ? 'bg-black/10 dark:bg-black/20' : 'bg-gray-100/50 dark:bg-gray-700/50'}`}>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={togglePlay}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm ${isOwnMessage ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full relative overflow-hidden">
                      <div 
                        className={`absolute inset-y-0 left-0 bg-green-500 rounded-full audio-progress-fill ${isPlaying ? 'animate-pulse' : ''}`}
                        style={{ '--progress-width': `${progressPercentage}%` } as React.CSSProperties}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono opacity-80 min-w-[60px] text-right">
                      {formatTime(currentTime)} / {formatTime(duration || (message.duration ? parseInt(message.duration) : 0))}
                    </span>
                  </div>
                  {/* Real audio element for playback */}
                  <audio className="hidden" src={message.audioUrl || '#'} ref={audioRef} />
                </div>
              )}

              {/* Text Content */}
              {message.text && !(message.isImage && !message.imageUrl) && !(message.isVoiceMessage && !message.audioUrl) && (
                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isOwnMessage ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                  {message.text}
                </p>
              )}
            </div>

            {/* Time and Status */}
            <div className={`flex items-center mt-1 space-x-1 ${isOwnMessage ? 'justify-end text-emerald-800 dark:text-emerald-200' : 'justify-start text-gray-500 dark:text-gray-400'}`}>
              <span className="text-[9px] opacity-70">
                {message.timestamp instanceof Date && !isNaN(message.timestamp.getTime())
                  ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </span>
              {isOwnMessage && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>

          {/* Reactions Row */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs transition-all hover:scale-105 shadow-sm ${
                    reaction.users.includes(currentUserId) 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800' 
                      : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReaction(reaction.emoji);
                  }}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span className="font-bold">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons (Visible on hover) */}
          <div className={`flex items-center space-x-3 mt-1 px-1 transition-opacity opacity-0 group-hover:opacity-100`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReply();
              }}
              className="text-gray-400 hover:text-green-600 transition-colors"
              title="Répondre"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowReactionPicker();
              }}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
              title="Réagir"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
