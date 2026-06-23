"use client";

import React, { useState, useEffect } from "react";
import { TweetCard } from "./TweetCard";
import { ConfirmationModal } from "../modals/ConfirmationModal";
import { ComposeModal } from "../modals/ComposeModal";
import { Tweet } from "@/types";
import { getTweets, deleteTweetApi, getCurrentUserProfile, UserProfile } from "@/utils/api";
import { AlertCircle, RefreshCw } from "lucide-react";

export function TweetList() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [tweetToEdit, setTweetToEdit] = useState<Tweet | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [user, data] = await Promise.all([
          getCurrentUserProfile(),
          getTweets()
        ]);
        
        if (isMounted) {
          setCurrentUser(user);
          const filteredTweets = data.filter(t => t.user.id !== user?.id_auth?.toString());
          setTweets(filteredTweets);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Impossible de charger les messages. Vérifiez votre connexion.");
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, []);

  const handleLikeToggle = async (tweetId: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;
    setTweets((currentTweets) => currentTweets.map((tweet) => {
      if (tweet.id === tweetId) {
        updatedIsLiked = !tweet.isLiked;
        updatedCount = updatedIsLiked ? tweet.likeCount + 1 : Math.max(0, tweet.likeCount - 1);
        return { ...tweet, isLiked: updatedIsLiked, likeCount: updatedCount };
      }
      return tweet;
    }));
    try {
      const { likeTweetApi } = await import("@/utils/api");
      await likeTweetApi(tweetId, updatedIsLiked, updatedCount);
    } catch (err) { console.error(err); }
  };

  const handleFollowToggle = async (userId: string) => {
    const target = tweets.find(t => t.user.id === userId);
    if (!target) return;
    const isCurrentlyFollowing = target.isFollowing;

    setTweets((current) => current.map((tweet) => {
      if (tweet.user.id === userId) return { ...tweet, isFollowing: !isCurrentlyFollowing };
      return tweet;
    }));

    try {
      const { followUserApi, unfollowUserApi } = await import("@/utils/api");
      if (isCurrentlyFollowing) {
        await unfollowUserApi(userId);
      } else {
        await followUserApi(userId);
      }
    } catch (err) {
      setTweets((current) => current.map((tweet) => {
        if (tweet.user.id === userId) return { ...tweet, isFollowing: isCurrentlyFollowing };
        return tweet;
      }));
    }
  };

  const openDeleteConfirmation = (tweetId: string) => setTweetToDelete(tweetId);

  const handleConfirmDelete = async () => {
    if (!tweetToDelete) return;
    try {
      setTweets((currentTweets) => currentTweets.filter((tweet) => tweet.id !== tweetToDelete));
      await deleteTweetApi(tweetToDelete);
    } catch (err) { console.error(err); } finally { setTweetToDelete(null); }
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
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-breezy-blue text-white text-[13.5px] font-bold rounded-full hover:bg-breezy-darkBlue transition">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
      {tweets.map((tweet) => (
        <TweetCard 
          key={tweet.id}
          tweet={tweet}
          onLike={handleLikeToggle}
          onFollow={handleFollowToggle}
          onDelete={openDeleteConfirmation}
          onEdit={setTweetToEdit}
          isOwnTweet={currentUser?.id_auth?.toString() === tweet.user.id} 
        />
      ))}

      <ConfirmationModal isOpen={tweetToDelete !== null} title="Supprimer le message ?" message="Cette action est irréversible. Le message sera définitivement retiré du flux." confirmLabel="Supprimer" cancelLabel="Annuler" onConfirm={handleConfirmDelete} onCancel={() => setTweetToDelete(null)} />
      
      {tweetToEdit && <ComposeModal onClose={() => { setTweetToEdit(null); window.location.reload(); }} tweetToEdit={tweetToEdit} />}
    </div>
  );
}