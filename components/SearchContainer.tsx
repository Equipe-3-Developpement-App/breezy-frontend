"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { NavBar } from "./layout/NavBar";
import { TweetCard } from "./tweets/TweetCard";
import { UserCard } from "./users/UserCard";
import { ConfirmationModal } from "./modals/ConfirmationModal";
import { ComposeModal } from "./modals/ComposeModal";
import { Tweet, User } from "@/types";
import { searchTweetsByTag, searchUsersApi, toggleFollowApi, getCurrentUserProfile, UserProfile, getFollowingIds, deleteTweetApi } from "@/utils/api";
import { Search, Hash, RefreshCw, X } from "lucide-react";

export function SearchContainer() {
  const searchParams = useSearchParams();
  const tagFromUrl = searchParams.get("tag") || "";

  const [query, setQuery] = useState(tagFromUrl);
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  
  const [postResults, setPostResults] = useState<Tweet[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [tweetToEdit, setTweetToEdit] = useState<Tweet | null>(null); 

  const trendingTags = ["design", "nextjs", "breezy", "frontend", "dev", "mobile"];

  useEffect(() => {
    setQuery(tagFromUrl);
    if (tagFromUrl) setActiveTab("posts");
  }, [tagFromUrl]);

  useEffect(() => {
    const initProfile = async () => {
      const user = await getCurrentUserProfile();
      setCurrentUser(user);
      if (user) {
        const followIds = await getFollowingIds(user.id_auth);
        const initialMap: Record<string, boolean> = {};
        followIds.forEach(id => { initialMap[id] = true; });
        setFollowingMap(initialMap);
      }
    };
    initProfile();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      if (!query.trim()) {
        setPostResults([]);
        setUserResults([]);
        return;
      }
      
      setLoading(true);
      try {
        if (activeTab === "posts") {
          const data = await searchTweetsByTag(query);
          if (isMounted) setPostResults(data);
        } else {
          const data = await searchUsersApi(query);
          if (isMounted) setUserResults(data);
        }
      } catch (err) {
        console.error("Erreur de recherche :", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [query, activeTab]);

  const handleLikeToggle = async (tweetId: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;
    setPostResults((current) => current.map((tweet) => {
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

  const handlePostFollowToggle = async (userId: string) => {
    const target = postResults.find(t => t.user.id === userId);
    if (!target) return;
    const isCurrentlyFollowing = target.isFollowing;

    setPostResults((current) => current.map((tweet) => {
      if (tweet.user.id === userId) return { ...tweet, isFollowing: !isCurrentlyFollowing };
      return tweet;
    }));
    try {
      await toggleFollowApi(userId, isCurrentlyFollowing || false);
    } catch (err) {
      setPostResults((current) => current.map((tweet) => {
        if (tweet.user.id === userId) return { ...tweet, isFollowing: isCurrentlyFollowing };
        return tweet;
      }));
    }
  };

  const handleUserFollowToggle = async (userId: string) => {
    const isCurrentlyFollowing = followingMap[userId] || false;
    setFollowingMap(prev => ({ ...prev, [userId]: !isCurrentlyFollowing }));
    
    try {
      await toggleFollowApi(userId, isCurrentlyFollowing);
    } catch (error) {
      console.error("Erreur lors de l'abonnement", error);
      setFollowingMap(prev => ({ ...prev, [userId]: isCurrentlyFollowing }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!tweetToDelete) return;
    try {
      setPostResults((current) => current.filter((t) => t.id !== tweetToDelete));
      await deleteTweetApi(tweetToDelete);
    } catch (err) { console.error(err); } finally { setTweetToDelete(null); }
  };

  return (
    <div className="w-full min-h-screen">

      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-breezy-border-light">
        <div className="relative flex items-center w-[90%] mx-auto h-[40px] bg-gray-100 rounded-full px-4 border border-transparent focus-within:border-breezy-blue transition-colors mt-[35px] mb-3">
          <Search size={18} className="text-breezy-gray shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === "posts" ? "Rechercher un tag..." : "Rechercher un utilisateur..."}
            className="flex-1 bg-transparent border-none outline-none ml-3 text-[15px] text-breezy-dark placeholder-breezy-gray/70"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full text-breezy-gray cursor-pointer transition-colors border-none flex"
              aria-label="Effacer la recherche"
              title="Effacer la recherche"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex justify-between items-center w-full h-[44px]">
          <button 
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative border-none bg-transparent ${activeTab === "posts" ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
          >
            <span>Posts</span>
            {activeTab === "posts" && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-breezy-blue rounded-t-full" />}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative border-none bg-transparent ${activeTab === "users" ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
          >
            <span>Utilisateurs</span>
            {activeTab === "users" && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-breezy-blue rounded-t-full" />}
          </button>
        </div>
      </div>

      <div className="w-full text-left pb-24 md:pb-6">

        {query.trim() && loading && (
          <div className="flex justify-center p-8">
            <RefreshCw className="animate-spin text-breezy-blue" size={24} />
          </div>
        )}

        {activeTab === "posts" && query.trim() && !loading && postResults.length > 0 && (
          <div className="flex flex-col">
            {postResults.map((tweet) => (
              <TweetCard 
                key={tweet.id} 
                tweet={tweet} 
                onLike={handleLikeToggle} 
                onFollow={handlePostFollowToggle} 
                onDelete={() => setTweetToDelete(tweet.id)}
                onEdit={setTweetToEdit}
                isOwnTweet={currentUser?.id_auth?.toString() === tweet.user.id}
              />
            ))}
          </div>
        )}

        {activeTab === "users" && query.trim() && !loading && userResults.length > 0 && (
          <div className="flex flex-col">
            {userResults.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isFollowing={followingMap[user.id] || false}
                onFollow={handleUserFollowToggle}
                isCurrentUser={currentUser?.id_auth?.toString() === user.id}
              />
            ))}
          </div>
        )}

        {query.trim() && !loading && ((activeTab === "posts" && postResults.length === 0) || (activeTab === "users" && userResults.length === 0)) && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-breezy-gray gap-2">
            <Search size={40} className="text-gray-300 opacity-50" />
            <p className="text-[15px] font-semibold text-breezy-dark">Aucun résultat pour "{query}"</p>
          </div>
        )}

        {!query.trim() && activeTab === "posts" && (
          <div className="p-5 flex flex-col gap-4">
            <h2 className="font-extrabold text-[19px] text-breezy-dark tracking-tight">Tendances</h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <button key={tag} type="button" onClick={() => setQuery(tag)} className="flex items-center gap-1 px-4 py-2 bg-white border border-breezy-border-light rounded-full text-[14.5px] font-bold text-breezy-blue hover:bg-blue-50 transition-colors cursor-pointer border-none shadow-sm">
                  <Hash size={16} /> {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <NavBar activePage="search" />

      <ConfirmationModal isOpen={tweetToDelete !== null} title="Supprimer le message ?" message="Cette action est irréversible." confirmLabel="Supprimer" cancelLabel="Annuler" onConfirm={handleConfirmDelete} onCancel={() => setTweetToDelete(null)} />
      {tweetToEdit && <ComposeModal onClose={() => { setTweetToEdit(null); window.location.reload(); }} tweetToEdit={tweetToEdit} />}
    </div>
  );
}