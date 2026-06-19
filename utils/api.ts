import axios, { AxiosError } from "axios";

// ===========================================================================
//  AUTHENTIFICATION — client axios partagé, tokens et appels auth
// ===========================================================================

// La gateway Nginx expose tous les services sur un seul point d'entrée.
// En docker-compose, NEXT_PUBLIC_API_URL vaut http://localhost:80 (cf. docker-compose.yml).
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost";

// Les tokens vivent dans des cookies httpOnly posés par l'auth-service : le JS
// ne peut donc pas les lire (protection XSS). Le navigateur les renvoie tout
// seul à chaque requête, à condition d'activer withCredentials ci-dessous.

// --- Client axios (point d'entrée gateway) --------------------------------
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  withCredentials: true, // indispensable : envoie/reçoit les cookies httpOnly
});

// Sur 401, tente un refresh une seule fois (le cookie refresh part tout seul)
// puis rejoue la requête initiale.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const isAuthRoute = original?.url?.includes("/api/auth/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        // axios "nu" + withCredentials pour envoyer le cookie refresh sans
        // re-déclencher cet interceptor en boucle.
        await axios.post(`${API_URL}/api/auth/refresh`, {}, { withCredentials: true });
        return apiClient(original); // les nouveaux cookies sont déjà posés
      } catch (refreshErr) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

// Erreur métier destinée à être affichée telle quelle à l'utilisateur.
export class ApiError extends Error {}

// --- Extraction d'un message d'erreur lisible -----------------------------
// auth-service : { success:false, error:{ code, message } }
// user-service : { error: "..." }
export function getErrorMessage(err: unknown, fallback = "Une erreur est survenue"): string {
  if (err instanceof ApiError) return err.message;
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: { message?: string } | string }
      | undefined;
    if (data?.error) {
      if (typeof data.error === "string") return data.error;
      if (data.error.message) return data.error.message;
    }
    if (err.code === "ECONNABORTED") return "Le serveur met trop de temps à répondre";
    if (!err.response) return "Impossible de joindre le serveur";
  }
  return fallback;
}

// --- Appels d'authentification --------------------------------------------
export interface CurrentUser {
  id: number;
  email: string;
  role: string;
}

export async function loginApi(email: string, password: string): Promise<void> {
  // L'auth-service pose les cookies httpOnly dans la réponse : rien à stocker côté JS.
  await apiClient.post("/api/auth/login", { email, password });
}

// Vérifie la disponibilité d'un pseudo (endpoint public, avant inscription).
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const res = await apiClient.get("/api/users/check-username", { params: { username } });
  return res.data?.available === true;
}

// Inscription complète : vérifie le pseudo AVANT toute création (pour ne pas
// laisser un compte auth orphelin), crée le compte, se connecte (pose le cookie),
// puis crée le profil. id_auth est dérivé du token par la gateway/user-service.
export async function registerApi(username: string, email: string, password: string) {
  // 0. Pré-vérification du pseudo : on échoue avant de créer quoi que ce soit.
  const available = await checkUsernameAvailable(username);
  if (!available) {
    throw new ApiError("Ce nom d'utilisateur est déjà pris");
  }

  // 1. Création du compte d'authentification.
  await apiClient.post("/api/auth/register", { email, password });

  // 2. Connexion : pose le cookie httpOnly nécessaire à la route protégée.
  await loginApi(email, password);

  // 3. Création du profil avec le pseudo (le cookie est envoyé automatiquement).
  await apiClient.post("/api/users/", { username });
}

export async function logoutApi() {
  // L'auth-service efface les cookies httpOnly ; rien à nettoyer côté JS.
  try {
    await apiClient.post("/api/auth/logout");
  } catch {
    // Même si l'appel échoue (token déjà expiré), on ignore : l'utilisateur est déconnecté.
  }
}

// Vérifie la session côté serveur (le cookie n'étant pas lisible en JS).
// Renvoie l'utilisateur courant, ou null si non authentifié.
export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const res = await apiClient.get("/api/auth/validate");
    return res.data.data as CurrentUser;
  } catch {
    return null;
  }
}

// ===========================================================================
//  TWEETS — données simulées (localStorage), à brancher sur /api/posts plus tard
// ===========================================================================

