import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    timeout: 5000,
});

export const getTweets = async () => {
  try {
    return [
      {
        id: 1,
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
        id: 2,
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
        id: 3,
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
  } catch (error) {
    console.error("Erreur lors de la récupération des tweets :", error);
    throw error;
  }
};