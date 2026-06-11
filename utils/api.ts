import axios from "axios";

// --- API CLIENT CONFIGURATION ---
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
});

// --- HARDCODED INITIAL SOURCE SEED ---
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
    isRetweeted: false
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
    isRetweeted: true
  },
  {
    id: "3",
    name: "Yacine Bélanger",
    handle: "@yacineb",
    time: "4 h",
    avatar: "YB",
    text: "Le métro avait 12 min de retard, alors j'ai noté trois idées d'app. Une seule est viable. C'est déjà ça.",
    commentCount: 5,
    retweetCount: 3,
    likeCount: 41,
    isLiked: true,
    isRetweeted: false
  }
];

// --- PERSISTENCE UTILS HELPER FUNCTIONS ---
// Looking inside the browser Storage layer to mock database interactions (Fixes point 2.B & 3.C)
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

// --- CLIENT REQUISITION PIPELINES ---
export const getTweets = async () => {
  try {
    // Simulating a minor network latency delay for real UI testing
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredTweets();
  } catch (error) {
    console.error("Erreur lors de la récupération des tweets :", error);
    throw error;
  }
};

// Mocking the patch/put HTTP calls for likes persistence logic
export const likeTweetApi = async (tweetId: string, isLiked: boolean, nextCount: number) => {
  const db = getStoredTweets();
  const updatedDb = db.map((t) => 
    t.id.toString() === tweetId.toString() ? { ...t, isLiked, likeCount: nextCount } : t
  );
  saveStoredTweets(updatedDb);
};

// Mocking the patch/put HTTP calls for retweets persistence logic
export const retweetTweetApi = async (tweetId: string, isRetweeted: boolean, nextCount: number) => {
  const db = getStoredTweets();
  const updatedDb = db.map((t) => 
    t.id.toString() === tweetId.toString() ? { ...t, isRetweeted, retweetCount: nextCount } : t
  );
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
    isRetweeted: false
  };
  
  const updatedDb = [newTweet, ...db];
  saveStoredTweets(updatedDb);
  return newTweet;
};

// Mocking the delete HTTP call for removing a tweet from localStorage
export const deleteTweetApi = async (tweetId: string) => {
  const db = getStoredTweets();
  // Keep all tweets except the one we want to delete
  const updatedDb = db.filter((t) => t.id.toString() !== tweetId.toString());
  saveStoredTweets(updatedDb);
};