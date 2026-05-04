
export interface Reply {
  id: number | string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  likedBy?: (number | string)[];
}

export interface Message {
  id: number | string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  likedBy?: (number | string)[];
  replies: Reply[];
}

export interface Debate {
  id: number | string;
  title: string;
  description: string;
  images: string[];
  category: string;
  participants: number;
  lastActivity: string;
  likes: number;
  likedBy: (number | string)[];
  author: { id: number | string; username: string; avatar: string };
  messages: Message[];
}