const INITIAL_TWEETS = [
  {
    id: "1",
    name: "Camille Roy",
    handle: "@camille",
    time: "2 h",
    avatar: "CR",
    text: "Petit rappel du matin : un bon espacement vaut mille décorations. Je repars peaufiner mes marges ✨",
    commentCount: 12,
    retweetCount: 8,
    likeCount: 64,
    isLiked: false,
    isRetweeted: false,
    comments: [
      {
        id: "c1",
        name: "Yacine Bélanger",
        handle: "@yacineb",
        time: "1 h",
        avatar: "YB",
        text: "Totalement d'accord, l'espace blanc est un ingrédient à part entière !",
        commentCount: 0,
        retweetCount: 2,
        likeCount: 4,
        isLiked: false,
        isRetweeted: false,
        comments: []
      }
    ]
  },
  {
    id: "2",
    name: "Yacine Bélanger",
    handle: "@yacineb",
    time: "4 h",
    avatar: "YB",
    text: "Le métro avait 12 min de retard, alors j'ai noté trois idées d'app. Une seule est viable. C'est déjà ça.",
    commentCount: 5,
    retweetCount: 3,
    likeCount: 41,
    isLiked: true,
    isRetweeted: true,
    comments: []
  }
];

const getStoredTweets = (): any[] => {
  if (typeof window === "undefined") return INITIAL_TWEETS;
  const stored = localStorage.getItem("breezy_mock_db");
  if (!stored) {
    localStorage.setItem("breezy_mock_db", JSON.stringify(INITIAL_TWEETS));
    return INITIAL_TWEETS;
  }
  return JSON.parse(stored);
};

const saveStoredTweets = (tweets: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("breezy_mock_db", JSON.stringify(tweets));
  }
};

export const getTweets = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return getStoredTweets();
  } catch (error) {
    console.error("Erreur lors de la récupération des tweets :", error);
    throw error;
  }
};

export const getTweetById = async (tweetId: string) => {
  const db = getStoredTweets();
  const match = db.find((t) => t.id.toString() === tweetId.toString());
  if (!match) throw new Error("Tweet introuvable");
  return match;
};

export const createCommentApi = async (tweetId: string, text: string) => {
  const db = getStoredTweets();
  let createdComment: any = null;

  const updatedDb = db.map((tweet) => {
    if (tweet.id.toString() === tweetId.toString()) {
      createdComment = {
        id: Math.floor(Math.random() * 100000).toString(),
        name: "Camille Roy",
        handle: "@camille",
        time: "1 min",
        avatar: "CR",
        text: text,
        commentCount: 0,
        retweetCount: 0,
        likeCount: 0,
        isLiked: false,
        isRetweeted: false,
        comments: [] // Prêt pour accueillir des sous-commentaires plus tard
      };
      return {
        ...tweet,
        commentCount: (tweet.commentCount || 0) + 1,
        comments: [...(tweet.comments || []), createdComment]
      };
    }
    return tweet;
  });

  saveStoredTweets(updatedDb);
  return createdComment;
};

// Gère le Like à la fois sur le post principal OU à l'intérieur de ses commentaires imbriqués
export const likeTweetApi = async (tweetId: string, isLiked: boolean, nextCount: number) => {
  const db = getStoredTweets();
  
  const updatedDb = db.map((t) => {
    // Si c'est le tweet principal
    if (t.id.toString() === tweetId.toString()) {
      return { ...t, isLiked, likeCount: nextCount };
    }
    // Sinon on regarde s'il est dans les commentaires du tweet
    if (t.comments && t.comments.length > 0) {
      const updatedComments = t.comments.map((c: any) => 
        c.id.toString() === tweetId.toString() ? { ...c, isLiked, likeCount: nextCount } : c
      );
      return { ...t, comments: updatedComments };
    }
    return t;
  });

  saveStoredTweets(updatedDb);
};

// Gère le Retweet à la fois sur le post principal OU à l'intérieur de ses commentaires
export const retweetTweetApi = async (tweetId: string, isRetweeted: boolean, nextCount: number) => {
  const db = getStoredTweets();
  
  const updatedDb = db.map((t) => {
    if (t.id.toString() === tweetId.toString()) {
      return { ...t, isRetweeted, retweetCount: nextCount };
    }
    if (t.comments && t.comments.length > 0) {
      const updatedComments = t.comments.map((c: any) => 
        c.id.toString() === tweetId.toString() ? { ...c, isRetweeted, retweetCount: nextCount } : c
      );
      return { ...t, comments: updatedComments };
    }
    return t;
  });

  saveStoredTweets(updatedDb);
};

export const createTweetApi = async (text: string) => {
  const db = getStoredTweets();
  const newTweet = {
    id: Math.floor(Math.random() * 100000).toString(),
    name: "Camille Roy",
    handle: "@camille",
    time: "1 min",
    avatar: "CR",
    text: text,
    commentCount: 0,
    retweetCount: 0,
    likeCount: 0,
    isLiked: false,
    isRetweeted: false,
    comments: []
  };
  const updatedDb = [newTweet, ...db];
  saveStoredTweets(updatedDb);
  return newTweet;
};

export const deleteTweetApi = async (tweetId: string) => {
  const db = getStoredTweets();
  const updatedDb = db.filter((t) => t.id.toString() !== tweetId.toString());
  saveStoredTweets(updatedDb);
};