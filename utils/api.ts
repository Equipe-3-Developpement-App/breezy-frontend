import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 5000,
});

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