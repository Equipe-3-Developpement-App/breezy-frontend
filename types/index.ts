// --- CENTRALIZED ARCHITECTURE TYPES ---

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Tweet {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  likeCount: number;
  retweetCount: number;
  isLiked: boolean;
  isRetweeted: boolean;
  isFollowing?: boolean;
}