export interface Message {
  id: number;
  user: {
    id: string | number;
    username: string;
    avatar: string;
    role?: string;
    isPro?: boolean;
    isOnline?: boolean;
  };
  text: string;
  time?: string;
  timestamp: Date;
  likes: number;
  likedBy?: (number | string)[];
  replies?: Message[];
  isVoiceMessage?: boolean;
  isImage?: boolean;
  imageUrl?: string;
  audioUrl?: string;
  duration?: string;
  replyTo?: {
    id: number;
    text: string;
    username: string;
  };
  reactions?: { emoji: string; count: number; users: (number | string)[] }[];
  pronoMatchId?: number;
  pronoStatus?: string;
  pronoActualResult?: string;
}

export interface Channel {
  id: number | string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  members: number;
  memberUsers?: Array<{ id: string | number; username: string; avatar: string }>;
  messages: Message[];
  joined?: boolean;
  pinned?: boolean;
  lastMessage?: string;
  owner?: {
    id: string | number;
    username: string;
    avatar: string;
  };
  premium?: boolean;
  price?: number;
  allowVoiceMessages?: boolean;
}

export interface UserFeatures {
  canJoinChannels: boolean;
  canSubscribeToChannels: boolean;
  canPostComments: boolean;
  canCreateChannels: boolean;
  canMonetizeContent: boolean;
  canCreatePaidCoupons: boolean;
  canWithdrawFunds: boolean;
  canSendVoiceMessages: boolean;
  canAccessAdvancedStats: boolean;
  canExportData: boolean;
  canDeleteOwnMessages: boolean;
  canReactToMessages: boolean;
  canDeleteAnyMessage?: boolean;
  canManageAllChannels?: boolean;
  maxAttachmentSize: number;
  maxChannelsJoined: number;
  withdrawalFeePercentage: number;
  minWithdrawalAmount: number;
  withdrawalDays: string[];
  withdrawalProcessingDays: string[];
  joinChannel: (channelId: string | number) => { success: boolean; message: string };
  postComment: (channelId: string | number, comment: string) => { success: boolean; message: string };
  deleteMessage: (channelId: string | number, messageId: string | number) => { success: boolean; message: string };
  requestWithdrawal: (amount: number) => { success: boolean; message: string; fee?: number; netAmount?: number; processingDays?: string };
  createChannel?: (channelData: unknown) => { success: boolean; message: string; channelId: string };
  manageChannel?: (channelId: string | number, action: string, data: unknown) => { success: boolean; message: string };
  removeUserFromChannel?: (channelId: string | number, userId: string | number) => { success: boolean; message: string };
  featureChannel?: (channelId: string | number, featured: boolean) => { success: boolean; message: string };
  canRemoveUsersFromOwnChannels?: boolean;
  getChannelAnalytics?: (channelId: string | number) => { success: boolean; data: unknown };
  manageUser?: (userId: string | number, action: string) => { success: boolean; message: string };
  moderateChannel?: (channelId: string | number, action: string) => { success: boolean; message: string };
  setFeaturedChannel?: (channelId: string | number, featured: boolean) => { success: boolean; message: string };
  viewAllTransactions?: () => { success: boolean; transactions: unknown[] };
  canManageUsers?: boolean;
  canModerateContent?: boolean;
  canViewAllTransactions?: boolean;
  canSetFeaturedChannels?: boolean;
}
