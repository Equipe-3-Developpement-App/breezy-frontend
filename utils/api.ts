import axios, { AxiosError } from "axios";
import { Tweet, User } from "@/types";

// ===========================================================================
//  AUTHENTIFICATION — client axios partagé, tokens et appels auth
// ===========================================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:80";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const isAuthRoute = original?.url?.includes("/api/auth/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        return apiClient(original);
      } catch (refreshErr) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export class ApiError extends Error {}

export function getErrorMessage(err: unknown, fallback = "Une erreur est survenue"): string {
  if (err instanceof ApiError) return err.message;
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string } | string } | undefined;
    if (data?.error) {
      if (typeof data.error === "string") return data.error;
      if (data.error.message) return data.error.message;
    }
    if (err.code === "ECONNABORTED") return "Le serveur met trop de temps à répondre";
    if (!err.response) return "Impossible de joindre le serveur";
  }
  return fallback;
}

export interface CurrentUser {
  id: number;
  email: string;
  role: string;
}

export async function loginApi(email: string, password: string): Promise<void> {
  await apiClient.post("/api/auth/login", { email, password });
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const res = await apiClient.get("/api/users/check-username", { params: { username } });
  return res.data?.available === true;
}

export async function registerApi(username: string, email: string, password: string) {
  const available = await checkUsernameAvailable(username);
  if (!available) throw new ApiError("Ce nom d'utilisateur est déjà pris");
  await apiClient.post("/api/auth/register", { email, password });
  await loginApi(email, password);
  await apiClient.post("/api/users/", { username });
}

export async function adminCreateUserApi(username: string, email: string, password: string) {
  const available = await checkUsernameAvailable(username);
  if (!available) throw new ApiError("Ce nom d'utilisateur est déjà pris");
  
  const authRes = await apiClient.post("/api/auth/register", { email, password });
  const newUserId = authRes.data.data.id;

  await apiClient.post("/api/users/", { username, id_auth: newUserId });
}

export async function logoutApi() {
  try {
    await apiClient.post("/api/auth/logout");
  } catch {}
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await apiClient.get("/api/auth/validate");
    return res.data.data as CurrentUser;
  } catch {
    return null;
  }
}

// ===========================================================================
//  PROFIL UTILISATEUR & ABONNEMENTS
// ===========================================================================

export interface UserProfile {
  id_user: number;
  id_auth: number;
  username: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const res = await apiClient.get("/api/users");
    return res.data;
  } catch { return []; }
};

export const getUserProfileByAuthId = async (id: string | number): Promise<UserProfile | null> => {
  try {
    const res = await apiClient.get(`/api/users/by-auth/${id}`);
    return res.data;
  } catch { return null; }
};

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const authUser = await fetchCurrentUser();
  if (!authUser) return null;
  return getUserProfileByAuthId(authUser.id);
};

export const getUserFollowStats = async (userId: string | number) => {
  try {
    const [following, followers] = await Promise.all([
      apiClient.get(`/api/users/${userId}/following`).catch(() => ({ data: [] })),
      apiClient.get(`/api/users/${userId}/followers`).catch(() => ({ data: [] }))
    ]);
    return {
      followingCount: following.data.length || 0,
      followersCount: followers.data.length || 0
    };
  } catch { return { followingCount: 0, followersCount: 0 }; }
};

export const updateUserProfile = async (bio: string, avatar_url?: string) => {
  const res = await apiClient.patch("/api/users/me", { bio, avatar_url });
  return res.data;
};

export const getFollowingIds = async (userId: string | number): Promise<string[]> => {
  try {
    const res = await apiClient.get(`/api/users/${userId}/following/ids`);
    return (res.data.following_ids || []).map(String);
  } catch { return []; }
};

export const followUserApi = async (userId: string) => {
  await apiClient.post("/api/users/follow", { id_followee: userId });
};

export const unfollowUserApi = async (userId: string) => {
  await apiClient.delete(`/api/users/follow/${userId}`);
};

export const toggleFollowApi = async (userId: string, isFollowing: boolean) => {
  if (isFollowing) {
    await apiClient.delete(`/api/users/follow/${userId}`);
  } else {
    await apiClient.post("/api/users/follow", { id_followee: userId });
  }
};

export const searchUsersApi = async (query: string): Promise<User[]> => {
  if (!query.trim()) return [];
  const response = await apiClient.get("/api/users/search", { params: { q: query } });
  
  return response.data.map((u: any) => ({
    id: u.id_auth.toString(),
    username: u.username,
    avatarUrl: u.avatar_url || undefined,
  }));
};

// ===========================================================================
//  POSTS, MEDIAS & TAGS
// ===========================================================================

