
export interface Channel {
  id: string;
  name: string;
  members: number;
  views?: number;
  image?: string;
  description: string;
  posts?: ChannelPost[];
  revenue?: number;
  subscriptions?: number;
  growth?: number;
  createdAt?: string;
  lastActivity?: string;
  performance?: ChannelPerformance;
  topContent?: { id: string; title: string; views: number }[];
  recentActivities?: { type: string; date: string; user?: string; amount?: number; title?: string; content?: string }[];
  // Real-time channel fields
  premium?: boolean;
  avatar?: string;
  joined?: boolean;
  lastMessage?: string;
  price?: number;
  pinned?: boolean;
  messages?: any[];
  category?: string;
  allowVoiceMessages?: boolean;
  owner?: { id: string; username?: string; name?: string; avatar: string };
  winRate?: number | null;
  lastWonProno?: { home: string; away: string; result: string } | null;
}

export interface ChannelPost {
  id: string;
  title: string;
  content: string;
}

export interface ChannelPerformance {
  accuracy: number;
  engagement: number;
  retention: number;
}

export interface ChannelDetails extends Channel {
  fullDescription: string;
  created: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface ChannelData {
  channels: Channel[];
  channelDetails: Record<string, ChannelDetails>;
}
