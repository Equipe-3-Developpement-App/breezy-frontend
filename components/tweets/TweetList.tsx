"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TweetCard } from "./TweetCard";
import { ConfirmationModal } from "../modals/ConfirmationModal";
import { ComposeModal } from "../modals/ComposeModal";
import { Tweet } from "@/types";
import {
  getTweets,
  getExploreTweets,
  deleteTweetApi,
  getCurrentUserProfile,
  UserProfile,
} from "@/utils/api";
import { AlertCircle, RefreshCw, ChevronDown } from "lucide-react";

interface TweetListProps {
  mode: "following" | "explore";
}

const PAGE_SIZE = 15;

export function TweetList({ mode }: TweetListProps) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [tweetToEdit, setTweetToEdit] = useState<Tweet | null>(null);

  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setOffset(0);

      const user = await getCurrentUserProfile();
      setCurrentUser(user);

      if (mode === "following") {
        const data = await getTweets();
        setTweets(data.filter((t) => t.user.id !== user?.id_auth?.toString()));
        setHasMore(false);
      } else {
        const { tweets: data, hasMore: more } = await getExploreTweets(PAGE_SIZE, 0);
        setTweets(data);
        setHasMore(more);
        setOffset(PAGE_SIZE);
      }
    } catch {
      setError("Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const { tweets: more, hasMore: stillMore } = await getExploreTweets(PAGE_SIZE, offset);
      setTweets((prev) => [
        ...prev,
        ...more.filter((t) => !prev.some((p) => p.id === t.id)),
      ]);
      setHasMore(stillMore);
      setOffset((o) => o + PAGE_SIZE);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLikeToggle = async (tweetId: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;
    setTweets((current) =>
      current.map((t) => {
        if (t.id === tweetId) {
          updatedIsLiked = !t.isLiked;
          updatedCount = updatedIsLiked ? t.likeCount + 1 : Math.max(0, t.likeCount - 1);
          return { ...t, isLiked: updatedIsLiked, likeCount: updatedCount };
        }
        return t;
      })
    );
    try {
      const { likeTweetApi } = await import("@/utils/api");
      await likeTweetApi(tweetId, updatedIsLiked, updatedCount);
    } catch {}
  };

  const handleFollowToggle = async (userId: string) => {
    const target = tweets.find((t) => t.user.id === userId);
    if (!target) return;
    const isCurrentlyFollowing = target.isFollowing;
    setTweets((current) =>
      current.map((t) =>
        t.user.id === userId ? { ...t, isFollowing: !isCurrentlyFollowing } : t
      )
    );
    try {
      const { followUserApi, unfollowUserApi } = await import("@/utils/api");
      if (isCurrentlyFollowing) await unfollowUserApi(userId);
      else await followUserApi(userId);
    } catch {
      setTweets((current) =>
        current.map((t) =>
          t.user.id === userId ? { ...t, isFollowing: isCurrentlyFollowing } : t
        )
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!tweetToDelete) return;
    try {
      const targetTweet = tweets.find((t) => t.id === tweetToDelete);
      const hasComments = targetTweet ? targetTweet.commentCount > 0 : false;
      setTweets((current) => {
        if (hasComments)
          return current.map((t) =>
            t.id === tweetToDelete
              ? { ...t, content: "[Ce message a été supprimé par son auteur]", media: null, tags: [] }
              : t
          );
        return current.filter((t) => t.id !== tweetToDelete);
      });
      await deleteTweetApi(tweetToDelete);
    } catch {} finally {
      setTweetToDelete(null);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-8 text-breezy-gray gap-3">
        <RefreshCw className="animate-spin text-breezy-blue" size={24} />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-breezy-gray gap-4">
        <AlertCircle size={40} className="text-red-500" />
        <button
          onClick={fetchInitial}
          className="px-4 py-2 bg-breezy-blue text-white rounded-full"
        >
          Réessayer
        </button>
      </div>
    );

  return (
    <div className="w-full pb-24 md:pb-6">
      {tweets.map((tweet) => (
        <TweetCard
          key={tweet.id}
          tweet={tweet}
          onLike={handleLikeToggle}
          onFollow={handleFollowToggle}
          onDelete={setTweetToDelete}
          onEdit={setTweetToEdit}
          isOwnTweet={currentUser?.id_auth?.toString() === tweet.user.id}
        />
      ))}

      {mode === "explore" && hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="flex items-center justify-center gap-2 w-full py-4 text-[#2A6FDB] font-semibold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 border-none cursor-pointer"
        >
          {loadingMore ? (
            <RefreshCw className="animate-spin" size={16} />
          ) : (
            <>
              <ChevronDown size={16} />
              Charger plus de posts
            </>
          )}
        </button>
      )}

      {mode === "explore" && !hasMore && tweets.length > 0 && (
        <p className="text-center text-xs text-breezy-gray py-6">
          Vous avez tout vu
        </p>
      )}

      <ConfirmationModal
        isOpen={tweetToDelete !== null}
        title="Supprimer ?"
        message="Irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setTweetToDelete(null)}
      />
      {tweetToEdit && (
        <ComposeModal
          onClose={() => {
            setTweetToEdit(null);
            window.location.reload();
          }}
          tweetToEdit={tweetToEdit}
        />
      )}
    </div>
  );
}