export const hydrateTweets = async (posts: any[]): Promise<Tweet[]> => {
  if (!posts || posts.length === 0) return [];
  
  const [users, currentUser] = await Promise.all([
    getAllUsers(),
    fetchCurrentUser()
  ]);
  
  let myFollowingIds: string[] = [];
  if (currentUser) {
    myFollowingIds = await getFollowingIds(currentUser.id);
  }
  
  const userMap = new Map<string, UserProfile>();
  users.forEach(u => userMap.set(u.id_auth.toString(), u));

  return posts.map(post => {
    const authorIdStr = post.id_author?.toString();
    const author = userMap.get(authorIdStr);
    return {
      id: post._id,
      content: post.content,
      media: post.media || null,
      createdAt: new Date(post.post_at).toLocaleString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric", 
        hour: "2-digit", minute: "2-digit"
      }),
      likeCount: post.likes_count || 0,
      commentCount: post.comments_count || 0,
      isLiked: post.isLiked === true, 
      isFollowing: myFollowingIds.includes(authorIdStr),
      isEdited: post.is_edited === true,
      tags: post.tag || [],
      user: {
        id: authorIdStr,
        username: author ? author.username : `user_${post.id_author}`,
        avatarUrl: author?.avatar_url || undefined,
      },
    };
  });
};

export const getTweets = async (): Promise<Tweet[]> => {
  const response = await apiClient.get("/api/posts/feed");
  return hydrateTweets(response.data.posts || []);
};

export const getUserPosts = async (userId: string | number): Promise<Tweet[]> => {
  const response = await apiClient.get(`/api/posts/profile/${userId}`);
  return hydrateTweets(response.data || []);
};

export const getUserReplies = async (userId: string | number): Promise<Tweet[]> => {
  const response = await apiClient.get(`/api/posts/profile/${userId}/replies`);
  return hydrateTweets(response.data || []);
};

export const createTweetApi = async (text: string, mediaUrl?: string | null): Promise<Tweet> => {
  const tags = text.match(/#[a-zA-Z0-9_À-ÿ]+/g)?.map(t => t.slice(1).toLowerCase()) || [];
  const response = await apiClient.post("/api/posts/create", { content: text, media: mediaUrl, tag: tags });
  const [hydrated] = await hydrateTweets([response.data.post]);
  return hydrated;
};

export const updateTweetApi = async (tweetId: string, text: string, mediaUrl?: string | null): Promise<Tweet> => {
  const tags = text.match(/#[a-zA-Z0-9_À-ÿ]+/g)?.map(t => t.slice(1).toLowerCase()) || [];
  const response = await apiClient.put(`/api/posts/${tweetId}`, { content: text, media: mediaUrl, tag: tags });
  const [hydrated] = await hydrateTweets([response.data.post]);
  return hydrated;
};

export const uploadMediaApi = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "post");
  const response = await apiClient.post("/api/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const likeTweetApi = async (tweetId: string, isLiked: boolean, nextCount: number) => {
  await apiClient.post(`/api/posts/${tweetId}/like`);
};

export const createCommentApi = async (tweetId: string, text: string) => {
  const response = await apiClient.post(`/api/posts/${tweetId}/reply`, { content: text });
  const [hydrated] = await hydrateTweets([response.data.reply]);
  return hydrated;
};

export const searchTweetsByTag = async (query: string): Promise<Tweet[]> => {
  if (!query.trim()) return [];
  const tag = query.startsWith("#") ? query.slice(1).toLowerCase() : query.toLowerCase();
  const response = await apiClient.get("/api/posts/search", { params: { tag } });
  return hydrateTweets(response.data.posts || []);
};

export const getTweetById = async (tweetId: string) => {
  const response = await apiClient.get(`/api/posts/${tweetId}`);
  
  let hydratedParentArr: Tweet[] = [];
  if (response.data.parentPost) {
    hydratedParentArr = await hydrateTweets([response.data.parentPost]);
  }

  const hydratedPostArr = await hydrateTweets([response.data.post]);
  const hydratedCommentsArr = await hydrateTweets(response.data.comments || []);
  
  if (hydratedPostArr.length === 0) throw new Error("Post introuvable");
  
  return {
    parentPost: hydratedParentArr.length > 0 ? hydratedParentArr[0] : null,
    ...hydratedPostArr[0],
    comments: hydratedCommentsArr
  };
};

export const deleteTweetApi = async (tweetId: string) => {
  await apiClient.delete(`/api/posts/${tweetId}`);
};

// ===========================================================================
//  SUSPEND BAN
// ===========================================================================-
export async function moderateAccountApi(idAuth: string | number, action: "ban" | "suspend" | "unban", durationDays?: number) {
  const response = await apiClient.patch(`/api/auth/moderate/${idAuth}`, {
    action,
    duration_days: durationDays
  });
  return response.data;
}