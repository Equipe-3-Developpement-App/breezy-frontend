"use client";

import React, { useState, useEffect } from "react";
import { NavBar } from "./layout/NavBar";
import { TweetCard } from "./tweets/TweetCard";
import { ConfirmationModal } from "./modals/ConfirmationModal";
import { ComposeModal } from "./modals/ComposeModal"; // Imported our reusable creation modal
import { Tweet } from "@/types";
import { getTweets, deleteTweetApi } from "@/utils/api";
import { Settings, LogOut, X, RefreshCw } from "lucide-react";
import Link from "next/link";

export function ProfileContainer() {
  const [activeTab, setActiveTab] = useState("messages");
  const [showSettings, setShowSettings] = useState(false);
  const [userTweets, setUserTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State managements for layout drawers triggers
  const [tweetToDelete, setTweetToDelete] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false); // Track the compose modal overlay visibility

  useEffect(() => {
    let isMounted = true;

    const fetchProfileTweets = async () => {
      try {
        setLoading(true);
        const data = await getTweets();
        if (isMounted) {
          const allTweets: Tweet[] = data.map((t: any) => ({
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

          const filtered = allTweets.filter(
            (tweet) => tweet.user.displayName === "Camille Roy"
          );
          setUserTweets(filtered);
        }
      } catch (err) {
        console.error("Failed to load profile stream data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfileTweets();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLikeToggle = async (tweetId: string) => {
    let updatedIsLiked = false;
    let updatedCount = 0;

    setUserTweets((current) =>
      current.map((tweet) => {
        if (tweet.id === tweetId) {
          updatedIsLiked = !tweet.isLiked;
          updatedCount = updatedIsLiked ? tweet.likeCount + 1 : tweet.likeCount - 1;
          return { ...tweet, isLiked: updatedIsLiked, likeCount: updatedCount };
        }
        return tweet;
      })
    );

    try {
      const { likeTweetApi } = await import("@/utils/api");
      await likeTweetApi(tweetId, updatedIsLiked, updatedCount);
    } catch (err) {
      console.error("Failed syncing like mutation from profile view:", err);
    }
  };

  const handleRetweetToggle = async (tweetId: string) => {
    let updatedIsRetweeted = false;
    let updatedCount = 0;

    setUserTweets((current) =>
      current.map((tweet) => {
        if (tweet.id === tweetId) {
          updatedIsRetweeted = !tweet.isRetweeted;
          updatedCount = updatedIsRetweeted ? tweet.retweetCount + 1 : tweet.retweetCount - 1;
          return { ...tweet, isRetweeted: updatedIsRetweeted, retweetCount: updatedCount };
        }
        return tweet;
      })
    );

    try {
      const { retweetTweetApi } = await import("@/utils/api");
      await retweetTweetApi(tweetId, updatedIsRetweeted, updatedCount);
    } catch (err) {
      console.error("Failed syncing retweet mutation from profile view:", err);
    }
  };

  const handleFollowToggle = (userId: string) => {
    setUserTweets((current) =>
      current.map((tweet) => {
        if (tweet.user.id === userId) {
          return { ...tweet, isFollowing: !tweet.isFollowing };
        }
        return tweet;
      })
    );
  };

  const openDeleteConfirmation = (tweetId: string) => {
    setTweetToDelete(tweetId);
  };

  const handleConfirmDelete = async () => {
    if (!tweetToDelete) return;

    try {
      setUserTweets((current) => current.filter((t) => t.id !== tweetToDelete));
      await deleteTweetApi(tweetToDelete);
    } catch (err) {
      console.error("Failed to execute background local database deletion:", err);
    } finally {
      setTweetToDelete(null);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-[68px] no-scrollbar">
        
        <div className="flex justify-between items-end px-5 pt-[35px] pb-4 w-full bg-transparent">
          <div className="w-[84px] h-[84px] shrink-0 rounded-full bg-gradient-to-br from-[#5194D6] to-[#2A2FC0] flex items-center justify-center font-bold text-white text-[33.6px] shadow-[0_0_0_4px_#FFFFFF]">
            CR
          </div>
          
          <div className="flex flex-col items-end gap-[30px] w-full max-w-[375px]">
            <button 
              type="button" 
              onClick={() => setShowSettings(true)}
              aria-label="Ouvrir les paramètres"
              className="w-[34px] h-[34px] flex items-center justify-center text-breezy-dark hover:text-breezy-blue hover:bg-white/50 rounded-full transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <Settings size={24} />
            </button>

            <button 
              type="button"
              className="w-[140px] h-[36px] border border-[#CDD9E6] bg-white hover:bg-gray-50 text-breezy-dark font-bold text-[14px] rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 select-none">
              <span>Modifier le profil</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 w-full pb-[15px]">
          <div className="flex flex-col text-left px-5">
            <h2 className="text-[21px] font-extrabold text-breezy-dark tracking-tight leading-[25px]">
              Camille Roy
            </h2>
            <p className="text-[15px] text-breezy-gray leading-[18px]">
              @camille
            </p>
          </div>

          <div className="flex flex-col gap-3.5 text-left px-5">
            <p className="text-[14.5px] text-breezy-dark leading-[22px]">
              Designer produit basée à Lyon. Je peaufine des marges et je bois du café froid.
            </p>
            
            <div className="flex items-center gap-[22px] text-[13.5px]">
              <span className="text-breezy-gray">
                <strong className="font-extrabold text-breezy-dark">312</strong> abonnements
              </span>
              <span className="text-breezy-gray">
                <strong className="font-extrabold text-breezy-dark">1 284</strong> abonnés
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-5 h-[44px] w-full bg-transparent border-b border-breezy-border-light">
          <button 
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative
              ${activeTab === "messages" ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
          >
            <span>Messages</span>
            {activeTab === "messages" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-breezy-blue" />
            )}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab("responses")}
            className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative
              ${activeTab === "responses" ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
          >
            <span>Réponses</span>
            {activeTab === "responses" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-breezy-blue" />
            )}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab("medias")}
            className={`flex-1 h-full flex flex-col justify-end items-center pb-2.5 text-[15px] cursor-pointer transition-all relative
              ${activeTab === "medias" ? "text-breezy-dark font-extrabold" : "text-breezy-gray font-semibold hover:text-breezy-dark"}`}
          >
            <span>Médias</span>
            {activeTab === "medias" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-breezy-blue" />
            )}
          </button>
        </div>

        <div className="w-full text-left">
          {activeTab === "messages" && (
            loading ? (
              <div className="flex items-center justify-center p-8 text-breezy-gray gap-3">
                <RefreshCw className="animate-spin text-breezy-blue" size={18} />
              </div>
            ) : userTweets.length > 0 ? (
              userTweets.map((tweet) => (
                <TweetCard
                  key={tweet.id}
                  tweet={tweet}
                  onLike={handleLikeToggle}
                  onRetweet={handleRetweetToggle}
                  onFollow={handleFollowToggle}
                  onDelete={openDeleteConfirmation}
                />
              ))
            ) : (
              <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucun message à afficher.</div>
            )
          )}

          {activeTab === "responses" && (
            <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucune réponse à afficher.</div>
          )}

          {activeTab === "medias" && (
            <div className="text-center p-8 text-breezy-gray text-[14.5px]">Aucun média disponible.</div>
          )}
        </div>
      </div>

      {/* Button floating trigger wired up with the component hook toggle */}
      <button 
        type="button"
        onClick={() => setShowCompose(true)}
        aria-label="Créer un tweet"
        className="absolute bottom-24 right-6 w-[56px] h-[56px] bg-breezy-blue hover:bg-breezy-darkBlue text-white rounded-full flex items-center justify-center shadow-xl z-30 font-bold text-2xl cursor-pointer transition-all active:scale-95 select-none"
      >
        +
      </button>

      <NavBar activePage="profile" />

      {/* Reusable Core Native App Modal Layer Rendering Block */}
      <ConfirmationModal
        isOpen={tweetToDelete !== null}
        title="Supprimer le message ?"
        message="Cette action est irréversible. Le message sera définitivement retiré du flux."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTweetToDelete(null)}
      />

      {/* Reusable Compose Modal Rendering Block */}
      {showCompose && (
        <ComposeModal onClose={() => setShowCompose(false)} />
      )}

      {showSettings && (
        <>
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity duration-300"
            onClick={() => setShowSettings(false)}
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pb-8 z-[60] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-[19px] font-extrabold text-breezy-dark">Options</h3>
              <button 
                type="button" 
                onClick={() => setShowSettings(false)}
                aria-label="Fermer les options"
                className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-breezy-gray cursor-pointer transition-colors border-none"  
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col w-full pt-1">
              <Link 
                href="/login"
                className="flex items-center gap-4 w-full p-4 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl transition-all cursor-pointer select-none group"
              >
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-bold text-[16px]">Se déconnecter</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}