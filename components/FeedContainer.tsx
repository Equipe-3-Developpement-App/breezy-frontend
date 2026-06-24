"use client";

import React, { useState, useEffect } from "react";
import { TweetList } from "./tweets/TweetList";
import { NavBar } from "./layout/NavBar";
import { ComposeModal } from "./modals/ComposeModal";
import { Wind } from "lucide-react"; 
import { getCurrentUserProfile, UserProfile } from "@/utils/api";

export function FeedContainer() {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"following" | "explore">("following");

  useEffect(() => {
    getCurrentUserProfile().then(setCurrentUser);
  }, []);

  return (
    <div className="w-full min-h-screen">
      <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-breezy-border-light">
        <header className="md:hidden flex justify-between items-center px-[18px] pt-[35px] pb-[20px] w-full">
          <div className="flex items-baseline">
            <span className="text-[26px] font-extrabold text-[#16212E] tracking-tight leading-none">Breez</span>
            <img 
              src="/breezy-icon.png" 
              alt="y" 
              className="w-auto h-[28px] object-contain -ml-[1px] translate-y-[2px]" 
            />
          </div>
        </header>

        <div onClick={() => setIsComposeOpen(true)} className="flex items-start p-4 gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors">
          {currentUser?.avatar_url ? (
            <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-[42px] h-[42px] shrink-0 rounded-full bg-gradient-to-br from-[#D2D2D2] to-[#767676] flex items-center justify-center font-bold text-white text-[16px] overflow-hidden">
              {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : ""}
            </div>
          )}
          <div className="flex-1 pt-2">
            <span className="text-[15px] text-[#9AABBF]">Comment ça va ?</span>
          </div>
        </div>

        <div className="flex w-full border-t border-breezy-border-light bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-none bg-transparent cursor-pointer ${
              activeTab === "following"
                ? "text-[#2A6FDB] border-b-2 border-b-breezy-blue"
                : "text-[#9AABBF] hover:text-[#5C708A]"
            }`}
          >
            Pour vous
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("explore")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors border-none bg-transparent cursor-pointer ${
              activeTab === "explore"
                ? "text-[#2A6FDB] border-b-2 border-b-breezy-blue"
                : "text-[#9AABBF] hover:text-[#5C708A]"
            }`}
          >
            Explorer
          </button>
        </div>
      </div>

      <TweetList mode={activeTab} key={activeTab} />

      <button 
        type="button" 
        onClick={() => setIsComposeOpen(true)}
        aria-label="Nouveau post"
        title="Nouveau post"
        className="md:hidden fixed bottom-24 right-6 w-[56px] h-[56px] bg-breezy-blue text-white rounded-full flex items-center justify-center shadow-xl z-30 font-bold text-2xl cursor-pointer border-none"
      >
        +
      </button>

      <NavBar activePage="home" />

      {isComposeOpen && <ComposeModal onClose={() => setIsComposeOpen(false)} />}
    </div>
  );
}