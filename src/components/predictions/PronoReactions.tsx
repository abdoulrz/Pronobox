import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { reactToProno } from '../../services/api';

interface ReactionItem {
  emoji: string;
  users: string[];
}

interface PronoReactionsProps {
  pronoId: string;
  initialReactions?: ReactionItem[];
  onReactUpdated?: (newReactions: ReactionItem[]) => void;
}

const EMOJI_LIST = ['👍', '👎', '🔥', '😮', '🧠'];

export const PronoReactions: React.FC<PronoReactionsProps> = ({
  pronoId,
  initialReactions = [],
  onReactUpdated
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reactions, setReactions] = useState<ReactionItem[]>(initialReactions);
  const [isReacting, setIsReacting] = useState(false);

  // Find if current user has reacted to any emoji
  const userReactionEmoji = user
    ? reactions.find((r) => r.users.some((uid) => String(uid) === String(user.id)))?.emoji
    : null;

  const handleReactionClick = async (emoji: string) => {
    if (!user) {
      // Redirect to authentication with current path as redirect parameter
      const redirectUrl = encodeURIComponent(window.location.pathname);
      navigate(`/auth?mode=register&redirect=${redirectUrl}`);
      return;
    }

    if (isReacting) return;
    setIsReacting(true);

    // Optimistic UI Update
    const previousReactions = [...reactions];
    let updatedReactions: ReactionItem[] = [];

    const isSameEmoji = userReactionEmoji === emoji;

    // Toggle off if same emoji, else swap/add
    if (isSameEmoji) {
      updatedReactions = reactions
        .map((r) => {
          if (r.emoji === emoji) {
            return {
              ...r,
              users: r.users.filter((uid) => String(uid) !== String(user.id))
            };
          }
          return r;
        })
        .filter((r) => r.users.length > 0);
    } else {
      // Remove user from old reaction
      const filteredReactions = reactions
        .map((r) => {
          if (userReactionEmoji && r.emoji === userReactionEmoji) {
            return {
              ...r,
              users: r.users.filter((uid) => String(uid) !== String(user.id))
            };
          }
          return r;
        })
        .filter((r) => r.users.length > 0);

      // Add user to new reaction
      const target = filteredReactions.find((r) => r.emoji === emoji);
      if (target) {
        updatedReactions = filteredReactions.map((r) => {
          if (r.emoji === emoji) {
            return { ...r, users: [...r.users, user.id] };
          }
          return r;
        });
      } else {
        updatedReactions = [...filteredReactions, { emoji, users: [user.id] }];
      }
    }

    // Apply optimistic state
    setReactions(updatedReactions);
    if (onReactUpdated) {
      onReactUpdated(updatedReactions);
    }

    try {
      const finalReactions = await reactToProno(pronoId, emoji);
      // Synchronize with backend response
      setReactions(finalReactions || []);
      if (onReactUpdated) {
        onReactUpdated(finalReactions || []);
      }
    } catch (err) {
      console.error('Failed to react to prono:', err);
      // Rollback on error
      setReactions(previousReactions);
      if (onReactUpdated) {
        onReactUpdated(previousReactions);
      }
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 select-none">
        Réactions :
      </span>
      <div className="flex items-center gap-1.5">
        {EMOJI_LIST.map((emoji) => {
          const reaction = reactions.find((r) => r.emoji === emoji);
          const count = reaction ? reaction.users.length : 0;
          const hasReacted = reaction?.users.some((uid) => String(uid) === String(user?.id)) || false;

          return (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              disabled={isReacting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 transform active:scale-95 ${
                hasReacted
                  ? 'bg-brand-green/10 dark:bg-brand-green/20 text-brand-green border border-brand-green/35 shadow-[0_2px_8px_rgba(34,197,94,0.15)]'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/20'
              }`}
            >
              <span className={`text-base transition-transform duration-200 ${hasReacted ? 'scale-110' : 'group-hover:scale-110'}`}>
                {emoji}
              </span>
              {count > 0 && (
                <span className={`text-xs ${hasReacted ? 'text-brand-green font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
