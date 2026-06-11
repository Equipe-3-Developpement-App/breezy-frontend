"use client";

import React, { useState, useEffect } from "react";
import { TweetCard } from "./TweetCard";
import { Tweet } from "@/types";
import { getTweets, deleteTweetApi } from "@/utils/api";
import { AlertCircle, RefreshCw } from "lucide-react";

export function TweetList() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTweets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTweets();
        
        if (isMounted) {
          const standardTweets: Tweet[] = data.map((t: any) => ({
            id: t.id.toString(),
            content: t.text,
            createdAt: t.time,
            likeCount: t.likeCount,
            retweetCount: t.retweetCount,
            isLiked: !!t.isLiked,
            isRetweeted: !!t.isRetweeted,
            user: {
              id: t.handle,
              username: t.handle.replace("@", ""),
              displayName: t.name,
              avatarUrl: undefined
            },
            isFollowing: false
          }));
          setTweets(standardTweets);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Impossible de charger les messages. Vérifiez votre connexion avec la brise.");
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTweets();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLikeToggle = async (tweetId: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;

    setTweets((currentTweets) =>
      currentTweets.map((tweet) => {
        if (tweet.id === tweetId) {
          updatedIsLiked = !tweet.isLiked;
          updatedCount = updatedIsLiked ? tweet.likeCount + 1 : tweet.likeCount - 1;
          return { ...tweet, isLiked: updatedIsLiked, likeCount: updatedCount };
        }
        return tweet;
      })
    );

    try {
      await (await import("@/utils/api")).likeTweetApi(tweetId, updatedIsLiked, updatedCount);
    } catch (err) {
      console.error("Failed to sync like action with storage:", err);
    }
  };

  const handleRetweetToggle = async (tweetId: string) => {
    let updatedIsRetweeted = false;
    let updatedCount = 0;

    setTweets((currentTweets) =>
      currentTweets.map((tweet) => {
        if (tweet.id === tweetId) {
          updatedIsRetweeted = !tweet.isRetweeted;
          updatedCount = updatedIsRetweeted ? tweet.retweetCount + 1 : tweet.retweetCount - 1;
          return { ...tweet, isRetweeted: updatedIsRetweeted, retweetCount: updatedCount };
        }
        return tweet;
      })
    );

    try {
      await (await import("@/utils/api")).retweetTweetApi(tweetId, updatedIsRetweeted, updatedCount);
    } catch (err) {
      console.error("Failed to sync retweet action with storage:", err);
    }
  };

  const handleFollowToggle = (userId: string) => {
    setTweets((currentTweets) =>
      currentTweets.map((tweet) => {
        if (tweet.user.id === userId) {
          return { ...tweet, isFollowing: !tweet.isFollowing };
        }
        return tweet;
      })
    );
  };

  const handleDeleteTweet = async (tweetId: string) => {
    setTweets((currentTweets) => currentTweets.filter((tweet) => tweet.id !== tweetId));
    
    try {
      await deleteTweetApi(tweetId);
    } catch (err) {
      console.error("Failed to delete tweet item pipeline sync:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-breezy-gray gap-3 animate-pulse">
        <RefreshCw className="animate-spin text-breezy-blue" size={24} />
        <span className="text-[14.5px] font-medium">Chargement du flux Breezy...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-breezy-gray gap-4">
        <AlertCircle size={40} className="text-red-500" />
        <p className="text-[15px] font-semibold text-breezy-dark">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-breezy-blue text-white text-[13.5px] font-bold rounded-full hover:bg-breezy-darkBlue transition"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {tweets.map((tweet) => (
        <TweetCard 
          key={tweet.id}
          tweet={tweet}
          onLike={handleLikeToggle}
          onRetweet={handleRetweetToggle}
          onFollow={handleFollowToggle}
          onDelete={handleDeleteTweet}
        />
      ))}
    </div>
  );
}