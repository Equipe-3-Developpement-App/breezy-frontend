"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { NavBar } from "./layout/NavBar";
import { TweetCard } from "./tweets/TweetCard";
import { UserCard } from "./users/UserCard";
import { Tweet, User } from "@/types";
import { searchTweetsByTag, searchUsersApi, toggleFollowApi } from "@/utils/api";
import { Search, Hash, RefreshCw, X } from "lucide-react";

export function SearchContainer() {
  const searchParams = useSearchParams();
  const tagFromUrl = searchParams.get("tag") || "";

  const [query, setQuery] = useState(tagFromUrl);
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  
  const [postResults, setPostResults] = useState<Tweet[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  // On gère un état local pour les suivis afin d'éviter un rechargement complet
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  
  const [loading, setLoading] = useState(false);

  const trendingTags = ["design", "nextjs", "breezy", "frontend", "dev", "mobile"];

  useEffect(() => {
    setQuery(tagFromUrl);
    if (tagFromUrl) setActiveTab("posts");
  }, [tagFromUrl]);

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

  const handleToggleFollow = async (userId: string) => {
    // Mise à jour optimiste de l'UI
    const isCurrentlyFollowing = followingMap[userId] || false;
    setFollowingMap(prev => ({ ...prev, [userId]: !isCurrentlyFollowing }));
    
    try {
      await toggleFollowApi(userId, isCurrentlyFollowing);
    } catch (error) {
      // En cas d'erreur, on annule l'action dans l'UI
      console.error("Erreur lors de l'abonnement", error);
      setFollowingMap(prev => ({ ...prev, [userId]: isCurrentlyFollowing }));
    }
  };

  const handleNoop = () => {};

  return (
    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-breezy-bgLight">

      <header className="px-[18px] pt-[35px] bg-white border-b border-breezy-border-light z-10 shrink-0">
        <div className="relative flex items-center w-full h-[40px] bg-gray-100 rounded-full px-4 border border-transparent focus-within:border-breezy-blue transition-colors mb-3">
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
              className="p-1 bg-gray-200 hover:bg-gray-300 rounded-full text-breezy-gray cursor-pointer transition-colors border-none"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Onglets de navigation */}
        <div className="flex justify-between items-center w-full h-[44px]">
          <button 
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative ${activeTab === "posts" ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
          >
            <span>Posts</span>
            {activeTab === "posts" && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-breezy-blue rounded-t-full" />}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative ${activeTab === "users" ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
          >
            <span>Utilisateurs</span>
            {activeTab === "users" && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-breezy-blue rounded-t-full" />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-[68px] no-scrollbar">

        {/* État : Chargement */}
        {query.trim() && loading && (
          <div className="flex justify-center p-8">
            <RefreshCw className="animate-spin text-breezy-blue" size={24} />
          </div>
        )}

        {/* RÉSULTATS : POSTS */}
        {activeTab === "posts" && query.trim() && !loading && postResults.length > 0 && (
          <div className="flex flex-col">
            {postResults.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} onLike={handleNoop} onRetweet={handleNoop} onFollow={handleNoop} />
            ))}
          </div>
        )}

        {/* RÉSULTATS : UTILISATEURS */}
        {activeTab === "users" && query.trim() && !loading && userResults.length > 0 && (
          <div className="flex flex-col">
            {userResults.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isFollowing={followingMap[user.id] || false}
                onFollow={handleToggleFollow}
              />
            ))}
          </div>
        )}

        {/* État : Aucun résultat */}
        {query.trim() && !loading && ((activeTab === "posts" && postResults.length === 0) || (activeTab === "users" && userResults.length === 0)) && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-breezy-gray gap-2">
            <Search size={40} className="text-gray-300 opacity-50" />
            <p className="text-[15px] font-semibold text-breezy-dark">Aucun résultat pour "{query}"</p>
          </div>
        )}

        {/* Tendances (affichées uniquement si l'input est vide et sur l'onglet posts) */}
        {!query.trim() && activeTab === "posts" && (
          <div className="p-5 flex flex-col gap-4">
            <h2 className="font-extrabold text-[19px] text-breezy-dark tracking-tight">Tendances</h2>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-breezy-border-light rounded-full text-[14.5px] font-bold text-breezy-blue hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Hash size={16} /> {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <NavBar activePage="search" />
    </div>
  );
}