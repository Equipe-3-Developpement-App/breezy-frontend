import axios, { AxiosError } from "axios";
import { Tweet } from "@/types";

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
//  POSTS, MEDIAS & TAGS — Connexion réelle aux microservices
// ===========================================================================

const mapPostToTweet = (post: any): Tweet => ({
  id: post._id,
  content: post.content,
  media: post.media || null,
  createdAt: new Date(post.post_at).toLocaleString("fr-FR"),
  likeCount: post.likes_count || 0,
  retweetCount: 0,
  isLiked: false, 
  isRetweeted: false,
  user: {
    id: post.id_author,
    username: `user_${post.id_author}`,
    displayName: `Utilisateur ${post.id_author}`,
  },
});

export const getTweets = async (): Promise<Tweet[]> => {
  // Par défaut, on demande le feed (attention, si on n'est abonné à personne, ce sera vide !)
  // Si tu veux toujours forcer le profil 100 pour tes tests : "/api/posts/profile/100"
  const response = await apiClient.get("/api/posts/feed");
  return (response.data.posts || []).map(mapPostToTweet);
};

export const createTweetApi = async (text: string, mediaUrl?: string | null): Promise<Tweet> => {
  // Extraction des tags à la volée avant l'envoi
  const tags = text.match(/#[a-zA-Z0-9_À-ÿ]+/g)?.map(t => t.slice(1).toLowerCase()) || [];
  
  const response = await apiClient.post("/api/posts/create", { 
    content: text, 
    media: mediaUrl,
    tag: tags 
  });
  return mapPostToTweet(response.data.post);
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
  return mapPostToTweet(response.data.reply);
};

export const searchTweetsByTag = async (query: string): Promise<Tweet[]> => {
  if (!query.trim()) return [];
  // Si le backend n'a pas encore de route de recherche officielle, 
  // on filtre localement le feed comme tu l'avais fait précédemment :
  const allTweets = await getTweets(); 
  const searchTerm = query.startsWith('#') ? query.toLowerCase() : `#${query.toLowerCase()}`;
  return allTweets.filter(t => t.content.toLowerCase().includes(searchTerm));
};

export const getTweetById = async (tweetId: string) => {
  return {
    id: tweetId,
    content: "Route GET /api/posts/:id manquante dans le backend.",
    createdAt: "Maintenant",
    likeCount: 0, retweetCount: 0, isLiked: false, isRetweeted: false,
    user: { id: "1", username: "admin", displayName: "Admin" },
    comments: []
  };
};

export const retweetTweetApi = async (tweetId: string, isRetweeted: boolean, nextCount: number) => {
  console.warn(`Simulation du retweet pour ${tweetId}`);
};

export const deleteTweetApi = async (tweetId: string) => {
  console.warn(`Simulation de la suppression pour ${tweetId}`);
};