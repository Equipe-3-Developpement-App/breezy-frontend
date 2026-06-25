// --- CENTRALIZED ARCHITECTURE TYPES ---

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface Tweet {
  id: string;
  content: string;
  media?: string | null;
  createdAt: string;
  user: User;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isFollowing?: boolean;
  tags?: string[];
  isEdited?: boolean;
}