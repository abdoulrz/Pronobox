import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { UserFeatures, Message } from '../../types/chat';

interface MessageInputProps {
  onSend: (text: string, image?: string | null, audio?: string | null, replyTo?: Message | null) => void;
  onImageSelected?: (imageUrl: string) => void;
  userFunctions?: UserFeatures;
  stagedImage?: string | null;
  stagedAudio?: string | null;
  onClearStaged?: () => void;
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onImageSelected,
  userFunctions,
  stagedImage,
  stagedAudio,
  onClearStaged,
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  replyTo,
  onCancelReply
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // Send staged content + text together in ONE message
    if (stagedImage || stagedAudio || message.trim()) {
      onSend(message.trim(), stagedImage, stagedAudio, replyTo);
      setMessage('');
      if (onClearStaged) onClearStaged();
      if (onCancelReply) onCancelReply();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelected) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageSelected(result); // Stage, don't send
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartRecording = () => {
    if (userFunctions && !userFunctions.canSendVoiceMessages) {
      alert('Passez à Pro pour envoyer des messages vocaux !');
      return;
    }
    onStartRecording();
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-1 h-8 bg-green-500 rounded-full flex-shrink-0"></div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-green-600 dark:text-green-400">{replyTo.user.username}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{replyTo.text}</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onCancelReply}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Staged image preview (WhatsApp/Telegram style) */}
      {stagedImage && (
        <div className="px-4 pt-3 pb-1">
          <div className="relative inline-block">
            <img
              src={stagedImage}
              alt="Image à envoyer"
              className="max-h-32 rounded-lg border border-gray-300 dark:border-gray-600 object-contain"
            />
            <button
              type="button"
              onClick={onClearStaged}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Staged audio preview */}
      {stagedAudio && (
        <div className="px-4 pt-3 pb-1">
          <div className="inline-flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-sm text-green-700 dark:text-green-300">Enregistrement vocal prêt</span>
            <button
              type="button"
              onClick={onClearStaged}
              className="ml-2 text-red-500 hover:text-red-700 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end space-x-2 p-4 pt-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Votre message..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-28 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[44px] max-h-[120px]"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex space-x-1.5 bg-white dark:bg-gray-700 rounded-lg p-0.5">
            <button
              type="button"
              title="Ajouter un emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-yellow-500 p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {isRecording ? (
              <button
                type="button"
                title="Arrêter l'enregistrement"
                onClick={onStopRecording}
                className="text-red-500 hover:text-red-700 flex items-center p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span className="ml-1 text-xs">{formatRecordingTime(recordingTime)}</span>
              </button>
            ) : (
              <button
                type="button"
                title="Enregistrer un message vocal"
                onClick={handleStartRecording}
                className="text-gray-500 hover:text-red-600 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            <label className="cursor-pointer text-gray-500 hover:text-blue-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="file"
                ref={fileInputRef}
                title="Joindre une image"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 z-50" ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled skinTonesDisabled />
            </div>
          )}
        </div>
        <button
          type="submit"
          title="Envoyer le message"
          className={`rounded-full p-2 flex-shrink-0 transition-colors ${
            message.trim() || stagedImage || stagedAudio
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
          }`}
          disabled={!message.trim() && !stagedImage && !stagedAudio}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};
